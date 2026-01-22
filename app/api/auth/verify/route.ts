import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, getOrCreateUser, createSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      const baseUrl = request.nextUrl.origin;
      return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl));
    }

    const email = await verifyMagicLinkToken(token);

    if (!email) {
      const baseUrl = request.nextUrl.origin;
      return NextResponse.redirect(new URL('/login?error=invalid_or_expired', baseUrl));
    }

    const user = await getOrCreateUser(email);
    const sessionId = createSession(user);

    await createAuditLog({
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: JSON.stringify({ email }),
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect based on whether user has selected roles
    const baseUrl = request.nextUrl.origin;
    if (!user.roles || user.roles.length === 0) {
      return NextResponse.redirect(new URL('/select-role', baseUrl));
    }

    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (error: any) {
    console.error('Error verifying magic link:', error);
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/login?error=verification_failed', baseUrl));
  }
}
