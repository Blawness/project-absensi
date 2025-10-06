import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermissions } from '@/lib/middleware/rbac-middleware';
import { Permission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { calculateCheckInStatus, validateCheckInTime } from '@/lib/attendance-calculations';

export async function POST(request: NextRequest) {
  try {
    // Check permissions - only admins and managers can do admin check-ins
    const rbacResponse = await requirePermissions(
      request,
      [Permission.ABSENSI_CREATE, Permission.ABSENSI_UPDATE] // Admins and managers can do this
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

    // Get data from request body
    const body = await request.json();
    const { userId, location, notes } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!location || !location.latitude || !location.longitude) {
      return NextResponse.json(
        { error: 'Location data is required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, isActive: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    if (!targetUser.isActive) {
      return NextResponse.json(
        { error: 'Target user is not active' },
        { status: 400 }
      );
    }

    // Check if target user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await prisma.absensiRecord.findFirst({
      where: {
        userId: userId,
        date: today,
        checkInTime: { not: null },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: `${targetUser.name} has already checked in today` },
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
        userId: userId,
        date: today,
        checkInTime: checkInTime,
        checkInLatitude: location.latitude,
        checkInLongitude: location.longitude,
        checkInAddress: location.address,
        checkInAccuracy: location.accuracy,
        status: calculations.status || 'present',
        lateMinutes: calculations.lateMinutes || 0,
        notes: notes || `Checked in by admin: ${session.user.name}`,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'admin_check_in',
        resourceType: 'absensi_record',
        resourceId: attendanceRecord.id,
        details: {
          targetUserId: userId,
          targetUserName: targetUser.name,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            accuracy: location.accuracy,
            timestamp: location.timestamp?.toISOString(),
            altitude: location.altitude,
            heading: location.heading,
            speed: location.speed,
          },
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Check-in successful for ${targetUser.name}`,
      data: attendanceRecord,
    });

  } catch (error) {
    console.error('Admin check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
