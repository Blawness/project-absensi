import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📍 Check In/Out</CardTitle>
              <CardDescription>
                Record your attendance with GPS location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                📍 Check In
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Today's Stats</CardTitle>
              <CardDescription>
                Your attendance statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Present</span>
                </div>
                <div className="flex justify-between">
                  <span>Check In:</span>
                  <span>08:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Work Hours:</span>
                  <span>8h 0m</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 This Month</CardTitle>
              <CardDescription>
                Monthly attendance summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Present Days:</span>
                  <span className="font-medium">20/22</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance Rate:</span>
                  <span className="font-medium text-green-600">90.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span>160h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            🚀 Project Status - Phase 1 (MVP)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">✅ Completed:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Next.js 15 + TypeScript setup</li>
                <li>• Prisma + MySQL database schema</li>
                <li>• NextAuth.js authentication</li>
                <li>• Tailwind CSS + UI components</li>
                <li>• Basic project structure</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">⏳ In Progress:</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• GPS location services</li>
                <li>• Check-in/out functionality</li>
                <li>• Database operations (CRUD)</li>
                <li>• User dashboard</li>
                <li>• Location validation</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Next Steps:</strong> Implement core attendance features (check-in/out with GPS), 
              create user management system, and add basic reporting functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
