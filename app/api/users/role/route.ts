import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { cookies } from 'next/headers';
// UserRole is now a string

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
    const { role } = body;

    const validRoles = ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'HRSS_STAFF', 'EPAS_STAFF', 'DSP', 'TRAINER'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    await createAuditLog({
      actorId: user.id,
      action: 'ROLE_SELECTED',
      entityType: 'User',
      entityId: user.id,
      metadata: JSON.stringify({ role }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
