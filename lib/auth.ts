import { prisma } from './db';
import { createAuditLog } from './audit';
import crypto from 'crypto';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@crejllc.net';
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'dev-secret-change-in-production';
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[]; // Array of roles
}

/**
 * Validate email domain
 */
export function isValidEmail(email: string): boolean {
  return email.endsWith(ALLOWED_DOMAIN);
}

/**
 * Generate magic link token
 */
export async function generateMagicLinkToken(email: string): Promise<string> {
  if (!isValidEmail(email)) {
    throw new Error(`Email must end with ${ALLOWED_DOMAIN}`);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY);

  await prisma.magicLinkToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify magic link token
 */
export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  const magicLink = await prisma.magicLinkToken.findUnique({
    where: { token },
  });

  if (!magicLink) {
    return null;
  }

  if (magicLink.used) {
    return null;
  }

  if (magicLink.expiresAt < new Date()) {
    return null;
  }

  // Mark as used
  await prisma.magicLinkToken.update({
    where: { id: magicLink.id },
    data: { used: true },
  });

  return magicLink.email;
}

/**
 * Get or create user
 */
export async function getOrCreateUser(email: string, name?: string): Promise<SessionUser> {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    });

    await createAuditLog({
      actorId: user.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      metadata: JSON.stringify({ email }),
    });
  }

  // Get user roles
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    select: { role: true },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: userRoles.map(ur => ur.role),
  };
}

/**
 * Simple session management (in production, use proper session store)
 * Using global to persist across module reloads
 */
if (!(global as any).__sessions) {
  (global as any).__sessions = new Map<string, { user: SessionUser; expiresAt: Date }>();
}
const sessions = (global as any).__sessions as Map<string, { user: SessionUser; expiresAt: Date }>;

export function createSession(user: SessionUser): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  sessions.set(sessionId, { user, expiresAt });

  // Clean up expired sessions periodically
  setTimeout(() => {
    sessions.delete(sessionId);
  }, 7 * 24 * 60 * 60 * 1000);

  return sessionId;
}

export function getSession(sessionId: string): SessionUser | null {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return null;
  }

  return session.user;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
