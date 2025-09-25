import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermissions } from '@/lib/middleware/rbac-middleware';
import { Permission, hasPermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build where clause based on user role
    let where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (session.user.role !== 'admin') {
      // Non-admin users can only see their own records
      where.userId = session.user.id;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const records = await prisma.absensiRecord.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { checkInTime: 'desc' },
      ],
    });

    // Filter sensitive information for non-admin users
    const filteredRecords = records.map(record => {
      if (session.user.role !== 'admin') {
        // Remove sensitive location data for non-admin users
        const { checkInLatitude, checkInLongitude, checkOutLatitude, checkOutLongitude, ...safeRecord } = record;
        return safeRecord;
      }
      return record;
    });

    return NextResponse.json({
      success: true,
      data: filteredRecords,
    });

  } catch (error) {
    console.error('Get attendance records error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
