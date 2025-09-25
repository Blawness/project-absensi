import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleSpecificUI, AdminUI, ManagerUI, UserUI } from '@/components/auth/role-based-ui';
import { Permission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import CheckInCheckOut from '@/components/attendance/checkin-checkout';

async function getDashboardStats(userId: string, userRole: string, userDepartment?: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let whereCondition: any = {};

    if (userRole === 'user') {
      whereCondition.userId = userId;
    } else if (userRole === 'manager' && userDepartment) {
      whereCondition = {
        user: {
          department: userDepartment,
        },
      };
    }
    // Admin can see all records

    // Get today's attendance
    const todayRecords = await prisma.absensiRecord.findMany({
      where: {
        ...whereCondition,
        date: today,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    // Get user's personal stats (for all roles)
    const userStats = await prisma.absensiRecord.findMany({
      where: {
        userId,
      },
    });

    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;

    const totalWorkHours = userStats.reduce((sum, record) => sum + Number(record.workHours || 0), 0);
    const averageWorkHours = userStats.length > 0 ? totalWorkHours / userStats.length : 0;

    return {
      todayStats: {
        present: presentToday,
        late: lateToday,
        absent: absentToday,
        total: todayRecords.length,
      },
      userStats: {
        totalRecords: userStats.length,
        totalWorkHours: Math.round(totalWorkHours * 100) / 100,
        averageWorkHours: Math.round(averageWorkHours * 100) / 100,
        attendanceRate: userStats.length > 0
          ? Math.round((userStats.filter(r => r.status === 'present').length / userStats.length) * 100)
          : 0,
      },
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    // Return default values if there's an error
    return {
      todayStats: {
        present: 0,
        late: 0,
        absent: 0,
        total: 0,
      },
      userStats: {
        totalRecords: 0,
        totalWorkHours: 0,
        averageWorkHours: 0,
        attendanceRate: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Dashboard session error:', error);
    redirect('/auth/signin');
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  let stats;
  try {
    stats = await getDashboardStats(session.user.id, session.user.role, session.user.department);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return a minimal dashboard with error handling
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {session.user.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Unable to load dashboard data
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading dashboard statistics. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session.user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {session.user.role} • {session.user.department}
          </p>
        </div>

        {/* Role-based content */}
        <RoleSpecificUI
          admin={
            <AdminUI>
              <AdminDashboard stats={stats} />
            </AdminUI>
          }
          manager={
            <ManagerUI>
              <ManagerDashboard stats={stats} />
            </ManagerUI>
          }
          user={
            <UserUI>
              <UserDashboard stats={stats} />
            </UserUI>
          }
        />
      </div>
    </div>
  );
}

function AdminDashboard({ stats }: { stats: any }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All Users</div>
            <p className="text-xs text-muted-foreground">Full access to system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayStats.present}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayStats.late}</div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayStats.absent}</div>
            <p className="text-xs text-muted-foreground">Not checked in</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>👥 User Management</CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">➕ Create New User</Button>
            <Button variant="outline" className="w-full">📊 View All Users</Button>
            <Button variant="outline" className="w-full">🔧 Manage Roles</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 System Reports</CardTitle>
            <CardDescription>Generate comprehensive reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">📋 Daily Report</Button>
            <Button variant="outline" className="w-full">📊 Monthly Report</Button>
            <Button variant="outline" className="w-full">📈 Export Data</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ManagerDashboard({ stats }: { stats: any }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Present</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayStats.present}</div>
            <p className="text-xs text-muted-foreground">Team members present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.todayStats.late}</div>
            <p className="text-xs text-muted-foreground">Team members late today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.todayStats.absent}</div>
            <p className="text-xs text-muted-foreground">Team members absent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>👥 Team Management</CardTitle>
            <CardDescription>Manage your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">👀 View Team</Button>
            <Button variant="outline" className="w-full">📋 Team Reports</Button>
            <Button variant="outline" className="w-full">📊 Export Team Data</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Personal Stats</CardTitle>
            <CardDescription>Your attendance record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Records:</span>
                <span className="font-medium">{stats.userStats.totalRecords}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span className="font-medium">{stats.userStats.totalWorkHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Average Hours:</span>
                <span className="font-medium">{stats.userStats.averageWorkHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance Rate:</span>
                <span className="font-medium text-green-600">{stats.userStats.attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function UserDashboard({ stats }: { stats: any }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check In/Out</CardTitle>
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <CheckInCheckOut />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Present</div>
            <p className="text-xs text-muted-foreground">Checked in at 08:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Hours</CardTitle>
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">8.0h</div>
            <p className="text-xs text-muted-foreground">Today's work hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 My Statistics</CardTitle>
            <CardDescription>Your personal attendance record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Records:</span>
                <span className="font-medium">{stats.userStats.totalRecords}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hours:</span>
                <span className="font-medium">{stats.userStats.totalWorkHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Average Hours:</span>
                <span className="font-medium">{stats.userStats.averageWorkHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance Rate:</span>
                <span className="font-medium text-green-600">{stats.userStats.attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 My Reports</CardTitle>
            <CardDescription>View your attendance reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">📅 Daily Report</Button>
            <Button variant="outline" className="w-full">📊 Monthly Report</Button>
            <Button variant="outline" className="w-full">📈 Export My Data</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
