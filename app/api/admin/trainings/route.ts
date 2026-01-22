import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { canManageContent } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !canManageContent(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, program, videoUrl, documentUrl, contentItemId, requiredRoles } = body;

    if (!title || !program) {
      return NextResponse.json({ error: 'Title and program are required' }, { status: 400 });
    }

    const training = await prisma.training.create({
      data: {
        title,
        description: description || null,
        program,
        videoUrl: videoUrl || null,
        documentUrl: documentUrl || null,
        contentItemId: contentItemId || null,
        order: 0,
      },
    });

    // REQUIRE requirements - trainings must have at least one role requirement
    if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return NextResponse.json(
        { error: 'At least one required role must be specified. Trainings must be required for specific roles.' },
        { status: 400 }
      );
    }

    // Create requirements
    for (const role of requiredRoles) {
      await prisma.trainingRequirement.create({
        data: {
          trainingId: training.id,
          role,
        },
      });
    }

    await createAuditLog({
      actorId: session.id,
      action: 'TRAINING_CREATED',
      entityType: 'Training',
      entityId: training.id,
      metadata: JSON.stringify({ title, program }),
    });

    return NextResponse.json({ id: training.id });
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
