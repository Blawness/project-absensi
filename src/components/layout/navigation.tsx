'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';

// Navigation items with icons
const navigation = [
  { name: 'Dashboard', href: '/dashboard', permission: Permission.DASHBOARD_VIEW, icon: '🏠' },
  { name: 'Employee', href: '/admin/users', permission: Permission.USER_READ, icon: '👥' },
  { name: 'Payroll', href: '/payroll', permission: Permission.USER_READ, icon: '💰' },
  { name: 'Attendance', href: '/attendance', permission: Permission.ABSENSI_READ, icon: '📊' },
  { name: 'Permission', href: '/permission', permission: Permission.USER_READ, icon: '📋' },
  { name: 'Company', href: '/company', permission: Permission.USER_READ, icon: '🏢' },
];

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't render navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  // Don't render navigation while loading or if no session
  if (status === 'loading') {
    return (
      <div className="w-16 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-sm">...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-64 bg-gray-900 flex items-center justify-center">
        <Link href="/auth/signin" className="text-white hover:text-gray-300">
          Sign In
        </Link>
      </div>
    );
  }

  const filteredNavigation = navigation.filter(item =>
    hasPermission(session.user.role, item.permission)
  );

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900/30 to-gray-900/10 backdrop-blur-xl border-r border-white/20 flex flex-col h-screen shadow-glass">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
            <img
              src="/favicon.ico"
              alt="Absensi PKP Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Absensi PKP</h1>
            <p className="text-gray-300 text-xs">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm hover:shadow-md'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/20 bg-gradient-to-t from-white/5 to-transparent">
        {/* User Profile */}
        <div className="flex items-center space-x-3 mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-sm">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {session.user.name || 'User'}
            </p>
            <p className="text-gray-300 text-xs capitalize">
              {session.user.role || 'user'}
            </p>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm transition-all duration-200 hover:shadow-md"
          >
            <span className="text-lg">⚙️</span>
            <span>Setting</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 hover:shadow-md w-full"
          >
            <span className="text-lg">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
