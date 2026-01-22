import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { isAdmin } from '@/lib/rbac';
import DeleteUserButton from '@/components/admin/delete-user-button';

export default async function AdminUsersPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  if (!isAdmin(session.roles)) {
    redirect('/');
  }

  const users = await prisma.user.findMany({
    include: {
      roles: true,
    },
    orderBy: { createdAt: 'desc' },
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">User Management</h1>
            <p className="mt-2 text-gray-600">Manage users and their roles</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{user.email}</p>
                      {user.name && (
                        <span className="text-sm text-gray-600">({user.name})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded"
                          >
                            {role.role.replace(/_/g, ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No roles assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Roles
                      </Button>
                    </Link>
                    <DeleteUserButton 
                      userId={user.id} 
                      userEmail={user.email} 
                      userName={user.name || user.email}
                      currentUserId={session.id}
                      isAdmin={user.roles.some(r => r.role === 'ADMIN')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
