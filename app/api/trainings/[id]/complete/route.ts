import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

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

    // Check if training exists
    const training = await prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    // Check if already completed
    const existing = await prisma.trainingCompletion.findFirst({
      where: {
        trainingId: id,
        userId: session.id,
      },
    });

    let completion;
    if (existing) {
      // Already completed - return existing
      completion = existing;
    } else {
      // Create new completion
      completion = await prisma.trainingCompletion.create({
        data: {
          trainingId: id,
          userId: session.id,
          completedAt: new Date(),
        },
      });

      // Create audit log (don't fail if this fails)
      try {
        await createAuditLog({
          actorId: session.id,
          action: 'TRAINING_COMPLETED',
          entityType: 'Training',
          entityId: id,
          metadata: { trainingTitle: training.title },
        });
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
        // Continue even if audit logging fails
      }
    }

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error('Error completing training:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
