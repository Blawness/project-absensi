import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceMap } from '@/components/attendance/attendance-map';
import { format } from 'date-fns';

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

    // Get location data for records that have it
    const recordsWithLocation = await Promise.all(
      records.map(async (record) => {
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
              latitude: record.checkInLatitude,
              longitude: record.checkInLongitude,
              address: data?.display_name || `${record.checkInLatitude.toFixed(6)}, ${record.checkInLongitude.toFixed(6)}`,
            };
          } catch (error) {
            checkInLocation = {
              latitude: record.checkInLatitude,
              longitude: record.checkInLongitude,
              address: `${record.checkInLatitude.toFixed(6)}, ${record.checkInLongitude.toFixed(6)}`,
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
              latitude: record.checkOutLatitude,
              longitude: record.checkOutLongitude,
              address: data?.display_name || `${record.checkOutLatitude.toFixed(6)}, ${record.checkOutLongitude.toFixed(6)}`,
            };
          } catch (error) {
            checkOutLocation = {
              latitude: record.checkOutLatitude,
              longitude: record.checkOutLongitude,
              address: `${record.checkOutLatitude.toFixed(6)}, ${record.checkOutLongitude.toFixed(6)}`,
            };
          }
        }

        return {
          ...record,
          checkInLocation,
          checkOutLocation,
        };
      })
    );

    return recordsWithLocation;
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

  const records = await getAttendanceRecords(session.user.id, session.user.role);

  // Get office location for map
  const officeLocation = {
    center: { latitude: -6.2088, longitude: 106.8456 },
    radius: 100,
    tolerance: 10,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half_day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Attendance Records
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage attendance records
          </p>
        </div>

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
                <p className="text-gray-500">No attendance records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{record.user.name}</div>
                            {record.user.department && (
                              <div className="text-gray-500">{record.user.department}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.checkOutTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
