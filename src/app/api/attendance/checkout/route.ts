import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermissions } from '@/lib/middleware/rbac-middleware';
import { Permission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { getCurrentLocation } from '@/lib/location';
import { calculateWorkHours, validateCheckOutTime } from '@/lib/attendance-calculations';

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    const rbacResponse = await requirePermissions(
      request,
      [Permission.ABSENSI_CHECKOUT]
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

    // Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = await prisma.absensiRecord.findFirst({
      where: {
        userId: session.user.id,
        date: today,
        checkInTime: { not: null },
        checkOutTime: null,
      },
    });

    if (!attendanceRecord) {
      return NextResponse.json(
        { error: 'No check-in record found for today' },
        { status: 400 }
      );
    }

    // Validate check-out time
    const checkOutTime = new Date();
    const timeValidation = validateCheckOutTime(checkOutTime);
    
    if (!timeValidation.isValid) {
      return NextResponse.json(
        { error: timeValidation.message },
        { status: 400 }
      );
    }

    // Calculate work hours and final status
    const calculations = calculateWorkHours(
      attendanceRecord.checkInTime!,
      checkOutTime
    );

    // Update attendance record with check-out
    const updatedRecord = await prisma.absensiRecord.update({
      where: { id: attendanceRecord.id },
      data: {
        checkOutTime: checkOutTime,
        checkOutLatitude: locationData.latitude,
        checkOutLongitude: locationData.longitude,
        checkOutAddress: locationData.address,
        checkOutAccuracy: locationData.accuracy,
        workHours: calculations.workHours,
        overtimeHours: calculations.overtimeHours,
        lateMinutes: calculations.lateMinutes,
        status: calculations.status,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'check_out',
        resourceType: 'absensi_record',
        resourceId: updatedRecord.id,
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
          workHours: updatedRecord.workHours?.toString(),
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Check-out successful',
      data: updatedRecord,
    });

  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
