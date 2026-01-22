import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { canManageContent } from '@/lib/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !canManageContent(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        contentItem: true,
        requirements: true,
      },
    });

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    return NextResponse.json({ training });
  } catch (error) {
    console.error('Error fetching training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !canManageContent(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, program, videoUrl, documentUrl, contentItemId, requiredRoles } = body;

    // Update training
    const training = await prisma.training.update({
      where: { id },
      data: {
        title,
        description: description || null,
        program,
        videoUrl: videoUrl || null,
        documentUrl: documentUrl || null,
        contentItemId: contentItemId || null,
      },
    });

    // REQUIRE requirements - trainings must have at least one role requirement
    if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return NextResponse.json(
        { error: 'At least one required role must be specified. Trainings must be required for specific roles.' },
        { status: 400 }
      );
    }

    // Update requirements
    await prisma.trainingRequirement.deleteMany({
      where: { trainingId: id },
    });

    // Create new requirements
    for (const role of requiredRoles) {
      await prisma.trainingRequirement.create({
        data: {
          trainingId: id,
          role,
        },
      });
    }

    await createAuditLog({
      actorId: session.id,
      action: 'TRAINING_UPDATED',
      entityType: 'Training',
      entityId: id,
      metadata: JSON.stringify({ title, program }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !canManageContent(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.training.delete({
      where: { id },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'TRAINING_DELETED',
      entityType: 'Training',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
