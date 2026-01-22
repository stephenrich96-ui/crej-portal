import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession, deleteSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roles } = body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: 'At least one role is required' }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'HRSS_STAFF', 'EPAS_STAFF', 'DSP', 'TRAINER'];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
      }
    }

    // Delete existing roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // Create new roles
    await prisma.userRole.createMany({
      data: roles.map((role: string) => ({
        userId: user.id,
        role,
      })),
    });

    await createAuditLog({
      actorId: user.id,
      action: 'ROLES_SELECTED',
      entityType: 'User',
      entityId: user.id,
      metadata: JSON.stringify({ roles }),
    });

    // Update the session with new roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true,
      },
    });

    if (updatedUser) {
      const updatedSessionUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        roles: updatedUser.roles.map(ur => ur.role),
      };

      // Delete old session and create new one with updated roles
      deleteSession(sessionId);
      const newSessionId = createSession(updatedSessionUser);
      
      // Update cookie with new session
      cookieStore.set('session', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
