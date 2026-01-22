import { NextRequest, NextResponse } from 'next/server';
import { generateMagicLinkToken, isValidEmail } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: `Email must end with ${process.env.ALLOWED_EMAIL_DOMAIN || '@crejllc.net'}` },
        { status: 400 }
      );
    }

    const token = await generateMagicLinkToken(email);

    // In production, send email with magic link
    // For now, return token (remove in production!)
    // Get the base URL from the request
    const baseUrl = request.nextUrl.origin;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    if (process.env.NODE_ENV === 'development') {
      // In dev, return the link directly (REMOVE IN PRODUCTION!)
      return NextResponse.json({ 
        magicLink, 
        message: 'DEV MODE: Use this link to login. In production, check your email.' 
      });
    }

    // TODO: Send email with magic link
    // await sendMagicLinkEmail(email, magicLink);

    await createAuditLog({
      action: 'MAGIC_LINK_REQUESTED',
      entityType: 'User',
      metadata: JSON.stringify({ email }),
    });

    return NextResponse.json({ 
      message: 'Check your email for the magic link' 
    });
  } catch (error: any) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate magic link' },
      { status: 500 }
    );
  }
}
