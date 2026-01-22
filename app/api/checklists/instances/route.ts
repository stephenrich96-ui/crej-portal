import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { isPHI } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { checklistId, label, notes } = body;

    if (!checklistId || !label) {
      return NextResponse.json(
        { error: 'checklistId and label are required' },
        { status: 400 }
      );
    }

    // Check for PHI
    if (isPHI(label) || (notes && isPHI(notes))) {
      return NextResponse.json(
        { error: 'Label or notes may contain client information. Use generic labels only.' },
        { status: 400 }
      );
    }

    // Verify checklist exists
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    const instance = await prisma.checklistInstance.create({
      data: {
        checklistId,
        userId: session.id,
        label: label.trim(),
        notes: notes?.trim() || null,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CHECKLIST_INSTANCE_CREATED',
      entityType: 'ChecklistInstance',
      entityId: instance.id,
      metadata: JSON.stringify({ checklistId, label }),
    });

    return NextResponse.json({ instanceId: instance.id });
  } catch (error) {
    console.error('Error creating checklist instance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
