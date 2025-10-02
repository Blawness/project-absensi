import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

async function getReportData(userId: string, userRole: string) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let whereCondition: any = {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (userRole === 'user') {
      whereCondition.userId = userId;
    } else if (userRole === 'manager') {
      // Manager can see their team's records
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { department: true }
      });
      whereCondition = {
        ...whereCondition,
        user: {
          department: user?.department,
        },
      };
    }
    // Admin can see all records

    const records = await prisma.absensiRecord.findMany({
      where: whereCondition,
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

    // Calculate statistics
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const halfDayCount = records.filter(r => r.status === 'half_day').length;

    const totalWorkHours = records.reduce((sum, record) => sum + Number(record.workHours || 0), 0);
    const averageWorkHours = totalRecords > 0 ? totalWorkHours / totalRecords : 0;

    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    return {
      totalRecords,
      presentCount,
      lateCount,
      absentCount,
      halfDayCount,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      averageWorkHours: Math.round(averageWorkHours * 100) / 100,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    };
  } catch (error) {
    console.error('Error fetching report data:', error);
    return {
      totalRecords: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      halfDayCount: 0,
      totalWorkHours: 0,
      averageWorkHours: 0,
      attendancePercentage: 0,
    };
  }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const reportData = await getReportData(session.user.id, session.user.role);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            📈 Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            View attendance reports and analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalRecords}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{reportData.presentCount}</div>
              <p className="text-xs text-muted-foreground">On time attendance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reportData.lateCount}</div>
              <p className="text-xs text-muted-foreground">Late arrivals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{reportData.absentCount}</div>
              <p className="text-xs text-muted-foreground">Absent days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Monthly Summary</CardTitle>
              <CardDescription>
                Attendance statistics for {format(new Date(), 'MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Attendance Rate:</span>
                  <span className="text-lg font-bold text-green-600">
                    {reportData.attendancePercentage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Work Hours:</span>
                  <span className="text-lg font-bold">
                    {reportData.totalWorkHours}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Daily Hours:</span>
                  <span className="text-lg font-bold">
                    {reportData.averageWorkHours}h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Half Days:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {reportData.halfDayCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📤 Export Options</CardTitle>
              <CardDescription>
                Download reports in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                📄 Export to PDF
              </Button>
              <Button variant="outline" className="w-full">
                📊 Export to CSV
              </Button>
              <Button variant="outline" className="w-full">
                📈 Generate Custom Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
