import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Circle, ExternalLink, Mail, Calendar, AlertCircle, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TrainingCheckbox from '@/components/training-checkbox';
import { TrainingLinkActions } from '@/components/training-link-actions';

export default async function StartHerePage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  // Get all required trainings for user's roles, ordered by priority
  const allTrainings = await prisma.training.findMany({
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
      { order: 'asc' },
      { title: 'asc' },
    ],
  });

  // Separate trainings by category
  const startHereTraining = allTrainings.find(t => t.title.toLowerCase().includes('start here'));
  const deadlineTrainings = allTrainings.filter(t => 
    t.title.toLowerCase().includes('medicaid 101') ||
    t.title.toLowerCase().includes('seln') ||
    t.description?.toLowerCase().includes('30-day') ||
    t.description?.toLowerCase().includes('due by') ||
    t.description?.toLowerCase().includes('june 5, 2026')
  );
  const initialRequired = allTrainings.filter(t => 
    !t.title.toLowerCase().includes('start here') &&
    !deadlineTrainings.includes(t) &&
    (t.order >= 10 && t.order < 20)
  );
  const fy26Required = allTrainings.filter(t => 
    !t.title.toLowerCase().includes('start here') &&
    !deadlineTrainings.includes(t) &&
    (t.order >= 20 && t.order < 40)
  );
  const annualRequired = allTrainings.filter(t => 
    !t.title.toLowerCase().includes('start here') &&
    !deadlineTrainings.includes(t) &&
    (t.order >= 30 && t.order < 50)
  );

  // Calculate progress
  const totalRequired = allTrainings.length - (startHereTraining ? 1 : 0);
  const completedCount = allTrainings.filter(t => 
    t.completions.length > 0 && !t.title.toLowerCase().includes('start here')
  ).length;
  const progressPercent = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

  // Get deadline trainings with dates
  const deadlineInfo = deadlineTrainings.map(t => {
    let deadlineDate: Date | null = null;
    let daysUntil = null;
    
    if (t.title.toLowerCase().includes('medicaid 101')) {
      // Medicaid 101 is annual with 30-day deadline from assignment
      // For now, we'll show it as high priority
      deadlineDate = null; // Would need assignment date from ULP
    } else if (t.title.toLowerCase().includes('seln') || t.description?.toLowerCase().includes('june 5, 2026')) {
      deadlineDate = new Date('2026-06-05');
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      training: t,
      deadlineDate,
      daysUntil,
    };
  });

  // Fetch custom code blocks for this page
  let topCodeBlocks: any[] = [];
  let bottomCodeBlocks: any[] = [];

  try {
    // Check if model exists before querying
    if (prisma && (prisma as any).customCodeBlock) {
      [topCodeBlocks, bottomCodeBlocks] = await Promise.all([
        (prisma as any).customCodeBlock.findMany({
          where: {
            isActive: true,
            position: 'TOP',
            OR: [{ pagePath: null }, { pagePath: '/start-here' }],
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        }).catch(() => []),
        (prisma as any).customCodeBlock.findMany({
          where: {
            isActive: true,
            position: 'BOTTOM',
            OR: [{ pagePath: null }, { pagePath: '/start-here' }],
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        }).catch(() => []),
      ]);
    }
  } catch (error) {
    console.error('Error fetching custom content:', error);
    // Continue with empty arrays if custom content fails to load
  }

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Top Custom Code Blocks */}
        {topCodeBlocks.map((block) => (
          <div key={block.id} dangerouslySetInnerHTML={{ __html: block.code }} />
        ))}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black tracking-tight">DSPD Support Coordinator Start Here</h1>
          <p className="mt-2 text-base text-black">Complete onboarding guide - follow each step in order</p>
        </div>

        {/* Progress Overview */}
        <Card className="border border-gray-200 shadow-sm bg-crej-light">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Required Trainings Completed</span>
                  <span className="font-medium text-black">{completedCount} / {totalRequired}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-crej-primary h-3 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{progressPercent}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Trainings with Deadlines */}
        {deadlineInfo.length > 0 && (
          <Card className="border-2 border-red-300 shadow-sm bg-red-50/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-xl font-semibold text-black">Step 1: Complete Trainings with Deadlines</CardTitle>
              </div>
              <CardDescription className="text-red-700">These trainings have specific deadlines - complete them first! Check them off as you complete each one.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deadlineInfo.map(({ training, deadlineDate, daysUntil }) => {
                  const isCompleted = training.completions.length > 0;
                  const completion = training.completions[0];

                  return (
                    <div
                      key={training.id}
                      className={`p-4 border-2 rounded-lg ${
                        isCompleted 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-red-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrainingCheckbox 
                              trainingId={training.id}
                              isCompleted={isCompleted}
                              completionDate={completion?.completedAt}
                            />
                            <h3 className="font-semibold text-black">{training.title}</h3>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded font-medium">
                              DEADLINE
                            </span>
                          </div>
                          {training.description && (
                            <p className="text-sm text-gray-600 mb-2">{training.description.split('\n')[0]}</p>
                          )}
                          {deadlineDate && daysUntil !== null && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-red-600" />
                              <span className={daysUntil !== null && daysUntil < 30 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                Due: {formatDate(deadlineDate)} ({daysUntil} days remaining)
                              </span>
                            </div>
                          )}
                          {isCompleted && completion && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Completed: {formatDate(completion.completedAt)}
                            </p>
                          )}
                          {/* Training Links */}
                          <div className="mt-3">
                            {training.documentUrl && training.documentUrl.trim() !== '' ? (
                              <TrainingLinkActions url={training.documentUrl} linkText="Open Training Link" />
                            ) : training.videoUrl && training.videoUrl.trim() !== '' ? (
                              <TrainingLinkActions url={training.videoUrl} linkText="Open Training Link" />
                            ) : (
                              <TrainingLinkActions url="https://utahlearningportal.com" linkText="Open Utah Learning Portal" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link href={`/trainings/${training.id}`}>
                            <Button 
                              variant={isCompleted ? 'outline' : 'default'} 
                              size="sm"
                              className={isCompleted ? '' : 'bg-crej-primary hover:bg-crej-dark'}
                            >
                              {isCompleted ? 'Review' : 'Start Training'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Initial Required Trainings */}
        {initialRequired.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black">Step 2: Initial Required Trainings (Due in 60 Days)</CardTitle>
              <CardDescription>Complete these trainings within 60 days of assignment. Check them off as you complete each one.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {initialRequired.map((training) => {
                  const isCompleted = training.completions.length > 0;
                  const completion = training.completions[0];

                  return (
                    <div
                      key={training.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <TrainingCheckbox 
                            trainingId={training.id}
                            isCompleted={isCompleted}
                            completionDate={completion?.completedAt}
                          />
                          <h3 className="font-medium text-black">{training.title}</h3>
                        </div>
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-7">{training.description.split('\n')[0]}</p>
                        )}
                        {isCompleted && completion && (
                          <p className="text-xs text-green-600 mt-2 ml-7">
                            Completed: {formatDate(completion.completedAt)}
                          </p>
                        )}
                        {/* Training Links */}
                        <div className="mt-2 ml-7">
                          {training.documentUrl && training.documentUrl.trim() !== '' ? (
                            <TrainingLinkActions url={training.documentUrl} linkText="Open Link" />
                          ) : training.videoUrl && training.videoUrl.trim() !== '' ? (
                            <TrainingLinkActions url={training.videoUrl} linkText="Open Link" />
                          ) : (
                            <TrainingLinkActions url="https://utahlearningportal.com" linkText="Open Utah Learning Portal" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {training.documentUrl && training.documentUrl.trim() !== '' && (
                          <a
                            href={training.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-crej-primary hover:bg-crej-dark w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open Link
                            </Button>
                          </a>
                        )}
                        <Link href={`/trainings/${training.id}`}>
                          <Button 
                            variant={isCompleted ? 'outline' : 'default'} 
                            size="sm"
                            className={isCompleted ? 'w-full' : 'bg-crej-primary hover:bg-crej-dark w-full'}
                          >
                            {isCompleted ? 'Review' : 'View Details'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: FY26 Required Trainings */}
        {fy26Required.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black">Step 3: More Required Courses (FY26)</CardTitle>
              <CardDescription>Additional required trainings coming in FY26. Check them off as you complete each one.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fy26Required.map((training) => {
                  const isCompleted = training.completions.length > 0;
                  const completion = training.completions[0];

                  return (
                    <div
                      key={training.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <TrainingCheckbox 
                            trainingId={training.id}
                            isCompleted={isCompleted}
                            completionDate={completion?.completedAt}
                          />
                          <h3 className="font-medium text-black">{training.title}</h3>
                        </div>
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-7">{training.description.split('\n')[0]}</p>
                        )}
                        {isCompleted && completion && (
                          <p className="text-xs text-green-600 mt-2 ml-7">
                            Completed: {formatDate(completion.completedAt)}
                          </p>
                        )}
                        <div className="mt-2 ml-7">
                          {training.videoUrl ? (
                            <a
                              href={training.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-crej-primary hover:text-crej-dark inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Training Link
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Access via{' '}
                              <a href="https://utahlearningportal.com" target="_blank" rel="noopener noreferrer" className="text-crej-primary hover:text-crej-dark underline">
                                Utah Learning Portal
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {training.documentUrl && training.documentUrl.trim() !== '' && (
                          <a
                            href={training.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-crej-primary hover:bg-crej-dark w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open Link
                            </Button>
                          </a>
                        )}
                        <Link href={`/trainings/${training.id}`}>
                          <Button 
                            variant={isCompleted ? 'outline' : 'default'} 
                            size="sm"
                            className={isCompleted ? 'w-full' : 'bg-crej-primary hover:bg-crej-dark w-full'}
                          >
                            {isCompleted ? 'Review' : 'View Details'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Annual Required Trainings */}
        {annualRequired.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-black">Step 4: Annual & Alternate Year Required Trainings</CardTitle>
              <CardDescription>These trainings must be completed annually or every other year. Check them off as you complete each one.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {annualRequired.map((training) => {
                  const isCompleted = training.completions.length > 0;
                  const completion = training.completions[0];

                  return (
                    <div
                      key={training.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <TrainingCheckbox 
                            trainingId={training.id}
                            isCompleted={isCompleted}
                            completionDate={completion?.completedAt}
                          />
                          <h3 className="font-medium text-black">{training.title}</h3>
                        </div>
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-7">{training.description.split('\n')[0]}</p>
                        )}
                        {isCompleted && completion && (
                          <p className="text-xs text-green-600 mt-2 ml-7">
                            Completed: {formatDate(completion.completedAt)}
                          </p>
                        )}
                        <div className="mt-2 ml-7">
                          {training.videoUrl ? (
                            <a
                              href={training.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-crej-primary hover:text-crej-dark inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Training Link
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Access via{' '}
                              <a href="https://utahlearningportal.com" target="_blank" rel="noopener noreferrer" className="text-crej-primary hover:text-crej-dark underline">
                                Utah Learning Portal
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {training.documentUrl && training.documentUrl.trim() !== '' && (
                          <a
                            href={training.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-crej-primary hover:bg-crej-dark w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open Link
                            </Button>
                          </a>
                        )}
                        <Link href={`/trainings/${training.id}`}>
                          <Button 
                            variant={isCompleted ? 'outline' : 'default'} 
                            size="sm"
                            className={isCompleted ? 'w-full' : 'bg-crej-primary hover:bg-crej-dark w-full'}
                          >
                            {isCompleted ? 'Review' : 'View Details'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {completedCount === totalRequired && (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">Congratulations!</h3>
                <p className="text-gray-600">
                  You've completed all required trainings. Remember to complete annual trainings as they're assigned.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Custom Code Blocks */}
        {bottomCodeBlocks.map((block) => (
          <div key={block.id} dangerouslySetInnerHTML={{ __html: block.code }} />
        ))}
      </div>
    </DashboardLayout>
  );
}
