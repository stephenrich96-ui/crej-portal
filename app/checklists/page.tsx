import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { canAccessProgram } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckSquare, Plus } from 'lucide-react';
// ChecklistType and ContentProgram are now strings

export default async function ChecklistsPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  // Admin can see ALL checklists, others see only their program checklists
  const isAdmin = session.roles.includes('ADMIN');
  
  // Get accessible programs
  const accessiblePrograms: string[] = [];
  if (isAdmin) {
    accessiblePrograms.push('DSPD', 'HRSS', 'EPAS');
  } else {
    if (canAccessProgram(session.roles, 'DSPD')) accessiblePrograms.push('DSPD');
    if (canAccessProgram(session.roles, 'HRSS')) accessiblePrograms.push('HRSS');
    if (canAccessProgram(session.roles, 'EPAS')) accessiblePrograms.push('EPAS');
  }

  const checklists = await prisma.checklist.findMany({
    where: isAdmin ? {} : {
      program: { in: accessiblePrograms },
    },
    include: {
      items: true,
      instances: {
        where: { userId: session.id },
        include: {
          itemCompletions: true,
        },
      },
    },
    orderBy: [
      { program: 'asc' },
      { type: 'asc' },
      { order: 'asc' },
    ],
  });

  const checklistsByProgram = {
    DSPD: checklists.filter(c => c.program === 'DSPD'),
    HRSS: checklists.filter(c => c.program === 'HRSS'),
    EPAS: checklists.filter(c => c.program === 'EPAS'),
  };

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">Checklists</h1>
            <p className="mt-2 text-gray-600">
              {isAdmin ? 'All checklists (Admin view)' : 'Workflow checklists for your programs'}
            </p>
          </div>
        </div>

        {Object.entries(checklistsByProgram).map(([program, programChecklists]) => {
          if (programChecklists.length === 0) return null;

          return (
            <Card key={program}>
              <CardHeader>
                <CardTitle>{program} Checklists</CardTitle>
                <CardDescription>
                  {programChecklists.length} checklist{programChecklists.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programChecklists.map((checklist) => {
                    const instances = checklist.instances;
                    const latestInstance = instances[0]; // Most recent

                    return (
                      <div key={checklist.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{checklist.title}</h3>
                            {checklist.description && (
                              <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {checklist.items.length} items • {checklist.type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {latestInstance && (
                              <Link href={`/checklists/${checklist.id}/instances/${latestInstance.id}`}>
                                <Button variant="outline" size="sm">Continue</Button>
                              </Link>
                            )}
                            <Link href={`/checklists/${checklist.id}`}>
                              <Button size="sm">
                                {latestInstance ? 'New Instance' : 'Start'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {latestInstance && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-1">
                              Latest: {latestInstance.label}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-crej-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(latestInstance.itemCompletions.length / checklist.items.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {checklists.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No checklists available for your role</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
