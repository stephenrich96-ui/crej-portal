import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { canManageContent } from '@/lib/rbac';

export default async function AdminChecklistsPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  if (!canManageContent(session.roles)) {
    redirect('/');
  }

  const checklists = await prisma.checklist.findMany({
    include: {
      items: true,
    },
    orderBy: [
      { program: 'asc' },
      { type: 'asc' },
    ],
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Checklist Management</h1>
            <p className="mt-2 text-gray-600">Create and manage checklists</p>
          </div>
          <Link href="/admin/checklists/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Checklist
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Checklists ({checklists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{checklist.title}</h3>
                      <span className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded">
                        {checklist.program}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {checklist.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {checklist.description && (
                      <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {checklist.items.length} items
                    </p>
                  </div>
                  <Link href={`/admin/checklists/${checklist.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
