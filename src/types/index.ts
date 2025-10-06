import { User, AbsensiRecord, ActivityLog, Setting, UserRole, AttendanceStatus } from '@prisma/client';

// Re-export Prisma types
export type { User, AbsensiRecord, ActivityLog, Setting, UserRole, AttendanceStatus };

// Location interfaces
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  timestamp: Date;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface GeofenceConfig {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  tolerance: number; // accuracy tolerance
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatarUrl?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CheckInForm {
  location: LocationData;
  notes?: string;
}

export interface CheckOutForm {
  location: LocationData;
  notes?: string;
}

// Report types
export interface AttendanceReport {
  userId: string;
  userName: string;
  department?: string;
  position?: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  averageWorkHours: number;
  attendancePercentage: number;
}

export interface DailyAttendanceReport {
  date: string;
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  halfDayCount: number;
  attendancePercentage: number;
}

// Settings types
export interface OfficeLocationSetting {
  latitude: number;
  longitude: number;
  address: string;
  radius: number;
}

export interface WorkScheduleSetting {
  check_in_start: string;
  check_in_end: string;
  check_out_start: string;
  check_out_end: string;
  work_hours_min: number;
  work_hours_max: number;
  late_tolerance: number;
}

export interface GeofencingSetting {
  enabled: boolean;
  radius_meters: number;
  accuracy_threshold: number;
}

export interface NotificationSetting {
  email_enabled: boolean;
  daily_summary: boolean;
  late_reminder: boolean;
}

// Extended types with relations
export interface UserWithRelations extends User {
  absensiRecords?: AbsensiRecord[];
  activityLogs?: ActivityLog[];
}

export interface AbsensiRecordWithUser extends AbsensiRecord {
  user: User;
}

export interface AbsensiRecordWithLocation extends AbsensiRecord {
  user: User;
  createdByAction?: string;
  createdByUser?: {
    id: string;
    name: string;
  };
  checkInLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
}

// Dashboard data types
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendancePercentage: number;
  averageWorkHours: number;
}

export interface RecentActivity {
  id: string;
  userName: string;
  action: string;
  timestamp: Date;
  details?: any;
}

// Filter and search types
export interface AttendanceFilter {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  department?: string;
}

export interface UserFilter {
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
