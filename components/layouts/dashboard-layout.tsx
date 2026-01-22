'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  PlayCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionUser } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/start-here', label: 'Start Here', icon: PlayCircle },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/trainings', label: 'Trainings', icon: PlayCircle },
    { href: '/checklists', label: 'Checklists', icon: CheckSquare },
    { href: '/forms', label: 'Forms', icon: FileText },
    ...(user.roles.includes('ADMIN') || user.roles.includes('TRAINER')
      ? [{ href: '/admin', label: 'Admin', icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-crej-primary">
          CREJ Portal
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <Link href="/" className="text-xl font-bold text-crej-primary">
                CREJ Portal
              </Link>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-crej-light text-crej-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="pt-16 lg:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
