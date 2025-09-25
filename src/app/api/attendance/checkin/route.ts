import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermissions, rbacMiddleware } from '@/lib/middleware/rbac-middleware';
import { Permission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { getCurrentLocation } from '@/lib/location';
import { calculateCheckInStatus, validateCheckInTime } from '@/lib/attendance-calculations';

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    const rbacResponse = await requirePermissions(
      request,
      [Permission.ABSENSI_CHECKIN]
    );

    if (rbacResponse) {
      return rbacResponse;
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get location data from request body
    const body = await request.json();
    const locationData = body.location;

    if (!locationData || !locationData.latitude || !locationData.longitude) {
      return NextResponse.json(
        { error: 'Location data is required' },
        { status: 400 }
      );
    }

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await prisma.absensiRecord.findFirst({
      where: {
        userId: session.user.id,
        date: today,
        checkInTime: { not: null },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Validate check-in time
    const checkInTime = new Date();
    const timeValidation = validateCheckInTime(checkInTime);
    
    if (!timeValidation.isValid) {
      return NextResponse.json(
        { error: timeValidation.message },
        { status: 400 }
      );
    }

    // Calculate initial status and late minutes
    const calculations = calculateCheckInStatus(checkInTime);

    // Create attendance record
    const attendanceRecord = await prisma.absensiRecord.create({
      data: {
        userId: session.user.id,
        date: today,
        checkInTime: checkInTime,
        checkInLatitude: locationData.latitude,
        checkInLongitude: locationData.longitude,
        checkInAddress: locationData.address,
        checkInAccuracy: locationData.accuracy,
        status: calculations.status || 'present',
        lateMinutes: calculations.lateMinutes || 0,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'check_in',
        resourceType: 'absensi_record',
        resourceId: attendanceRecord.id,
        details: {
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            address: locationData.address,
            accuracy: locationData.accuracy,
            timestamp: locationData.timestamp.toISOString(),
            altitude: locationData.altitude,
            heading: locationData.heading,
            speed: locationData.speed,
          },
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Check-in successful',
      data: attendanceRecord,
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
