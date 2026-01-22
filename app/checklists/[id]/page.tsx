import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PHIWarningBanner } from '@/components/phi-warning-banner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreateChecklistInstanceForm from '@/components/create-checklist-instance-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChecklistDetailPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  const { id } = await params;

  const checklist = await prisma.checklist.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          contentItem: true,
        },
        orderBy: { order: 'asc' },
      },
      instances: {
        where: { userId: session.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!checklist) {
    notFound();
  }

  return (
    <DashboardLayout user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/checklists">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checklists
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{checklist.title}</h1>
          {checklist.description && (
            <p className="mt-2 text-gray-600">{checklist.description}</p>
          )}
        </div>

        <PHIWarningBanner />

        {/* Create New Instance */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Checklist Instance</CardTitle>
            <CardDescription>
              Create a new instance of this checklist. Use a generic label (e.g., "Case #1") - NO CLIENT INFORMATION.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateChecklistInstanceForm checklistId={checklist.id} />
          </CardContent>
        </Card>

        {/* Checklist Items Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist Items ({checklist.items.length})</CardTitle>
            <CardDescription>Items in this checklist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklist.items.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {item.contentItem && (
                        <Link
                          href={`/library/${item.contentItem.slug}`}
                          className="text-xs text-crej-primary hover:text-crej-dark mt-1 inline-block"
                        >
                          View related content →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Instances */}
        {checklist.instances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Instances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {checklist.instances.map((instance) => (
                  <Link
                    key={instance.id}
                    href={`/checklists/${checklist.id}/instances/${instance.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <p className="font-medium">{instance.label}</p>
                    <p className="text-xs text-gray-500">
                      Created: {instance.createdAt.toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
