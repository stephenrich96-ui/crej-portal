import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma, hasCustomModels } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, code, pagePath, position, order, isActive } = body;

    if (!title || !code) {
      return NextResponse.json(
        { error: 'Title and code are required' },
        { status: 400 }
      );
    }

    const codeBlock = await (prisma as any).customCodeBlock.create({
      data: {
        title,
        description: description || null,
        code,
        pagePath: pagePath || null,
        position: position || 'BOTTOM',
        order: order || 0,
        isActive: isActive !== false,
        createdBy: session.id,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CODE_BLOCK_CREATED',
      entityType: 'CustomCodeBlock',
      entityId: codeBlock.id,
      metadata: { title, pagePath: pagePath || 'all pages' },
    });

    return NextResponse.json(codeBlock);
  } catch (error: any) {
    console.error('Error creating code block:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    // Allow unauthenticated requests for public pages (they'll just get empty results)
    
    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get('pagePath');

    // Check if model exists
    if (!hasCustomModels()) {
      return NextResponse.json([]);
    }

    const whereClause: any = {
      isActive: true,
    };

    if (pagePath) {
      whereClause.OR = [
        { pagePath: pagePath },
        { pagePath: null },
      ];
    }

    const codeBlocks = await (prisma as any).customCodeBlock.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    }).catch(() => []);

    return NextResponse.json(codeBlocks || []);
  } catch (error: any) {
    console.error('Error fetching code blocks:', error);
    return NextResponse.json([]);
  }
}
