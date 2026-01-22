import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { canAccessProgram } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, CheckSquare, PlayCircle, FileText, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  // Get required trainings for user's roles - only trainings with explicit requirements
  const requiredTrainings = await prisma.training.findMany({
    where: {
      requirements: {
        some: {
          role: { in: session.roles },
        },
      },
    },
    include: {
      completions: {
        where: { userId: session.id },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Get user's training completions
  const completedTrainingIds = new Set(
    requiredTrainings
      .filter(t => t.completions.length > 0)
      .map(t => t.id)
  );

  // Get recent content views (simplified - would track in real app)
  const recentContent = await prisma.contentItem.findMany({
    where: {
      OR: [
        { program: 'DSPD', ...(canAccessProgram(session.roles, 'DSPD') ? {} : { id: 'none' }) },
        { program: 'HRSS', ...(canAccessProgram(session.roles, 'HRSS') ? {} : { id: 'none' }) },
        { program: 'EPAS', ...(canAccessProgram(session.roles, 'EPAS') ? {} : { id: 'none' }) },
      ],
    },
    take: 5,
    orderBy: { updatedAt: 'desc' },
  });

  // Get checklist instances
  const checklistInstances = await prisma.checklistInstance.findMany({
    where: { userId: session.id },
    include: {
      checklist: {
        include: {
          items: true,
        },
      },
      itemCompletions: true,
    },
    take: 5,
    orderBy: { updatedAt: 'desc' },
  });

  const roleLabels = session.roles.map(r => r.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())).join(', ');

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black tracking-tight">Dashboard</h1>
          <p className="mt-2 text-base text-black">
            Welcome back, {session.name || session.email}
          </p>
          <p className="text-sm text-black mt-1">Roles: {roleLabels}</p>
        </div>

        {/* Required Trainings */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-black">Required Trainings</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {requiredTrainings.length} training{requiredTrainings.length !== 1 ? 's' : ''} assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requiredTrainings.length === 0 ? (
              <p className="text-gray-500">No required trainings</p>
            ) : (
              <div className="space-y-3">
                {requiredTrainings.map((training) => {
                  const isCompleted = completedTrainingIds.has(training.id);
                  return (
                    <div
                      key={training.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                        isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{training.title}</p>
                        {training.description && (
                          <p className="text-sm text-gray-600">{training.description}</p>
                        )}
                        {isCompleted && training.completions[0] && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed: {formatDate(training.completions[0].completedAt)}
                          </p>
                        )}
                      </div>
                      <Link href={`/trainings/${training.id}`}>
                        <Button variant={isCompleted ? 'outline' : 'default'} size="sm">
                          {isCompleted ? 'Review' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklists */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-black">My Checklists</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Active checklist instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checklistInstances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No active checklists</p>
                <Link href="/checklists">
                  <Button>View All Checklists</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {checklistInstances.map((instance) => {
                  const totalItems = instance.checklist?.items?.length || 0;
                  const completedItems = instance.itemCompletions?.length || 0;
                  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                  return (
                    <Link key={instance.id} href={`/checklists/${instance.checklistId}/instances/${instance.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{instance.checklist.title}</p>
                          <span className="text-sm text-gray-500">{instance.label}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-crej-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {completedItems} of {totalItems} items completed
                        </p>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/checklists">
                  <Button variant="outline" className="w-full mt-2">View All Checklists</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-black">Recent Content</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Recently updated content in your programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentContent.length === 0 ? (
              <p className="text-gray-500">No recent content</p>
            ) : (
              <div className="space-y-3">
                {recentContent.map((content) => (
                  <Link key={content.id} href={`/library/${content.slug}`}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium">{content.title}</p>
                      {content.summary && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{content.summary}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded">
                          {content.program}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          {content.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/library">
                  <Button variant="outline" className="w-full mt-2">Browse Library</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
