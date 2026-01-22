import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { canAccessProgram } from '@/lib/rbac';
import { redirect, notFound } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContentPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  const { slug } = await params;

  const content = await prisma.contentItem.findUnique({
    where: { slug },
  });

  if (!content) {
    notFound();
  }

  // Check access
  if (!canAccessProgram(session.roles, content.program as 'DSPD' | 'HRSS' | 'EPAS')) {
    redirect('/library');
  }

  return (
    <DashboardLayout user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/library">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{content.title}</h1>
          {content.summary && (
            <p className="mt-2 text-gray-600">{content.summary}</p>
          )}
          <div className="flex space-x-2 mt-4">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {content.program}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
              {content.category.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
