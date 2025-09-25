import { AttendanceStatus } from '@prisma/client';

export interface WorkHoursCalculation {
  workHours: number;
  overtimeHours: number;
  lateMinutes: number;
  status: AttendanceStatus;
}

/**
 * Calculate work hours and determine attendance status
 */
export function calculateWorkHours(
  checkInTime: Date,
  checkOutTime: Date,
  expectedCheckInTime?: Date
): WorkHoursCalculation {
  // Calculate work hours in hours
  const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  
  // Calculate overtime (assuming 8 hours standard work day)
  const overtimeHours = Math.max(0, workHours - 8);
  
  // Calculate late minutes (assuming 8:00 AM standard check-in time)
  const standardCheckInTime = expectedCheckInTime || new Date(checkInTime);
  standardCheckInTime.setHours(8, 0, 0, 0);
  
  const lateMinutes = Math.max(0, (checkInTime.getTime() - standardCheckInTime.getTime()) / (1000 * 60));
  
  // Determine status based on business rules
  let status: AttendanceStatus;
  
  if (workHours < 4) {
    status = 'half_day';
  } else if (lateMinutes > 15) {
    status = 'late';
  } else {
    status = 'present';
  }
  
  return {
    workHours: Math.round(workHours * 100) / 100, // Round to 2 decimal places
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    lateMinutes: Math.round(lateMinutes),
    status,
  };
}

/**
 * Calculate work hours for check-in only (without check-out)
 */
export function calculateCheckInStatus(
  checkInTime: Date,
  expectedCheckInTime?: Date
): Partial<WorkHoursCalculation> {
  // Calculate late minutes (assuming 8:00 AM standard check-in time)
  const standardCheckInTime = expectedCheckInTime || new Date(checkInTime);
  standardCheckInTime.setHours(8, 0, 0, 0);
  
  const lateMinutes = Math.max(0, (checkInTime.getTime() - standardCheckInTime.getTime()) / (1000 * 60));
  
  // Determine initial status based on check-in time
  let status: AttendanceStatus;
  
  if (lateMinutes > 15) {
    status = 'late';
  } else {
    status = 'present';
  }
  
  return {
    lateMinutes: Math.round(lateMinutes),
    status,
  };
}

/**
 * Validate check-in time against work schedule
 */
export function validateCheckInTime(checkInTime: Date): { isValid: boolean; message?: string } {
  const hour = checkInTime.getHours();
  const minute = checkInTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  // Check-in allowed between 06:00 and 10:00
  const minCheckInTime = 6 * 60; // 06:00
  const maxCheckInTime = 10 * 60; // 10:00
  
  if (timeInMinutes < minCheckInTime) {
    return {
      isValid: false,
      message: 'Check-in is only allowed after 06:00 AM'
    };
  }
  
  if (timeInMinutes > maxCheckInTime) {
    return {
      isValid: false,
      message: 'Check-in is only allowed before 10:00 AM'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate check-out time against work schedule
 */
export function validateCheckOutTime(checkOutTime: Date): { isValid: boolean; message?: string } {
  const hour = checkOutTime.getHours();
  const minute = checkOutTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;
  
  // Check-out allowed between 14:00 and 22:00
  const minCheckOutTime = 14 * 60; // 14:00
  const maxCheckOutTime = 22 * 60; // 22:00
  
  if (timeInMinutes < minCheckOutTime) {
    return {
      isValid: false,
      message: 'Check-out is only allowed after 02:00 PM'
    };
  }
  
  if (timeInMinutes > maxCheckOutTime) {
    return {
      isValid: false,
      message: 'Check-out is only allowed before 10:00 PM'
    };
  }
  
  return { isValid: true };
}

/**
 * Format work hours for display
 */
export function formatWorkHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format late minutes for display
 */
export function formatLateMinutes(minutes: number): string {
  if (minutes === 0) {
    return 'On time';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${minutes}m late`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h late`;
  }
  
  return `${hours}h ${remainingMinutes}m late`;
}
