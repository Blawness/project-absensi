import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Absensi Standalone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Employee attendance management system with GPS tracking
          </p>
          
          <Card className="max-w-2xl mx-auto p-8">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold mb-6">Welcome to Absensi Standalone!</CardTitle>
              <CardDescription>
                A modern employee attendance management system with GPS tracking and comprehensive reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-left mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span>GPS-based check-in/check-out system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span>Role-based access control (Admin, Manager, User)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span>Real-time attendance tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span>Comprehensive reporting and analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">✅</span>
                  <span>Mobile-responsive design</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/auth/signin">
                  <Button className="w-full" size="lg">
                    Sign In to Continue
                  </Button>
                </Link>
                
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">Demo Accounts:</p>
                  <div className="space-y-1">
                    <p>Admin: admin@company.com / admin123</p>
                    <p>Manager: manager@company.com / manager123</p>
                    <p>User: user@company.com / user123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
