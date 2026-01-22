import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const codeBlock = await (prisma as any).customCodeBlock.findUnique({
      where: { id },
    });

    if (!codeBlock) {
      return NextResponse.json({ error: 'Code block not found' }, { status: 404 });
    }

    return NextResponse.json(codeBlock);
  } catch (error: any) {
    console.error('Error fetching code block:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, code, pagePath, position, order, isActive } = body;

    if (!title || !code) {
      return NextResponse.json(
        { error: 'Title and code are required' },
        { status: 400 }
      );
    }

    const codeBlock = await (prisma as any).customCodeBlock.update({
      where: { id },
      data: {
        title,
        description: description || null,
        code,
        pagePath: pagePath || null,
        position: position || 'BOTTOM',
        order: order || 0,
        isActive: isActive !== false,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CODE_BLOCK_UPDATED',
      entityType: 'CustomCodeBlock',
      entityId: codeBlock.id,
      metadata: { title },
    });

    return NextResponse.json(codeBlock);
  } catch (error: any) {
    console.error('Error updating code block:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await (prisma as any).customCodeBlock.delete({
      where: { id },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CODE_BLOCK_DELETED',
      entityType: 'CustomCodeBlock',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting code block:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
