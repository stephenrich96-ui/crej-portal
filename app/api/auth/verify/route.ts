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

    try {
      await createAuditLog({
        actorId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        metadata: JSON.stringify({ email }),
      });
    } catch (auditError) {
      // Don't fail login if audit log fails
      console.error('Audit log error (non-fatal):', auditError);
    }

    // Set session cookie
    const cookieStore = await cookies();
    const response = NextResponse.redirect(
      new URL(user.roles && user.roles.length > 0 ? '/' : '/select-role', request.nextUrl.origin)
    );
    
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying magic link:', error);
    console.error('Error details:', error.stack);
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(new URL(`/login?error=verification_failed&details=${encodeURIComponent(error.message)}`, baseUrl));
  }
}
