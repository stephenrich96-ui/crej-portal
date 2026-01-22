import { cookies } from 'next/headers';
import { getSession } from './auth';
import { prisma } from './db';

export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) {
    return null;
  }

  const session = getSession(sessionId);
  
  // If session exists but roles might be stale, refresh from DB
  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        roles: true,
      },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        roles: dbUser.roles.map(ur => ur.role),
      };
    }
  }

  return session;
}
