'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', permission: Permission.DASHBOARD_VIEW },
  { name: 'My Attendance', href: '/attendance', permission: Permission.ABSENSI_READ },
  { name: 'Reports', href: '/reports', permission: Permission.REPORT_READ },
  { name: 'Users', href: '/admin/users', permission: Permission.USER_READ },
  { name: 'Settings', href: '/admin/settings', permission: Permission.SETTINGS_READ },
];

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render navigation while loading or if no session
  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900">
                🎯 Absensi
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session?.user) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900">
                🎯 Absensi
              </div>
            </div>
            <div className="flex items-center">
              <a
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const filteredNavigation = navigation.filter(item => 
    hasPermission(session.user.role, item.permission)
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                🎯 Absensi
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{session.user.name}</div>
                  <div className="text-gray-500 capitalize">{session.user.role}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                  <div className="text-sm font-medium text-gray-500 capitalize">{session.user.role}</div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
