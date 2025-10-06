import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermissions } from '@/lib/middleware/rbac-middleware';
import { Permission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { calculateWorkHours, validateCheckOutTime } from '@/lib/attendance-calculations';

export async function POST(request: NextRequest) {
  try {
    // Check permissions - only admins and managers can do admin check-outs
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

    // Find today's check-in record for the target user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = await prisma.absensiRecord.findFirst({
      where: {
        userId: userId,
        date: today,
        checkInTime: { not: null },
        checkOutTime: null,
      },
    });

    if (!attendanceRecord) {
      return NextResponse.json(
        { error: `${targetUser.name} has no check-in record for today` },
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
        checkOutLatitude: location.latitude,
        checkOutLongitude: location.longitude,
        checkOutAddress: location.address,
        checkOutAccuracy: location.accuracy,
        workHours: calculations.workHours,
        overtimeHours: calculations.overtimeHours,
        lateMinutes: calculations.lateMinutes,
        status: calculations.status,
        notes: notes || `Checked out by admin: ${session.user.name}`,
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
        action: 'admin_check_out',
        resourceType: 'absensi_record',
        resourceId: updatedRecord.id,
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
          workHours: updatedRecord.workHours?.toString(),
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Check-out successful for ${targetUser.name}`,
      data: updatedRecord,
    });

  } catch (error) {
    console.error('Admin check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
