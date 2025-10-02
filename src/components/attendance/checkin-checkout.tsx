'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocation, validateLocation, getOfficeLocation } from '@/lib/location';
import { LocationData } from '@/types';

export default function CheckInCheckOut() {
  const { data: session, status } = useSession();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<{
    checkedIn: boolean;
    checkedOut: boolean;
    checkInTime?: string;
    checkOutTime?: string;
    workHours?: number;
  } | null>(null);
  const [error, setError] = useState<string>('');

  // Get today's attendance status
  useEffect(() => {
    const getTodayStatus = async () => {
      try {
        const response = await fetch('/api/attendance/records?startDate=' + new Date().toISOString().split('T')[0]);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const today = data.data[0];
            setTodayStatus({
              checkedIn: !!today.checkInTime,
              checkedOut: !!today.checkOutTime,
              checkInTime: today.checkInTime,
              checkOutTime: today.checkOutTime,
              workHours: today.workHours,
            });
          }
        }
      } catch (error) {
        console.error('Error getting today status:', error);
      }
    };

    if (session?.user) {
      getTodayStatus();
    }
  }, [session]);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Validate location against office geofence
      const officeLocation = await getOfficeLocation();
      const isValidLocation = validateLocation(location, officeLocation);

      if (!isValidLocation) {
        setError('You must be within the office radius to check in. Please move closer to the office location.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodayStatus({
          checkedIn: true,
          checkedOut: false,
          checkInTime: new Date().toLocaleTimeString(),
        });
        window.location.reload(); // Refresh to get updated data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Check-in failed');
      }
    } catch (error) {
      setError('Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Validate location against office geofence
      const officeLocation = await getOfficeLocation();
      const isValidLocation = validateLocation(location, officeLocation);

      if (!isValidLocation) {
        setError('You must be within the office radius to check out. Please move closer to the office location.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodayStatus({
          checkedIn: true,
          checkedOut: true,
          checkOutTime: new Date().toLocaleTimeString(),
          workHours: data.data.workHours,
        });
        window.location.reload(); // Refresh to get updated data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Check-out failed');
      }
    } catch (error) {
      setError('Failed to check out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (location: LocationData) => {
    return `${location.address} (±${location.accuracy.toFixed(0)}m)`;
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please log in to check in/out</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📍</span>
          <span>Check In/Out</span>
        </CardTitle>
        <CardDescription>
          Record your attendance with GPS location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Current Status */}
        {todayStatus && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 text-foreground">Today's Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check In:</span>
                <span className={todayStatus.checkedIn ? 'text-green-600' : 'text-muted-foreground'}>
                  {todayStatus.checkedIn ? todayStatus.checkInTime || 'Done' : 'Not yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check Out:</span>
                <span className={todayStatus.checkedOut ? 'text-green-600' : 'text-muted-foreground'}>
                  {todayStatus.checkedOut ? todayStatus.checkOutTime || 'Done' : 'Not yet'}
                </span>
              </div>
              {todayStatus.workHours && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Hours:</span>
                  <span className="font-medium text-foreground">{todayStatus.workHours.toFixed(1)}h</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Info */}
        {currentLocation && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-semibold mb-2 text-foreground">Current Location</h3>
            <p className="text-sm text-primary">{formatLocation(currentLocation)}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || todayStatus?.checkedIn}
            className="flex-1"
          >
            {isLoading ? 'Checking In...' : '📍 Check In'}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={isLoading || !todayStatus?.checkedIn || todayStatus?.checkedOut}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? 'Checking Out...' : '📍 Check Out'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Make sure your GPS/location is enabled</p>
          <p>• You must be within office radius to check in/out</p>
          <p>• Check-in is only allowed once per day</p>
          <p>• Check-out is only allowed after check-in</p>
        </div>
      </CardContent>
    </Card>
  );
}
