import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Users } from 'lucide-react';

export default async function TrainingCompletionsPage() {
  const session = await getServerSession();

  if (!session || !session.roles.includes('ADMIN')) {
    redirect('/login');
  }

  // Get all training completions with user and training info
  const completions = await prisma.trainingCompletion.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      training: {
        select: {
          id: true,
          title: true,
          program: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  // Get all trainings to show which ones have completions
  const allTrainings = await prisma.training.findMany({
    include: {
      completions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      requirements: true,
    },
    orderBy: [
      { program: 'asc' },
      { order: 'asc' },
      { title: 'asc' },
    ],
  });

  // Group completions by training
  const trainingsWithCompletions = allTrainings.map(training => ({
    ...training,
    completionCount: training.completions.length,
    completions: training.completions,
  }));

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black tracking-tight">Training Completions</h1>
          <p className="mt-2 text-base text-black">View all training completions across all users</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Completions</p>
                  <p className="text-2xl font-bold text-black">{completions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-crej-primary" />
                <div>
                  <p className="text-sm text-gray-600">Users with Completions</p>
                  <p className="text-2xl font-bold text-black">
                    {new Set(completions.map(c => c.userId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Trainings</p>
                  <p className="text-2xl font-bold text-black">{allTrainings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainings with Completions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-black">All Trainings & Completions</CardTitle>
            <CardDescription>View completion status for each training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trainingsWithCompletions.map((training) => (
                <div
                  key={training.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-lg">{training.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {training.program} • {training.completionCount} completion{training.completionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      training.completionCount > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {training.completionCount > 0 ? `${training.completionCount} Completed` : 'No Completions'}
                    </span>
                  </div>
                  
                  {training.completions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Completed By:</h4>
                      <div className="space-y-2">
                        {training.completions.map((completion) => (
                          <div
                            key={completion.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-black">
                                {completion.user.name || completion.user.email}
                              </p>
                              <p className="text-xs text-gray-500">{completion.user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">
                                Completed: {formatDate(completion.completedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
