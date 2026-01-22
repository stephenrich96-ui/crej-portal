import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instanceId, itemId } = await params;

    // Verify instance belongs to user
    const instance = await prisma.checklistInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance || instance.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already completed
    const existing = await prisma.checklistItemCompletion.findUnique({
      where: {
        checklistItemId_checklistInstanceId: {
          checklistItemId: itemId,
          checklistInstanceId: instanceId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already completed' });
    }

    await prisma.checklistItemCompletion.create({
      data: {
        checklistItemId: itemId,
        checklistInstanceId: instanceId,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CHECKLIST_ITEM_COMPLETED',
      entityType: 'ChecklistItemCompletion',
      metadata: JSON.stringify({ instanceId, itemId }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing checklist item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string; itemId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instanceId, itemId } = await params;

    // Verify instance belongs to user
    const instance = await prisma.checklistInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance || instance.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.checklistItemCompletion.deleteMany({
      where: {
        checklistItemId: itemId,
        checklistInstanceId: instanceId,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CHECKLIST_ITEM_UNCOMPLETED',
      entityType: 'ChecklistItemCompletion',
      metadata: JSON.stringify({ instanceId, itemId }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uncompleting checklist item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
