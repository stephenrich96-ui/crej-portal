import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    // Check if already completed
    const existing = await prisma.trainingCompletion.findUnique({
      where: {
        userId_trainingId: {
          userId: session.id,
          trainingId: training.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already completed' });
    }

    await prisma.trainingCompletion.create({
      data: {
        userId: session.id,
        trainingId: id,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'TRAINING_COMPLETED',
      entityType: 'Training',
      entityId: id,
      metadata: JSON.stringify({ trainingTitle: training.title }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
