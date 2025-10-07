import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceMap } from '@/components/attendance/attendance-map';
import CheckInCheckOut from '@/components/attendance/checkin-checkout';
import AdminCheckInCheckOut from '@/components/attendance/admin-checkin-checkout';
import { format } from 'date-fns';
import { AbsensiRecordWithLocation } from '@/types';
import { BarChart3 } from 'lucide-react';

async function getAttendanceRecords(userId: string, userRole: string) {
  try {
    let whereCondition: any = {};

    if (userRole === 'user') {
      whereCondition.userId = userId;
    } else if (userRole === 'manager') {
      // Manager can see their team's records
      whereCondition = {
        user: {
          department: (await prisma.user.findUnique({
            where: { id: userId },
            select: { department: true }
          }))?.department,
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
      orderBy: [
        { date: 'desc' },
        { checkInTime: 'desc' },
      ],
      take: 50, // Limit to last 50 records
    });

    // Get activity logs to determine who created each record
    const recordsWithActivity = await Promise.all(
      records.map(async (record) => {
        const activityLog = await prisma.activityLog.findFirst({
          where: {
            resourceType: 'absensi_record',
            resourceId: record.id,
            action: {
              in: ['check_in', 'admin_check_in', 'check_out', 'admin_check_out']
            }
          },
          select: {
            id: true,
            action: true,
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return {
          ...record,
          createdByAction: activityLog?.action,
          createdByUser: activityLog?.user,
        };
      })
    );

    // Get location data for records that have it
    const recordsWithLocation = await Promise.all(
      recordsWithActivity.map(async (record) => {
        let checkInLocation = null;
        let checkOutLocation = null;

        if (record.checkInLatitude && record.checkInLongitude) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${record.checkInLatitude}&lon=${record.checkInLongitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Absensi-Standalone/1.0'
                }
              }
            );
            const data = await response.json();
            checkInLocation = {
              latitude: Number(record.checkInLatitude),
              longitude: Number(record.checkInLongitude),
              address: data?.display_name || `${Number(record.checkInLatitude).toFixed(6)}, ${Number(record.checkInLongitude).toFixed(6)}`,
            };
          } catch (error) {
            checkInLocation = {
              latitude: Number(record.checkInLatitude),
              longitude: Number(record.checkInLongitude),
              address: `${Number(record.checkInLatitude).toFixed(6)}, ${Number(record.checkInLongitude).toFixed(6)}`,
            };
          }
        }

        if (record.checkOutLatitude && record.checkOutLongitude) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${record.checkOutLatitude}&lon=${record.checkOutLongitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Absensi-Standalone/1.0'
                }
              }
            );
            const data = await response.json();
            checkOutLocation = {
              latitude: Number(record.checkOutLatitude),
              longitude: Number(record.checkOutLongitude),
              address: data?.display_name || `${Number(record.checkOutLatitude).toFixed(6)}, ${Number(record.checkOutLongitude).toFixed(6)}`,
            };
          } catch (error) {
            checkOutLocation = {
              latitude: Number(record.checkOutLatitude),
              longitude: Number(record.checkOutLongitude),
              address: `${Number(record.checkOutLatitude).toFixed(6)}, ${Number(record.checkOutLongitude).toFixed(6)}`,
            };
          }
        }

        return {
          ...record,
          // Convert Decimal fields to plain numbers for serialization
          checkInLatitude: record.checkInLatitude ? Number(record.checkInLatitude) : null,
          checkInLongitude: record.checkInLongitude ? Number(record.checkInLongitude) : null,
          checkInAccuracy: record.checkInAccuracy ? Number(record.checkInAccuracy) : null,
          checkOutLatitude: record.checkOutLatitude ? Number(record.checkOutLatitude) : null,
          checkOutLongitude: record.checkOutLongitude ? Number(record.checkOutLongitude) : null,
          checkOutAccuracy: record.checkOutAccuracy ? Number(record.checkOutAccuracy) : null,
          workHours: record.workHours ? Number(record.workHours) : null,
          overtimeHours: Number(record.overtimeHours),
          lateMinutes: record.lateMinutes,
          checkInLocation,
          checkOutLocation,
        };
      })
    );

    return recordsWithActivity;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const records = await getAttendanceRecords(session.user.id, session.user.role) as AbsensiRecordWithLocation[];

  // Get office location for map
  const officeLocation = {
    center: { latitude: -6.2088, longitude: 106.8456 },
    radius: 100,
    tolerance: 10,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'half_day':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const canManageAttendance = session.user.role === 'admin' || session.user.role === 'manager';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            <BarChart3 className="h-6 w-6" /> Attendance Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Check in/out and manage attendance records
          </p>
        </div>

        {/* Check-in/Check-out Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal Check-in</TabsTrigger>
            {canManageAttendance && (
              <TabsTrigger value="admin">Admin Check-in</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="personal">
            <CheckInCheckOut />
          </TabsContent>

          {canManageAttendance && (
            <TabsContent value="admin">
              <AdminCheckInCheckOut />
            </TabsContent>
          )}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Showing the last 50 attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records found.</p>
              </div>
            ) : (
              <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Work Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          <div>
                            <div className="font-medium">{record.user.name}</div>
                            {record.user.department && (
                              <div className="text-muted-foreground">{record.user.department}</div>
                            )}
                            {record.createdByUser && record.createdByUser.id !== record.user.id && (
                              <div className="text-xs text-blue-600">
                                Checked in by: {record.createdByUser.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatTime(record.checkOutTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {record.workHours ? `${Number(record.workHours).toFixed(1)}h` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-foreground">{record.user.name}</div>
                        {record.user.department && (
                          <div className="text-sm text-muted-foreground">{record.user.department}</div>
                        )}
                        {record.createdByUser && record.createdByUser.id !== record.user.id && (
                          <div className="text-xs text-blue-600">
                            Checked in by: {record.createdByUser.name}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-medium text-foreground">{formatDate(record.date)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check In:</span>
                        <div className="font-medium text-foreground">{formatTime(record.checkInTime)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check Out:</span>
                        <div className="font-medium text-foreground">{formatTime(record.checkOutTime)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Work Hours:</span>
                        <div className="font-medium text-foreground">{record.workHours ? `${Number(record.workHours).toFixed(1)}h` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance Map */}
        {records.some(r => r.checkInLocation || r.checkOutLocation) && (
          <AttendanceMap
            records={records}
            officeLocation={officeLocation}
          />
        )}
      </div>
    </div>
  );
}
