import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, getOrCreateUser } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user has a password set
    if (!user.passwordHash) {
      return NextResponse.json({ 
        error: 'No password set. Please contact an administrator to set your password.' 
      }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session user
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map(ur => ur.role),
    };

    const sessionId = createSession(sessionUser);

    // Create audit log
    try {
      await createAuditLog({
        actorId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        metadata: JSON.stringify({ email, method: 'password' }),
      });
    } catch (auditError) {
      console.error('Audit log error (non-fatal):', auditError);
    }

    // Set session cookie
    const cookieStore = await cookies();
    const response = NextResponse.json({ 
      success: true,
      user: sessionUser,
    });
    
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
