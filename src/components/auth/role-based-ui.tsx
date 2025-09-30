'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { Permission, hasPermission, hasAnyPermission } from '@/lib/rbac';

interface RoleBasedUIProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface RoleSpecificProps {
  admin?: ReactNode;
  manager?: ReactNode;
  user?: ReactNode;
  fallback?: ReactNode;
}

export function ShowForPermission({
  children,
  requiredPermission,
  fallback = null
}: {
  children: ReactNode;
  requiredPermission: Permission;
  fallback?: ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{fallback}</>;
  }

  if (!hasPermission(session.user.role, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function ShowForPermissions({
  children,
  requiredPermissions,
  requireAll = false,
  fallback = null
}: {
  children: ReactNode;
  requiredPermissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? requiredPermissions.every(p => hasPermission(session.user.role, p))
    : requiredPermissions.some(p => hasPermission(session.user.role, p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RoleSpecificUI({ admin, manager, user, fallback }: RoleSpecificProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{fallback}</>;
  }

  switch (session.user.role) {
    case 'admin':
      return <>{admin}</>;
    case 'manager':
      return <>{manager}</>;
    case 'user':
      return <>{user}</>;
    default:
      return <>{fallback}</>;
  }
}

export function AdminUI({ children, fallback }: RoleBasedUIProps) {
  return (
    <ShowForPermission requiredPermission={Permission.SYSTEM_ADMIN} fallback={fallback}>
      {children}
    </ShowForPermission>
  );
}

export function ManagerUI({ children, fallback }: RoleBasedUIProps) {
  return (
    <ShowForPermissions
      requiredPermissions={[Permission.USER_UPDATE, Permission.REPORT_EXPORT]}
      fallback={fallback}
    >
      {children}
    </ShowForPermissions>
  );
}

export function UserUI({ children, fallback }: RoleBasedUIProps) {
  return (
    <ShowForPermission requiredPermission={Permission.ABSENSI_CHECKIN} fallback={fallback}>
      {children}
    </ShowForPermission>
  );
}

export function HideForPermission({
  children,
  hiddenPermission,
  showInstead
}: {
  children: ReactNode;
  hiddenPermission: Permission;
  showInstead: ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return <>{showInstead}</>;
  }

  if (hasPermission(session.user.role, hiddenPermission)) {
    return <>{showInstead}</>;
  }

  return <>{children}</>;
}



