import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map } from '@/components/ui/map';
import { MapGeofence } from '@/components/ui/map-geofence';
import { format } from 'date-fns';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';
import { Building2, MapPin, Mail, TrendingUp, Settings, Plus, Users, Eye, BarChart3, Building } from 'lucide-react';

async function getCompanyData() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            absensiRecords: true,
          },
        },
      },
    });

    const attendanceRecords = await prisma.absensiRecord.findMany({
      take: 1000, // Get recent records for statistics
      include: {
        user: {
          select: {
            department: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate department statistics
    const departmentStats = attendanceRecords.reduce((acc, record) => {
      const dept = record.user.department || 'No Department';
      if (!acc[dept]) {
        acc[dept] = { count: 0, users: new Set() };
      }
      acc[dept].count += 1;
      acc[dept].users.add(record.userId);
      return acc;
    }, {} as Record<string, any>);

    // Convert sets to counts
    Object.keys(departmentStats).forEach(dept => {
      departmentStats[dept].userCount = departmentStats[dept].users.size;
      delete departmentStats[dept].users;
    });

    // Get unique departments
    const departments = [...new Set(users.map(u => u.department).filter(Boolean))] as string[];

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalRecords: attendanceRecords.length,
      departments: departments,
      departmentStats: departmentStats,
      recentActivity: attendanceRecords.slice(0, 5),
    };
  } catch (error) {
    console.error('Error fetching company data:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRecords: 0,
      departments: [],
      departmentStats: {},
      recentActivity: [],
    };
  }
}

export default async function CompanyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has permission to view company info
  if (!hasPermission(session.user.role, Permission.USER_READ)) {
    redirect('/dashboard');
  }

  const companyData = await getCompanyData();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Company Overview
          </h1>
          <p className="text-gray-400 mt-2">
            Company information, departments, and organizational structure
          </p>
        </div>

        {/* Company Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Employees</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{companyData.totalUsers}</div>
              <p className="text-xs text-gray-400">Registered employees</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Employees</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{companyData.activeUsers}</div>
              <p className="text-xs text-gray-400">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Departments</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{companyData.departments.length}</div>
              <p className="text-xs text-gray-400">Active departments</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Records</CardTitle>
              <div className="p-2 bg-yellow-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{companyData.totalRecords}</div>
              <p className="text-xs text-gray-400">Attendance records</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Overview */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">🏬 Department Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Employee distribution across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyData.departments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No departments found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyData.departments.map((dept: string) => {
                    const stats = companyData.departmentStats[dept] || { count: 0, userCount: 0 };
                    return (
                      <div key={dept} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-white">{dept}</div>
                            <div className="text-sm text-gray-400">{stats.userCount} employees</div>
                          </div>
                          <Badge className="bg-blue-900/20 text-blue-400">
                            {stats.count} records
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Employees:</span>
                            <div className="font-medium text-white">{stats.userCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Records:</span>
                            <div className="font-medium text-green-400">{stats.count}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Office Information */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5" />
                Office Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Company location and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-medium mb-3 text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Main Office
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Jl. Thamrin No. 1, Jakarta Pusat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📞</span>
                    <span>+62 21 1234 5678</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>info@company.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🌐</span>
                    <span>www.company.com</span>
                  </div>
                </div>
              </div>

              {/* Office Location Map */}
              <div className="border rounded-lg overflow-hidden">
                <Map
                  center={[-6.2088, 106.8456]}
                  zoom={16}
                  height="250px"
                >
                  <MapGeofence
                    geofence={{
                      center: { latitude: -6.2088, longitude: 106.8456 },
                      radius: 100,
                      tolerance: 10,
                    }}
                    showLabel={true}
                  />
                </Map>
              </div>

              {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                <Button className="w-full">
                  Update Office Info
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company Actions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Company Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Administrative actions for company settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Add Department
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Users className="h-4 w-4" /> Manage Employees
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <BarChart3 className="h-4 w-4" /> Department Reports
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Building className="h-4 w-4" /> Company Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Company Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest attendance activities across all departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {companyData.recentActivity.length === 0 ? (
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
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {companyData.recentActivity.map((record: any) => (
                      <tr key={record.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          Employee #{record.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {record.user.department || 'No Dept'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(record.date), 'MMM dd')}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {Number(record.workHours || 0).toFixed(1)}h
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
