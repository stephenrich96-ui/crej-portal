import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Users, BookOpen, CheckSquare, PlayCircle, FileText } from 'lucide-react';
import { isAdmin, canManageContent } from '@/lib/rbac';

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  if (!isAdmin(session.roles) && !canManageContent(session.roles)) {
    redirect('/');
  }

  const adminLinks = [
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      requiresAdmin: true,
    },
    {
      href: '/admin/content',
      title: 'Content Management',
      description: 'Create and edit content items',
      icon: BookOpen,
      requiresAdmin: false,
    },
    {
      href: '/admin/trainings',
      title: 'Training Management',
      description: 'Create and manage trainings',
      icon: PlayCircle,
      requiresAdmin: false,
    },
    {
      href: '/admin/checklists',
      title: 'Checklist Management',
      description: 'Create and manage checklists',
      icon: CheckSquare,
      requiresAdmin: false,
    },
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      requiresAdmin: true,
    },
    {
      href: '/admin/reports',
      title: 'Reports & Analytics',
      description: 'View training completions and usage',
      icon: FileText,
      requiresAdmin: true,
    },
  ];

  const accessibleLinks = adminLinks.filter(
    (link) => !link.requiresAdmin || isAdmin(session.roles)
  );

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">Admin Console</h1>
            <p className="mt-2 text-base text-black">Manage system content, users, and settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accessibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-6 w-6 text-crej-primary" />
                      <CardTitle>{link.title}</CardTitle>
                    </div>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                • Sync content from markdown files: <code className="bg-gray-100 px-2 py-1 rounded">npm run content:sync</code>
              </p>
              <p className="text-sm text-gray-600">
                • Run database migrations: <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:migrate</code>
              </p>
              <p className="text-sm text-gray-600">
                • Open Prisma Studio: <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:studio</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
