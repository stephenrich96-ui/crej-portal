import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { canManageContent } from '@/lib/rbac';

export default async function AdminContentPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  if (!canManageContent(session.roles)) {
    redirect('/');
  }

  const contentItems = await prisma.contentItem.findMany({
    orderBy: [
      { program: 'asc' },
      { category: 'asc' },
      { title: 'asc' },
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Content Management</h1>
            <p className="mt-2 text-gray-600">Manage all content items</p>
          </div>
          <Link href="/admin/content/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Content Items ({contentItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.isFromFile && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          From File
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded">
                        {item.program}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/content/${item.id}/edit`}>
                    <Button variant="outline" size="sm" disabled={item.isFromFile}>
                      <Edit className="h-4 w-4 mr-2" />
                      {item.isFromFile ? 'View Only' : 'Edit'}
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
