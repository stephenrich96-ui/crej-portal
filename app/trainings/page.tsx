import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayCircle, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function TrainingsPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  // Only show trainings that have explicit requirements matching user's roles
  const trainings = await prisma.training.findMany({
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
      requirements: true,
    },
    orderBy: [
      { program: 'asc' },
      { order: 'asc' },
    ],
  });

  const trainingsByProgram = {
    DSPD: trainings.filter(t => t.program === 'DSPD'),
    HRSS: trainings.filter(t => t.program === 'HRSS'),
    EPAS: trainings.filter(t => t.program === 'EPAS'),
  };

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black tracking-tight">Trainings</h1>
          <p className="mt-2 text-base text-black">Complete required trainings for your role</p>
        </div>

        {Object.entries(trainingsByProgram).map(([program, programTrainings]) => {
          if (programTrainings.length === 0) return null;

          return (
            <Card key={program} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-black">{program} Trainings</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {programTrainings.length} training{programTrainings.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programTrainings.map((training) => {
                    const isCompleted = training.completions.length > 0;
                    const completion = training.completions[0];

                    return (
                      <div
                        key={training.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {training.videoUrl ? (
                              <PlayCircle className="h-5 w-5 text-crej-primary" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-600" />
                            )}
                            <h3 className="font-medium text-gray-900">{training.title}</h3>
                            {isCompleted && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          {training.description && (
                            <p className="text-sm text-gray-600 mt-1">{training.description}</p>
                          )}
                          {isCompleted && completion && (
                            <p className="text-xs text-green-600 mt-2">
                              Completed: {formatDate(completion.completedAt)}
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
              </CardContent>
            </Card>
          );
        })}

        {trainings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No trainings assigned to your role</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
