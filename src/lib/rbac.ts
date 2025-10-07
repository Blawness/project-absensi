import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';
import { Permission } from '@/types/permissions';

// Re-export Permission for convenience
export { Permission } from '@/types/permissions';

// Using Permission enum from @/types/permissions
// All permission constants are now imported from the centralized permissions file

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // User Management - Full access
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    // Attendance Management - Full access
    Permission.ABSENSI_CREATE,
    Permission.ABSENSI_READ,
    Permission.ABSENSI_UPDATE,
    Permission.ABSENSI_DELETE,
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,

    // Reports - Full access
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.REPORT_GENERATE,

    // Settings - Full access
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SETTINGS_MANAGE,

    // System - Full access
    Permission.SYSTEM_ADMIN,
    Permission.SYSTEM_AUDIT,
    Permission.SYSTEM_BACKUP,
  ],
  manager: [
    // Dashboard - Manager access
    Permission.DASHBOARD_VIEW,
    Permission.DASHBOARD_MANAGER,

    // User Management - Read only for their team
    Permission.USER_READ,

    // Attendance Management - Full access
    Permission.ABSENSI_CREATE,
    Permission.ABSENSI_READ,
    Permission.ABSENSI_UPDATE,
    Permission.ABSENSI_DELETE,
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,

    // Reports - Team access
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,

    // Settings - Read only
    Permission.SETTINGS_READ,

    // Location - View access
    Permission.LOCATION_VIEW,
  ],
  user: [
    // Dashboard - View access
    Permission.DASHBOARD_VIEW,

    // Attendance - Self only
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,
    Permission.ABSENSI_READ,

    // Reports - Self only
    Permission.REPORT_READ,

    // Location - View access
    Permission.LOCATION_VIEW,

    // Additional permissions for basic attendance functionality
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_READ,
  ],
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  try {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  } catch (error) {
    console.error('hasPermission error:', error);
    return false;
  }
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  try {
    return permissions.some(permission => hasPermission(userRole, permission));
  } catch (error) {
    console.error('hasAnyPermission error:', error);
    return false;
  }
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  try {
    return permissions.every(permission => hasPermission(userRole, permission));
  } catch (error) {
    console.error('hasAllPermissions error:', error);
    return false;
  }
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  try {
    return ROLE_PERMISSIONS[userRole] || [];
  } catch (error) {
    console.error('getUserPermissions error:', error);
    return [];
  }
};

export const canAccessRoute = (session: Session | null, requiredPermissions: Permission[]): boolean => {
  try {
    if (!session?.user?.role) return false;
    return hasAnyPermission(session.user.role, requiredPermissions);
  } catch (error) {
    console.error('canAccessRoute error:', error);
    return false;
  }
};

export const canAccessRouteByPath = (userRole: UserRole, pathname: string): boolean => {
  // Define route permissions mapping
  const routePermissions: Record<string, Permission[]> = {
    '/admin': [Permission.SYSTEM_ADMIN],
    '/users': [Permission.USER_READ],
    '/users/create': [Permission.USER_CREATE],
    '/users/edit': [Permission.USER_UPDATE],
    '/reports/export': [Permission.REPORT_EXPORT],
    '/settings': [Permission.SETTINGS_READ],
    '/system': [Permission.SETTINGS_MANAGE],
    '/locations': [Permission.LOCATION_MANAGE],
    '/dashboard': [Permission.DASHBOARD_VIEW],
    '/api/attendance': [Permission.ABSENSI_READ],
    '/api/users': [Permission.USER_READ],
    '/api/reports': [Permission.REPORT_READ],
  };

  // Check if any route pattern matches
  for (const [routePattern, permissions] of Object.entries(routePermissions)) {
    if (pathname.startsWith(routePattern)) {
      return hasAnyPermission(userRole, permissions);
    }
  }

  // Default to allowing access if no specific permissions are defined
  return true;
};

export const canAccessAdminPanel = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.SYSTEM_ADMIN]);
};

export const canManageUsers = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE]);
};

export const canManageAttendance = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.ABSENSI_UPDATE, Permission.ABSENSI_DELETE]);
};

export const canViewAllReports = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.REPORT_GENERATE]);
};

export const canExportReports = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.REPORT_EXPORT]);
};

export const canManageSettings = (session: Session | null): boolean => {
  return canAccessRoute(session, [Permission.SETTINGS_UPDATE, Permission.SETTINGS_MANAGE]);
};