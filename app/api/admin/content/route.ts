import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { canManageContent } from '@/lib/rbac';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !canManageContent(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, summary, content, category, program } = body;

    if (!title || !content || !category || !program) {
      return NextResponse.json(
        { error: 'Title, content, category, and program are required' },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    // Check if slug already exists
    const existing = await prisma.contentItem.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Content with this title already exists' },
        { status: 400 }
      );
    }

    const contentItem = await prisma.contentItem.create({
      data: {
        title,
        slug,
        summary: summary || null,
        content,
        category,
        program,
        isFromFile: false,
        editorId: session.id,
      },
    });

    await createAuditLog({
      actorId: session.id,
      action: 'CONTENT_CREATED',
      entityType: 'ContentItem',
      entityId: contentItem.id,
      metadata: JSON.stringify({ title, program }),
    });

    return NextResponse.json({ id: contentItem.id });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
