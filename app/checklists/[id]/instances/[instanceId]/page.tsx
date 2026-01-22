import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PHIWarningBanner } from '@/components/phi-warning-banner';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ChecklistItemCompletionButton from '@/components/checklist-item-completion-button';

interface PageProps {
  params: Promise<{ id: string; instanceId: string }>;
}

export default async function ChecklistInstancePage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  const { id, instanceId } = await params;

  const instance = await prisma.checklistInstance.findUnique({
    where: { id: instanceId },
    include: {
      checklist: {
        include: {
          items: {
            include: {
              contentItem: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
      itemCompletions: {
        include: {
          checklistItem: true,
        },
      },
    },
  });

  if (!instance || instance.userId !== session.id) {
    notFound();
  }

  const completedItemIds = new Set(instance.itemCompletions.map(c => c.checklistItemId));
  const totalItems = instance.checklist.items.length;
  const completedItems = completedItemIds.size;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <DashboardLayout user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href={`/checklists/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checklist
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{instance.checklist.title}</h1>
          <p className="mt-2 text-gray-600">Instance: {instance.label}</p>
          {instance.notes && (
            <p className="mt-1 text-sm text-gray-500">Notes: {instance.notes}</p>
          )}
        </div>

        <PHIWarningBanner />

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {completedItems} of {totalItems} items completed
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-crej-primary h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Items */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instance.checklist.items.map((item, index) => {
                const isCompleted = completedItemIds.has(item.id);
                const completion = instance.itemCompletions.find(c => c.checklistItemId === item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-4 border-2 rounded-lg ${
                      isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
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
                        {isCompleted && completion && (
                          <p className="text-xs text-green-600 mt-2">
                            Completed: {completion.completedAt.toLocaleDateString()}
                            {completion.notes && ` - ${completion.notes}`}
                          </p>
                        )}
                      </div>
                      <div>
                        <ChecklistItemCompletionButton
                          checklistItemId={item.id}
                          checklistInstanceId={instance.id}
                          isCompleted={isCompleted}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
