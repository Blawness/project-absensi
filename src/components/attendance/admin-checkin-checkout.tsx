'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentLocation, validateLocation, getOfficeLocation } from '@/lib/location';
import { LocationData } from '@/types';
import { MapPin } from 'lucide-react';

interface User {
  id: string;
  name: string;
  department?: string;
  role: string;
}

export default function AdminCheckInCheckOut() {
  const { data: session, status } = useSession();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  // Get list of users that admin can manage
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          // Filter users based on admin/manager permissions
          // Admins can see all users, managers see users in their department
          setUsers(data.data || []);
        }
      } catch (error) {
        console.error('Error getting users:', error);
      }
    };

    if (session?.user) {
      getUsers();
    }
  }, [session]);

  const handleCheckIn = async () => {
    if (!selectedUserId) {
      setError('Please select a user to check in');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Validate location against office geofence
      const officeLocation = await getOfficeLocation();
      const isValidLocation = validateLocation(location, officeLocation);

      if (!isValidLocation) {
        setError('You must be within the office radius to perform check-in. Please move closer to the office location.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/admin-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          location,
          notes: notes.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setError('');
        setNotes('');
        setSelectedUserId('');
        alert(`Check-in successful for ${data.data.user.name}`);
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
    if (!selectedUserId) {
      setError('Please select a user to check out');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Validate location against office geofence
      const officeLocation = await getOfficeLocation();
      const isValidLocation = validateLocation(location, officeLocation);

      if (!isValidLocation) {
        setError('You must be within the office radius to perform check-out. Please move closer to the office location.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/attendance/admin-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          location,
          notes: notes.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setError('');
        setNotes('');
        setSelectedUserId('');
        alert(`Check-out successful for ${data.data.user.name}`);
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
          <p className="text-center text-gray-500">Please log in to access admin check-in</p>
        </CardContent>
      </Card>
    );
  }

  // Check if user has admin/manager permissions
  const canManageAttendance = session.user.role === 'admin' || session.user.role === 'manager';

  if (!canManageAttendance) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">You don't have permission to perform admin check-ins</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>👑</span>
          <span>Admin Check In/Out</span>
        </CardTitle>
        <CardDescription>
          Check in or out other employees as an administrator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* User Selection */}
        <div className="space-y-2">
          <Label htmlFor="user-select">Select Employee</Label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an employee to check in/out" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} {user.department && `(${user.department})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            placeholder="Add notes for this check-in/out"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

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
            disabled={isLoading || !selectedUserId}
            className="flex-1"
          >
            {isLoading ? 'Checking In...' : (
              <>
                <MapPin className="h-4 w-4" />
                Admin Check In
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={isLoading || !selectedUserId}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? 'Checking Out...' : (
              <>
                <MapPin className="h-4 w-4" />
                Admin Check Out
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Make sure your GPS/location is enabled</p>
          <p>• You must be within office radius to perform check-in/out</p>
          <p>• Select the employee you want to check in or out</p>
          <p>• Add notes if needed for record keeping</p>
        </div>
      </CardContent>
    </Card>
  );
}



