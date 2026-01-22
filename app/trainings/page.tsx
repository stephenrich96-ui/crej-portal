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

  if (!session) {
    redirect('/login');
  }

  // If user has no roles, redirect to role selection
  if (!session.roles || session.roles.length === 0) {
    redirect('/select-role');
  }

  // Admin can see ALL trainings, others see only their role-specific trainings
  const isAdmin = session.roles.includes('ADMIN');
  
  // Show ALL trainings for now - let users see everything
  const trainings = await prisma.training.findMany({
    where: {},
    include: {
      completions: {
        where: { userId: session.id },
      },
      requirements: true,
    },
    orderBy: [
      { program: 'asc' },
      { order: 'asc' },
      { title: 'asc' },
    ],
  });

  const trainingsByProgram = {
    DSPD: trainings.filter(t => t.program === 'DSPD'),
    HRSS: trainings.filter(t => t.program === 'HRSS'),
    EPAS: trainings.filter(t => t.program === 'EPAS'),
  };

  return (
    <DashboardLayout user={session}>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <PlayCircle className="h-8 w-8 text-gray-900" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Training Center</h1>
              <p className="mt-2 text-lg text-gray-900">
                {isAdmin ? 'Manage all trainings across the organization' : 'Complete your required trainings and grow your skills'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-6 text-sm text-gray-900">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-900"></div>
              <span>{trainings.length} Total Trainings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-900"></div>
              <span>{trainings.filter(t => t.completions.length > 0).length} Completed</span>
            </div>
          </div>
        </div>

        {Object.entries(trainingsByProgram).map(([program, programTrainings]) => {
          if (programTrainings.length === 0) return null;

          // Separate trainings by category based on order
          // Start Here trainings (order 0)
          const startHere = programTrainings.filter(t => 
            t.order === 0 || t.title.toLowerCase().includes('start here')
          );
          
          // Trainings with deadlines (order 7)
          const withDeadlines = programTrainings.filter(t => 
            t.order === 7 || t.description?.toLowerCase().includes('deadline') ||
            t.description?.toLowerCase().includes('june 5, 2026')
          );
          
          // Initial required: order 1-7 (excluding deadline training)
          const initialRequired = programTrainings.filter(t => 
            (t.requirements?.length ?? 0) > 0 && 
            t.order >= 1 && t.order <= 7 &&
            !withDeadlines.includes(t) &&
            !startHere.includes(t)
          );
          
          // More required (FY26): order 8-24
          const moreRequired = programTrainings.filter(t => 
            (t.requirements?.length ?? 0) > 0 && t.order >= 8 && t.order <= 24
          );
          
          // Optional trainings: order 100+ or no requirements
          const optional = programTrainings.filter(t => 
            (t.requirements?.length ?? 0) === 0 || t.order >= 100
          );

          return (
            <Card key={program} className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                      <span className="p-2 bg-gray-100 rounded-xl text-gray-900">{program}</span>
                      <span>Trainings</span>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-900 mt-2">
                      {programTrainings.length} training{programTrainings.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Start Here Section */}
                  {startHere.length > 0 && (
                    <div className="relative">
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <span className="p-2 bg-gray-100 rounded-lg">🚀</span>
                          <span>Start Here</span>
                        </h3>
                        <div className="space-y-4">
                          {startHere.map((training) => {
                            const isCompleted = training.completions.length > 0;
                            const completion = training.completions[0];

                            return (
                              <div
                                key={training.id}
                                className={`group flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    {training.videoUrl ? (
                                      <PlayCircle className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <FileText className="h-5 w-5 text-blue-600" />
                                    )}
                                    <h3 className="font-semibold text-gray-900">{training.title}</h3>
                                    {isCompleted && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                  </div>
                                  {training.description && (
                                    <p className="text-sm text-gray-900 mt-1">{training.description}</p>
                                  )}
                                  {isCompleted && completion && (
                                    <p className="text-xs text-green-600 mt-2">
                                      Completed: {formatDate(completion.completedAt)}
                                    </p>
                                  )}
                                </div>
                                <Link href={`/trainings/${training.id}`}>
                                  <Button 
                                    variant={isCompleted ? 'outline' : 'default'} 
                                    size="sm" 
                                    className={`transition-all duration-300 ${
                                      isCompleted 
                                        ? 'border-green-400 text-green-700 hover:bg-green-50' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    {isCompleted ? '✓ Review' : '▶ Start'}
                                  </Button>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trainings with Deadlines */}
                  {withDeadlines.length > 0 && (
                    <div className="relative">
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center space-x-2">
                          <span className="p-2 bg-red-100 rounded-lg">⏰</span>
                          <span>Trainings with Deadlines</span>
                        </h3>
                        <div className="space-y-4">
                        {withDeadlines.map((training) => {
                          const isCompleted = training.completions.length > 0;
                          const completion = training.completions[0];

                          return (
                            <div
                              key={training.id}
                              className={`group flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-red-50 border-red-300 hover:border-red-400'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                  {training.videoUrl ? (
                                    <PlayCircle className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-gray-600" />
                                  )}
                                  <h3 className="font-medium text-gray-900">{training.title}</h3>
                                  {isCompleted && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  )}
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded font-medium">
                                    DEADLINE
                                  </span>
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
                                <Button variant={isCompleted ? 'outline' : 'default'} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  {isCompleted ? 'Review' : 'Start'}
                                </Button>
                              </Link>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Required Trainings */}
                  {initialRequired.length > 0 && (
                    <div className="relative">
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <span className="p-2 bg-gray-100 rounded-lg">📋</span>
                          <span>Required Trainings</span>
                        </h3>
                        <p className="text-sm text-gray-900 mb-4">Initial course assignments (due in 60 days)</p>
                        <div className="space-y-4">
                          {initialRequired.map((training) => {
                            const isCompleted = training.completions.length > 0;
                            const completion = training.completions[0];

                            return (
                              <div
                                key={training.id}
                                className={`group flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-300 ${
                                  isCompleted 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    {training.videoUrl ? (
                                      <PlayCircle className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <FileText className="h-5 w-5 text-blue-600" />
                                    )}
                                    <h3 className="font-semibold text-gray-900">{training.title}</h3>
                                    {isCompleted && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                  </div>
                                  {training.description && (
                                    <p className="text-sm text-gray-900 mt-1">{training.description}</p>
                                  )}
                                  {isCompleted && completion && (
                                    <p className="text-xs text-green-600 mt-2">
                                      Completed: {formatDate(completion.completedAt)}
                                    </p>
                                  )}
                                </div>
                                <Link href={`/trainings/${training.id}`}>
                                  <Button 
                                    variant={isCompleted ? 'outline' : 'default'} 
                                    size="sm" 
                                    className={`transition-all duration-300 ${
                                      isCompleted 
                                        ? 'border-green-400 text-green-700 hover:bg-green-50' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    {isCompleted ? '✓ Review' : '▶ Start'}
                                  </Button>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* More Required Trainings (FY26) */}
                  {moreRequired.length > 0 && (
                    <div className="relative">
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center space-x-2">
                          <span className="p-2 bg-blue-100 rounded-lg">📚</span>
                          <span>More Required Courses (FY26)</span>
                        </h3>
                        <div className="space-y-4">
                          {moreRequired.map((training) => {
                            const isCompleted = training.completions.length > 0;
                            const completion = training.completions[0];

                            return (
                              <div
                                key={training.id}
                                className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    {training.videoUrl ? (
                                      <PlayCircle className="h-5 w-5 text-blue-600" />
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
                                  <Button variant={isCompleted ? 'outline' : 'default'} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isCompleted ? 'Review' : 'Start'}
                                  </Button>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Trainings */}
                  {optional.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-3 pb-2 border-b border-gray-300">
                        Optional Trainings
                      </h3>
                      <p className="text-sm text-gray-900 mb-4">
                        These trainings are optional but count toward your 30 hours of annual continuing education. All optional trainings can be found in the Utah Learning Portal.
                      </p>
                      <div className="space-y-4">
                        {optional.map((training) => {
                          const isCompleted = training.completions.length > 0;
                          const completion = training.completions[0];

                          return (
                            <div
                              key={training.id}
                              className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                                isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  {training.videoUrl ? (
                                    <PlayCircle className="h-5 w-5 text-gray-900" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-gray-900" />
                                  )}
                                  <h3 className="font-medium text-gray-900">{training.title}</h3>
                                  {isCompleted && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  )}
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-900 rounded">
                                    Optional
                                  </span>
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
                                <Button variant={isCompleted ? 'outline' : 'outline'} size="sm">
                                  {isCompleted ? 'Review' : 'View'}
                                </Button>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {trainings.length === 0 && (
          <Card className="border border-gray-300 bg-white">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">📚</div>
                <h3 className="text-xl font-semibold text-gray-900">No Trainings Available</h3>
                <p className="text-gray-900 max-w-md mx-auto">
                  There are currently no trainings assigned to your role. Please contact your administrator if you believe this is an error.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
