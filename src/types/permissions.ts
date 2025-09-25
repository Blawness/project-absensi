import { UserRole } from '@prisma/client';

// Re-export UserRole for use in other modules
export { UserRole };

// Permission definitions
export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // Attendance Management
  ATTENDANCE_CREATE = 'attendance:create',
  ATTENDANCE_READ = 'attendance:read',
  ATTENDANCE_UPDATE = 'attendance:update',
  ATTENDANCE_DELETE = 'attendance:delete',
  ATTENDANCE_APPROVE = 'attendance:approve',

  // Reports
  REPORT_READ = 'report:read',
  REPORT_EXPORT = 'report:export',
  REPORT_GENERATE = 'report:generate',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  SETTINGS_MANAGE = 'settings:manage',

  // System Administration
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_MONITOR = 'system:monitor',

  // Dashboard
  DASHBOARD_VIEW = 'dashboard:view',
  DASHBOARD_ADMIN = 'dashboard:admin',
  DASHBOARD_MANAGER = 'dashboard:manager',

  // Location Services
  LOCATION_MANAGE = 'location:manage',
  LOCATION_VIEW = 'location:view',
  GEOFENCING_CONFIGURE = 'geofencing:configure',

  // Additional permissions for attendance system
  ABSENSI_CREATE = 'absensi:create',
  ABSENSI_READ = 'absensi:read',
  ABSENSI_UPDATE = 'absensi:update',
  ABSENSI_DELETE = 'absensi:delete',
  ABSENSI_CHECKIN = 'absensi:checkin',
  ABSENSI_CHECKOUT = 'absensi:checkout',
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_AUDIT = 'system:audit',
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // All permissions for admin
    ...Object.values(Permission),
  ],
  manager: [
    // Manager permissions
    Permission.USER_READ,
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_UPDATE,
    Permission.ATTENDANCE_APPROVE,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.REPORT_GENERATE,
    Permission.SETTINGS_READ,
    Permission.DASHBOARD_VIEW,
    Permission.DASHBOARD_MANAGER,
    Permission.LOCATION_VIEW,
    // Additional attendance permissions
    Permission.ABSENSI_CREATE,
    Permission.ABSENSI_READ,
    Permission.ABSENSI_UPDATE,
    Permission.ABSENSI_DELETE,
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,
  ],
  user: [
    // Basic user permissions
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_READ,
    Permission.REPORT_READ,
    Permission.DASHBOARD_VIEW,
    Permission.LOCATION_VIEW,
    // Additional attendance permissions
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,
    Permission.ABSENSI_READ,
  ],
};

// Permission groups for UI organization
export const PERMISSION_GROUPS = {
  'User Management': [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
  ],
  'Attendance Management': [
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_UPDATE,
    Permission.ATTENDANCE_DELETE,
    Permission.ATTENDANCE_APPROVE,
    Permission.ABSENSI_CREATE,
    Permission.ABSENSI_READ,
    Permission.ABSENSI_UPDATE,
    Permission.ABSENSI_DELETE,
    Permission.ABSENSI_CHECKIN,
    Permission.ABSENSI_CHECKOUT,
  ],
  'Reports & Analytics': [
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.REPORT_GENERATE,
  ],
  'System Settings': [
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SETTINGS_MANAGE,
  ],
  'System Administration': [
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_MONITOR,
  ],
  'Dashboard': [
    Permission.DASHBOARD_VIEW,
    Permission.DASHBOARD_ADMIN,
    Permission.DASHBOARD_MANAGER,
  ],
  'Location Services': [
    Permission.LOCATION_MANAGE,
    Permission.LOCATION_VIEW,
    Permission.GEOFENCING_CONFIGURE,
  ],
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  // User Management
  [Permission.USER_CREATE]: 'Create new users',
  [Permission.USER_READ]: 'View user information',
  [Permission.USER_UPDATE]: 'Edit user details',
  [Permission.USER_DELETE]: 'Delete users',
  [Permission.USER_MANAGE_ROLES]: 'Manage user roles and permissions',

  // Attendance Management
  [Permission.ATTENDANCE_CREATE]: 'Create attendance records',
  [Permission.ATTENDANCE_READ]: 'View attendance records',
  [Permission.ATTENDANCE_UPDATE]: 'Edit attendance records',
  [Permission.ATTENDANCE_DELETE]: 'Delete attendance records',
  [Permission.ATTENDANCE_APPROVE]: 'Approve attendance records',

  // Reports
  [Permission.REPORT_READ]: 'View reports',
  [Permission.REPORT_EXPORT]: 'Export reports',
  [Permission.REPORT_GENERATE]: 'Generate custom reports',

  // Settings
  [Permission.SETTINGS_READ]: 'View system settings',
  [Permission.SETTINGS_UPDATE]: 'Update system settings',
  [Permission.SETTINGS_MANAGE]: 'Manage system configuration',

  // System Administration
  [Permission.SYSTEM_CONFIG]: 'Configure system settings',
  [Permission.SYSTEM_BACKUP]: 'Manage system backups',
  [Permission.SYSTEM_MONITOR]: 'Monitor system health',

  // Dashboard
  [Permission.DASHBOARD_VIEW]: 'Access dashboard',
  [Permission.DASHBOARD_ADMIN]: 'Access admin dashboard',
  [Permission.DASHBOARD_MANAGER]: 'Access manager dashboard',

  // Location Services
  [Permission.LOCATION_MANAGE]: 'Manage location settings',
  [Permission.LOCATION_VIEW]: 'View location information',
  [Permission.GEOFENCING_CONFIGURE]: 'Configure geofencing settings',

  // Additional attendance permissions
  [Permission.ABSENSI_CREATE]: 'Create attendance records',
  [Permission.ABSENSI_READ]: 'View attendance records',
  [Permission.ABSENSI_UPDATE]: 'Update attendance records',
  [Permission.ABSENSI_DELETE]: 'Delete attendance records',
  [Permission.ABSENSI_CHECKIN]: 'Check in to work',
  [Permission.ABSENSI_CHECKOUT]: 'Check out from work',
  [Permission.SYSTEM_ADMIN]: 'System administration access',
  [Permission.SYSTEM_AUDIT]: 'View system audit logs',
};

// Resource types for activity logging
export type ResourceType =
  | 'user'
  | 'attendance_record'
  | 'report'
  | 'setting'
  | 'system'
  | 'location';

// Permission check result
export interface PermissionCheck {
  hasPermission: boolean;
  userRole: UserRole;
  requiredPermission: Permission;
  message?: string;
}

// RBAC context type
export interface RBACContextType {
  user: {
    id: string;
    role: UserRole;
    permissions: Permission[];
  } | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
}
