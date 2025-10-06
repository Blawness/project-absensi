import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';

async function getPermissionData() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            absensiRecords: true,
          },
        },
      },
      orderBy: {
        role: 'asc',
      },
    });

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      const role = user.role;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      users,
      usersByRole,
      roleStats: {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        user: users.filter(u => u.role === 'user').length,
      },
    };
  } catch (error) {
    console.error('Error fetching permission data:', error);
    return {
      users: [],
      usersByRole: {},
      roleStats: { admin: 0, manager: 0, user: 0 },
    };
  }
}

export default async function PermissionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has permission to manage permissions
  if (!hasPermission(session.user.role, Permission.USER_UPDATE)) {
    redirect('/dashboard');
  }

  const permissionData = await getPermissionData();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/20 text-red-400';
      case 'manager':
        return 'bg-blue-900/20 text-blue-400';
      case 'user':
        return 'bg-green-900/20 text-green-400';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          'Full system access',
          'User management',
          'Settings management',
          'Report generation',
          'Data export',
          'Permission management',
        ];
      case 'manager':
        return [
          'Team management',
          'Team reports',
          'Attendance oversight',
          'Basic user management',
          'Department reports',
        ];
      case 'user':
        return [
          'Check-in/out',
          'View own records',
          'Personal reports',
          'Basic profile management',
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            🔐 Permission Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage user roles and permissions
          </p>
        </div>

        {/* Role Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Administrators</CardTitle>
              <div className="p-2 bg-red-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{permissionData.roleStats.admin}</div>
              <p className="text-xs text-gray-400">Full system access</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Managers</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{permissionData.roleStats.manager}</div>
              <p className="text-xs text-gray-400">Team management</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Users</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{permissionData.roleStats.user}</div>
              <p className="text-xs text-gray-400">Basic access</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">👥 Users by Role</CardTitle>
              <CardDescription className="text-gray-400">
                View users grouped by their assigned roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(permissionData.usersByRole).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionData.usersByRole).map(([role, users]) => (
                    <div key={role} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white capitalize">{role}s</h4>
                        <Badge className={getRoleColor(role)}>
                          {users.length} {role}(s)
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {users.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-white text-sm">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">{user.department || 'No Dept'}</div>
                              <div className="text-xs text-gray-400">{user._count.absensiRecords} records</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">🔑 Role Permissions</CardTitle>
              <CardDescription className="text-gray-400">
                Permissions and access levels for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['admin', 'manager', 'user'].map((role) => (
                  <div key={role} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white capitalize">{role}</h4>
                      <Badge className={getRoleColor(role)}>
                        {role.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {getRolePermissions(role).map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">{permission}</span>
                        </div>
                      ))}
                    </div>

                    {session.user.role === 'admin' && (
                      <div className="mt-4 pt-3 border-t border-gray-600">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit {role} Permissions
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permission Actions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">⚙️ Permission Management Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Tools for managing user permissions and access control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                ➕ Assign Role
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                🔄 Change Role
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                👀 View Permissions
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                📋 Permission Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Permission Matrix Table */}
        <Card className="mt-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">📊 Permission Matrix</CardTitle>
            <CardDescription className="text-gray-400">
              Detailed view of all permissions across roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  <tr className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      DASHBOARD_VIEW
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      View dashboard and statistics
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      USER_READ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-red-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      View user information
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ABSENSI_READ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      View attendance records
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      SETTINGS_READ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-red-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-4 h-4 bg-red-400 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      View system settings
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

