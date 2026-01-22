import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { canAccessProgram } from '@/lib/rbac';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
// ContentCategory and ContentProgram are now strings

interface LibraryPageProps {
  searchParams: { program?: string; category?: string; search?: string };
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  const programFilter = searchParams.program as string | undefined;
  const categoryFilter = searchParams.category as string | undefined;
  const searchQuery = searchParams.search;

  // Admin can see ALL content, others see only their program content
  const isAdmin = session.roles.includes('ADMIN');
  
  // Build where clause based on access
  const accessiblePrograms: string[] = [];
  if (isAdmin) {
    accessiblePrograms.push('DSPD', 'HRSS', 'EPAS');
  } else {
    if (canAccessProgram(session.roles, 'DSPD')) accessiblePrograms.push('DSPD');
    if (canAccessProgram(session.roles, 'HRSS')) accessiblePrograms.push('HRSS');
    if (canAccessProgram(session.roles, 'EPAS')) accessiblePrograms.push('EPAS');
  }

  if (accessiblePrograms.length === 0) {
    accessiblePrograms.push('DSPD'); // Default fallback
  }

  const where: any = isAdmin ? {} : {
    program: { in: accessiblePrograms },
  };

  if (programFilter && accessiblePrograms.includes(programFilter)) {
    where.program = programFilter;
  }

  if (categoryFilter) {
    where.category = categoryFilter;
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { content: { contains: searchQuery, mode: 'insensitive' } },
      { summary: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const contentItems = await prisma.contentItem.findMany({
    where,
    orderBy: [
      { program: 'asc' },
      { category: 'asc' },
      { order: 'asc' },
      { title: 'asc' },
    ],
  });

  const categories: string[] = ['ONBOARDING', 'SOPS', 'TRAININGS', 'COMPLIANCE_CHECKLISTS', 'REFERENCE'];
  const programs: string[] = isAdmin ? ['DSPD', 'HRSS', 'EPAS'] : accessiblePrograms;

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-black tracking-tight">Library</h1>
          <p className="mt-2 text-gray-600">Browse training materials, SOPs, and resources</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <form method="get" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program
                  </label>
                  <select
                    name="program"
                    defaultValue={programFilter || ''}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">All Programs</option>
                    {programs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={categoryFilter || ''}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="search"
                      placeholder="Search content..."
                      defaultValue={searchQuery || ''}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <Button type="submit">Apply Filters</Button>
            </form>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contentItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.summary && (
                  <CardDescription className="line-clamp-2">
                    {item.summary}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="text-xs px-2 py-1 bg-crej-light text-crej-primary rounded">
                      {item.program}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Link href={`/library/${item.slug}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contentItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No content found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
