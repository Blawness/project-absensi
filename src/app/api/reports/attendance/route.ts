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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const department = searchParams.get('department');
    const reportType = searchParams.get('type') || 'daily';

    // Build where clause based on user role and permissions
    let where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (session.user.role === 'user') {
      // Users can only see their own records
      where.userId = session.user.id;
    } else if (session.user.role === 'manager' && session.user.department) {
      // Managers can see their department
      where.user = {
        department: session.user.department,
      };
    }
    // Admins can see all records (no filter)

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (department && (session.user.role === 'admin' || session.user.role === 'manager')) {
      where.user = {
        department: department,
      };
    }

    let reportData;

    switch (reportType) {
      case 'daily':
        reportData = await generateDailyReport(where);
        break;
      case 'monthly':
        reportData = await generateMonthlyReport(where);
        break;
      case 'user':
        reportData = await generateUserReport(where);
        break;
      case 'department':
        reportData = await generateDepartmentReport(where);
        break;
      default:
        reportData = await generateDailyReport(where);
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      generatedAt: new Date(),
    });

  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateDailyReport(where: any) {
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
  });

  const dailyStats = records.reduce((acc, record) => {
    const dateKey = record.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        users: [],
      };
    }

    acc[dateKey].total++;
    acc[dateKey][record.status]++;
    acc[dateKey].users.push({
      id: record.user.id,
      name: record.user.name,
      department: record.user.department,
      status: record.status,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      workHours: record.workHours,
    });

    return acc;
  }, {} as Record<string, any>);

  return Object.values(dailyStats);
}

async function generateMonthlyReport(where: any) {
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
  });

  const monthlyStats = records.reduce((acc, record) => {
    const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        totalRecords: 0,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        totalWorkHours: 0,
        averageWorkHours: 0,
      };
    }

    acc[monthKey].totalRecords++;
    acc[monthKey][record.status]++;
    if (record.workHours) {
      acc[monthKey].totalWorkHours += record.workHours;
    }

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.values(monthlyStats).forEach((stat: any) => {
    stat.averageWorkHours = stat.totalRecords > 0
      ? Math.round((stat.totalWorkHours / stat.totalRecords) * 100) / 100
      : 0;
  });

  return Object.values(monthlyStats);
}

async function generateUserReport(where: any) {
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
  });

  const userStats = records.reduce((acc, record) => {
    const userKey = record.userId;
    if (!acc[userKey]) {
      acc[userKey] = {
        userId: userKey,
        user: record.user,
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        halfDays: 0,
        totalWorkHours: 0,
        totalOvertimeHours: 0,
        averageWorkHours: 0,
        attendancePercentage: 0,
      };
    }

    acc[userKey].totalDays++;
    acc[userKey][`${record.status}Days`]++;

    if (record.workHours) {
      acc[userKey].totalWorkHours += record.workHours;
    }

    if (record.overtimeHours) {
      acc[userKey].totalOvertimeHours += record.overtimeHours;
    }

    return acc;
  }, {} as Record<string, any>);

  // Calculate percentages and averages
  Object.values(userStats).forEach((stat: any) => {
    stat.attendancePercentage = Math.round((stat.presentDays / stat.totalDays) * 100);
    stat.averageWorkHours = stat.totalDays > 0
      ? Math.round((stat.totalWorkHours / stat.totalDays) * 100) / 100
      : 0;
  });

  return Object.values(userStats);
}

async function generateDepartmentReport(where: any) {
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
  });

  const departmentStats = records.reduce((acc, record) => {
    const dept = record.user.department || 'No Department';
    if (!acc[dept]) {
      acc[dept] = {
        department: dept,
        totalUsers: new Set(),
        totalRecords: 0,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        totalWorkHours: 0,
        averageWorkHours: 0,
      };
    }

    acc[dept].totalUsers.add(record.userId);
    acc[dept].totalRecords++;
    acc[dept][record.status]++;

    if (record.workHours) {
      acc[dept].totalWorkHours += record.workHours;
    }

    return acc;
  }, {} as Record<string, any>);

  // Calculate final stats
  Object.values(departmentStats).forEach((stat: any) => {
    stat.totalUsers = stat.totalUsers.size;
    stat.averageWorkHours = stat.totalRecords > 0
      ? Math.round((stat.totalWorkHours / stat.totalRecords) * 100) / 100
      : 0;
    delete stat.totalUsers; // Remove the Set object
  });

  return Object.values(departmentStats);
}
