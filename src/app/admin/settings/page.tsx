import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from '@/components/ui/map';
import { MapGeofence } from '@/components/ui/map-geofence';
import { hasPermission } from '@/lib/rbac';
import { Permission } from '@/types/permissions';
import { Settings, MapPin, Building, Info, Wrench, Save, RefreshCw } from 'lucide-react';

async function getSettings() {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has permission to view settings
  if (!hasPermission(session.user.role, Permission.SETTINGS_READ)) {
    redirect('/dashboard');
  }

  const settings = await getSettings();

  const formatSettingValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            <Settings className="h-6 w-6" /> System Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Configure system settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Office Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Office Location
              </CardTitle>
              <CardDescription>
                Configure office location for geofencing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Interactive Map */}
                <div className="border rounded-lg overflow-hidden">
                  <Map
                    center={[-6.2088, 106.8456]}
                    zoom={16}
                    height="300px"
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

                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Current Settings:</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Coordinates: -6.2088, 106.8456
                    </p>
                    <p className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Radius: 100 meters
                    </p>
                    <p className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Tolerance: 10 meters
                    </p>
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Address: Jakarta, Indonesia
                    </p>
                  </div>
                </div>

                {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                  <Button className="w-full">
                    Update Location
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>🕐 Work Schedule</CardTitle>
              <CardDescription>
                Configure work hours and schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Current Schedule:</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Check-in: 06:00 - 10:00</p>
                    <p>Check-out: 14:00 - 22:00</p>
                    <p>Min work hours: 4h</p>
                    <p>Max work hours: 12h</p>
                    <p>Late tolerance: 15 minutes</p>
                  </div>
                </div>
                {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                  <Button className="w-full">
                    Update Schedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Geofencing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Geofencing</CardTitle>
              <CardDescription>
                Configure location validation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Current Settings:</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Status: Enabled</p>
                    <p>Radius: 100 meters</p>
                    <p>Accuracy threshold: 10 meters</p>
                  </div>
                </div>
                {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                  <Button className="w-full">
                    Update Geofencing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>📧 Notifications</CardTitle>
              <CardDescription>
                Configure email and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-white">Current Settings:</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Email notifications: Enabled</p>
                    <p>Daily summary: Enabled</p>
                    <p>Late reminders: Enabled</p>
                  </div>
                </div>
                {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                  <Button className="w-full">
                    Update Notifications
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              View system status and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">Online</div>
                <div className="text-sm text-gray-400">System Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">v1.0.0</div>
                <div className="text-sm text-gray-400">Version</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">MySQL</div>
                <div className="text-sm text-gray-400">Database</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Settings Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              All Settings
            </CardTitle>
            <CardDescription>
              View and manage all system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No settings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Public
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {settings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {setting.key}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {setting.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <pre className="text-xs bg-gray-800 p-2 rounded max-w-xs overflow-x-auto">
                            {formatSettingValue(setting.value)}
                          </pre>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            setting.isPublic
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-red-900/20 text-red-400'
                          }`}>
                            {setting.isPublic ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasPermission(session.user.role, Permission.SETTINGS_UPDATE) && (
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          )}
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
