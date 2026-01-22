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

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/trainings', label: 'Trainings', icon: PlayCircle },
    ...(user.roles.includes('ADMIN') || user.roles.includes('TRAINER')
      ? [{ href: '/admin', label: 'Admin', icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="CREJ" 
            className="h-8 w-auto"
            onError={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
            style={{ display: 'none' }}
          />
          <div className="h-8 w-8 rounded-lg bg-crej-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">CREJ Portal</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-900 hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-sm',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="CREJ" 
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.preventDefault();
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  style={{ display: 'none' }}
                />
                <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 tracking-tight">CREJ Portal</span>
              </Link>
              <p className="text-xs text-gray-600 mt-2">{user.email}</p>
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
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-white text-gray-900 border border-gray-300'
                        : 'text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
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
