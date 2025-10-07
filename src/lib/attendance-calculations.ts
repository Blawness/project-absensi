import { AttendanceStatus } from '@prisma/client';
import { validateLocation, getOfficeLocation } from './location';

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

  // Calculate late minutes (assuming 9:00 AM standard check-in time)
  const standardCheckInTime = expectedCheckInTime || new Date(checkInTime);
  standardCheckInTime.setHours(9, 0, 0, 0);

  const lateMinutes = Math.max(0, (checkInTime.getTime() - standardCheckInTime.getTime()) / (1000 * 60));

  // Determine status based on business rules
  let status: AttendanceStatus;

  if (workHours < 4) {
    status = 'half_day';
  } else if (lateMinutes > 0) { // Any minutes after 9 AM are considered late
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
 * Determine check-in status based on time and location
 */
export async function determineCheckInStatus(
  checkInTime: Date,
  location?: { latitude: number; longitude: number; accuracy: number },
  expectedCheckInTime?: Date
): Promise<{ status: AttendanceStatus; lateMinutes: number; isWithinGeofence: boolean }> {
  // Calculate late minutes (assuming 9:00 AM standard check-in time)
  const standardCheckInTime = expectedCheckInTime || new Date(checkInTime);
  standardCheckInTime.setHours(9, 0, 0, 0);

  const lateMinutes = Math.max(0, (checkInTime.getTime() - standardCheckInTime.getTime()) / (1000 * 60));

  // Check location against geofence
  let isWithinGeofence = false;
  if (location) {
    try {
      const officeLocation = await getOfficeLocation();
      isWithinGeofence = validateLocation(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          address: '',
          timestamp: new Date()
        },
        officeLocation
      );
    } catch (error) {
      console.error('Error validating location:', error);
      isWithinGeofence = false; // Default to outside if validation fails
    }
  }

  // Determine status based on location and time
  let status: AttendanceStatus;

  if (!isWithinGeofence) {
    status = 'outside';
  } else if (lateMinutes > 0) {
    status = 'late';
  } else {
    status = 'present';
  }

  return {
    status,
    lateMinutes: Math.round(lateMinutes),
    isWithinGeofence,
  };
}

/**
 * Calculate work hours for check-in only (without check-out)
 */
export function calculateCheckInStatus(
  checkInTime: Date,
  location?: { latitude: number; longitude: number; accuracy: number },
  expectedCheckInTime?: Date
): Partial<WorkHoursCalculation> {
  // This function is kept for backward compatibility
  // Use determineCheckInStatus for new implementations
  const standardCheckInTime = expectedCheckInTime || new Date(checkInTime);
  standardCheckInTime.setHours(9, 0, 0, 0);

  const lateMinutes = Math.max(0, (checkInTime.getTime() - standardCheckInTime.getTime()) / (1000 * 60));

  // Default to present/late - location validation will be handled separately
  let status: AttendanceStatus;
  if (lateMinutes > 0) {
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
  // Allow check-in anytime - no time restrictions
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
