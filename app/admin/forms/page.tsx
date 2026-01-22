import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function FormsPage() {
  const session = await getServerSession();

  if (!session || !session.roles.includes('ADMIN')) {
    redirect('/login');
  }

  let customCodeBlocks: any[] = [];

  try {
    if (prisma && (prisma as any).customCodeBlock) {
      customCodeBlocks = await (prisma as any).customCodeBlock.findMany({
        orderBy: [
          { pagePath: 'asc' },
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      }).catch(() => []);
    }
  } catch (error) {
    console.error('Error fetching code blocks:', error);
  }

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">Custom Code Blocks</h1>
            <p className="mt-2 text-base text-black">Add custom HTML/React code blocks to any page</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/forms/new-code">
              <Button className="bg-crej-primary hover:bg-crej-dark">
                <Code className="h-4 w-4 mr-2" />
                Add Custom Code
              </Button>
            </Link>
          </div>
        </div>

        {/* Custom Code Blocks */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-black">Custom Code Blocks</CardTitle>
            <CardDescription>Custom HTML/React code blocks with branding already applied</CardDescription>
          </CardHeader>
          <CardContent>
            {customCodeBlocks.length === 0 ? (
              <div className="text-center py-8">
                <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No custom code blocks yet</p>
                <Link href="/admin/forms/new-code" className="mt-4 inline-block">
                  <Button variant="outline">Add Your First Code Block</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {customCodeBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-black">{block.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          block.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {block.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {block.pagePath && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {block.pagePath}
                          </span>
                        )}
                      </div>
                      {block.description && (
                        <p className="text-sm text-gray-600 mt-1">{block.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Position: {block.position} • Order: {block.order} • Updated: {formatDate(block.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/forms/${block.id}/edit-code`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/admin/forms/${block.id}/delete-code`}>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
