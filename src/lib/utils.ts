import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatStr = 'PPP'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | string): string => {
  return format(new Date(date), 'HH:mm');
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), 'PPP HH:mm');
};

/**
 * Calculate work hours between check-in and check-out
 */
export const calculateWorkHours = (
  checkIn: Date,
  checkOut: Date
): number => {
  const diffInMinutes = differenceInMinutes(checkOut, checkIn);
  return Math.round((diffInMinutes / 60) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate late minutes from expected check-in time
 */
export const calculateLateMinutes = (
  checkInTime: Date,
  expectedCheckInTime: string = '08:00'
): number => {
  const [hours, minutes] = expectedCheckInTime.split(':').map(Number);
  const expectedTime = new Date(checkInTime);
  expectedTime.setHours(hours, minutes, 0, 0);
  
  if (checkInTime <= expectedTime) {
    return 0;
  }
  
  return differenceInMinutes(checkInTime, expectedTime);
};

/**
 * Format work hours for display
 */
export const formatWorkHours = (hours: number): string => {
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  
  if (minutes === 0) {
    return `${fullHours}h`;
  }
  
  return `${fullHours}h ${minutes}m`;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    case 'half_day':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get status display text
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'present':
      return 'Present';
    case 'late':
      return 'Late';
    case 'absent':
      return 'Absent';
    case 'half_day':
      return 'Half Day';
    default:
      return 'Unknown';
  }
};

/**
 * Get role display text
 */
export const getRoleText = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'user':
      return 'Employee';
    default:
      return 'Unknown';
  }
};

/**
 * Get role badge color
 */
export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-blue-100 text-blue-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
