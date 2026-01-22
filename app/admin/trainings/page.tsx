import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { canManageContent } from '@/lib/rbac';

export default async function AdminTrainingsPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  if (!canManageContent(session.roles)) {
    redirect('/');
  }

  const trainings = await prisma.training.findMany({
    include: {
      contentItem: true,
      requirements: true,
    },
    orderBy: [
      { program: 'asc' },
      { order: 'asc' },
    ],
  });

  const contentItems = await prisma.contentItem.findMany({
    where: {
      program: 'DSPD',
      category: { in: ['TRAININGS', 'ONBOARDING', 'REFERENCE'] },
    },
    orderBy: { title: 'asc' },
  });

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Training Management</h1>
            <p className="mt-2 text-gray-600">Create and manage trainings</p>
          </div>
          <Link href="/admin/trainings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Training
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trainings ({trainings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{training.title}</h3>
                      <span className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded">
                        {training.program}
                      </span>
                    </div>
                    {training.description && (
                      <p className="text-sm text-gray-600 mt-1">{training.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      {training.contentItem && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          Has Content
                        </span>
                      )}
                      {training.videoUrl && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          Video
                        </span>
                      )}
                      {training.documentUrl && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          Document
                        </span>
                      )}
                      {training.requirements.length > 0 ? (
                        <span className="text-xs text-gray-500">
                          Required for: {training.requirements.map(r => r.role).join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          ⚠ No requirements set - training will not appear for any users
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/trainings/${training.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Content Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Link these content items to trainings or create new trainings from them
            </p>
            <div className="space-y-2">
              {contentItems.map((content) => (
                <div key={content.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{content.title}</p>
                  <p className="text-xs text-gray-500">{content.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
