import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';
import { DollarSign, Users, FileText, TrendingUp, Plus, Eye, BarChart3, Download } from 'lucide-react';

async function getPayrollData(userId: string, userRole: string) {
  try {
    let whereCondition: any = {};

    if (userRole === 'user') {
      whereCondition.userId = userId;
    } else if (userRole === 'manager') {
      // Manager can see their team's payroll
      whereCondition = {
        user: {
          department: (await prisma.user.findUnique({
            where: { id: userId },
            select: { department: true }
          }))?.department,
        },
      };
    }
    // Admin can see all payroll records

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
      orderBy: [
        { date: 'desc' },
      ],
      take: 100, // Last 100 records for payroll calculation
    });

    // Calculate payroll statistics
    const totalWorkHours = records.reduce((sum, record) => sum + Number(record.workHours || 0), 0);
    const totalOvertimeHours = records.reduce((sum, record) => sum + Number(record.overtimeHours || 0), 0);

    // Group by user for payroll summary
    const payrollByUser = records.reduce((acc, record) => {
      const userId = record.user.id;
      if (!acc[userId]) {
        acc[userId] = {
          user: record.user,
          records: [],
          totalHours: 0,
          totalOvertime: 0,
          totalSalary: 0,
        };
      }
      acc[userId].records.push(record);
      acc[userId].totalHours += Number(record.workHours || 0);
      acc[userId].totalOvertime += Number(record.overtimeHours || 0);
      return acc;
    }, {} as Record<string, any>);

    // Calculate work hours summary for each user
    Object.values(payrollByUser).forEach((userData: any) => {
      const totalWorkHours = userData.totalHours || 0;
      // Simplified work hours summary (no salary calculations as payroll is not in scope)
    });

    return {
      totalRecords: records.length,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
      payrollByUser: Object.values(payrollByUser),
      recentRecords: records.slice(0, 10),
    };
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    return {
      totalRecords: 0,
      totalWorkHours: 0,
      totalOvertimeHours: 0,
      payrollByUser: [],
      recentRecords: [],
    };
  }
}

export default async function PayrollPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has permission to view payroll
  if (!hasPermission(session.user.role, Permission.USER_READ)) {
    redirect('/dashboard');
  }

  const payrollData = await getPayrollData(session.user.id, session.user.role);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            <DollarSign className="h-6 w-6" /> Payroll Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage payroll calculations and employee compensation
          </p>
        </div>

        {/* Payroll Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Work Hours</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{payrollData.totalWorkHours}h</div>
              <p className="text-xs text-gray-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Overtime Hours</CardTitle>
              <div className="p-2 bg-yellow-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{payrollData.totalOvertimeHours}h</div>
              <p className="text-xs text-gray-400">1.5x rate eligible</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Employees</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{payrollData.payrollByUser.length}</div>
              <p className="text-xs text-gray-400">With records this month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Payroll</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                Rp {payrollData.payrollByUser.reduce((sum, user: any) => sum + user.totalSalary, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Estimated payroll cost</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Payroll Summary */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Payroll Summary
              </CardTitle>
              <CardDescription className="text-gray-400">
                Individual payroll calculations for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payrollData.payrollByUser.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No payroll data available for this month.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollData.payrollByUser.map((userData: any) => (
                    <div key={userData.user.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-white">{userData.user.name}</div>
                          <div className="text-sm text-gray-400">{userData.user.position || 'Employee'}</div>
                          {userData.user.department && (
                            <div className="text-sm text-gray-400">{userData.user.department}</div>
                          )}
                        </div>
                        <Badge className="bg-green-900/20 text-green-400">
                          Rp {userData.totalSalary.toLocaleString()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Regular Hours:</span>
                          <div className="font-medium text-white">{userData.totalHours}h</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Overtime:</span>
                          <div className="font-medium text-yellow-400">{userData.totalOvertime}h</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Hours:</span>
                          <div className="font-medium text-white">{userData.totalHours?.toFixed(1) || 0}h</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Records:</span>
                          <div className="font-medium text-white">{userData.records.length}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll Actions */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payroll Actions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate reports and manage payroll processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <DollarSign className="h-4 w-4" /> Generate Payroll Report
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="h-4 w-4" /> Export Pay Slips
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <BarChart3 className="h-4 w-4" /> Salary Adjustment
              </Button>
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <TrendingUp className="h-4 w-4" /> Tax Calculation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Payroll Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest attendance records affecting payroll calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payrollData.recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent activity found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Overtime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {payrollData.recentRecords.map((record: any) => (
                      <tr key={record.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {record.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(record.date), 'MMM dd')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {Number(record.workHours || 0).toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">
                          {Number(record.overtimeHours || 0).toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${
                            record.status === 'present' ? 'bg-green-900/20 text-green-400' :
                            record.status === 'late' ? 'bg-yellow-900/20 text-yellow-400' :
                            'bg-red-900/20 text-red-400'
                          }`}>
                            {record.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
