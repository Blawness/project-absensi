'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

interface RBACGuardProps {
  children: ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function RBACGuard({
  children,
  requiredPermissions,
  requireAll = false,
  fallback = null,
  redirectTo = '/unauthorized'
}: RBACGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    if (requiredPermissions.length === 0) return; // No permissions required

    try {
      const userHasPermission = requireAll
        ? hasAllPermissions(session.user.role, requiredPermissions)
        : hasAnyPermission(session.user.role, requiredPermissions);

      if (!userHasPermission) {
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('RBAC guard error:', error);
      router.push('/auth/signin');
    }
  }, [session, status, requiredPermissions, requireAll, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="loading-spinner" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!session) {
    return <>{fallback}</>;
  }

  const userHasPermission = requireAll
    ? hasAllPermissions(session.user.role, requiredPermissions)
    : hasAnyPermission(session.user.role, requiredPermissions);

  if (!userHasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACGuard
      requiredPermissions={[Permission.SYSTEM_ADMIN]}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}

export function ManagerOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACGuard
      requiredPermissions={[Permission.SYSTEM_ADMIN]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}

export function ManagerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACGuard
      requiredPermissions={[Permission.USER_UPDATE, Permission.REPORT_EXPORT]}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}

export function UserOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RBACGuard
      requiredPermissions={[Permission.ABSENSI_CHECKIN]}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}
