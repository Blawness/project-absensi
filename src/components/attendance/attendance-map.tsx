'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map } from '@/components/ui/map';
import { MapMarker, MapMarkers } from '@/components/ui/map-marker';
import { MapGeofence } from '@/components/ui/map-geofence';
import { LocationMarker } from '@/components/ui/map-marker';
import { GeofenceConfig } from '@/types';

interface AttendanceRecord {
  id: string;
  user: {
    id: string;
    name: string;
    department?: string;
  };
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: string;
  workHours?: number;
}

interface AttendanceMapProps {
  records: AttendanceRecord[];
  officeLocation?: GeofenceConfig;
  className?: string;
}

export function AttendanceMap({
  records,
  officeLocation,
  className = ''
}: AttendanceMapProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showCheckIns, setShowCheckIns] = useState(true);
  const [showCheckOuts, setShowCheckOuts] = useState(true);
  const [showOffice, setShowOffice] = useState(true);

  // Convert attendance records to map markers
  const getMarkers = (): LocationMarker[] => {
    const markers: LocationMarker[] = [];

    records.forEach((record) => {
      // Check-in markers
      if (showCheckIns && record.checkInLocation && record.checkInTime) {
        markers.push({
          id: `checkin-${record.id}`,
          position: [record.checkInLocation.latitude, record.checkInLocation.longitude],
          title: `Check-in: ${record.user.name}`,
          description: `${record.user.department ? `${record.user.department} - ` : ''}${record.status.toUpperCase()}`,
          address: record.checkInLocation.address,
          type: 'checkin',
          timestamp: record.checkInTime,
        });
      }

      // Check-out markers
      if (showCheckOuts && record.checkOutLocation && record.checkOutTime) {
        markers.push({
          id: `checkout-${record.id}`,
          position: [record.checkOutLocation.latitude, record.checkOutLocation.longitude],
          title: `Check-out: ${record.user.name}`,
          description: `${record.user.department ? `${record.user.department} - ` : ''}${record.status.toUpperCase()}`,
          address: record.checkOutLocation.address,
          type: 'checkout',
          timestamp: record.checkOutTime,
        });
      }
    });

    return markers;
  };

  // Get map center based on markers or office location
  const getMapCenter = (): [number, number] => {
    const markers = getMarkers();

    if (markers.length > 0) {
      // Calculate center from markers
      const avgLat = markers.reduce((sum, marker) => sum + marker.position[0], 0) / markers.length;
      const avgLng = markers.reduce((sum, marker) => sum + marker.position[1], 0) / markers.length;
      return [avgLat, avgLng];
    }

    // Default to office location or Jakarta
    return officeLocation
      ? [officeLocation.center.latitude, officeLocation.center.longitude]
      : [-6.2088, 106.8456];
  };

  const markers = getMarkers();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>🗺️ Attendance Locations</CardTitle>
        <CardDescription>
          View check-in and check-out locations on the map
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showCheckIns ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCheckIns(!showCheckIns)}
            >
              📍 Check-ins {showCheckIns && '✓'}
            </Button>
            <Button
              variant={showCheckOuts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCheckOuts(!showCheckOuts)}
            >
              📍 Check-outs {showCheckOuts && '✓'}
            </Button>
            <Button
              variant={showOffice ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOffice(!showOffice)}
            >
              🏢 Office {showOffice && '✓'}
            </Button>
          </div>

          {/* Map */}
          <div className="w-full">
            <Map
              center={getMapCenter()}
              zoom={markers.length > 0 ? 14 : 13}
              height="400px"
              className="w-full"
            >
              {/* Office geofence */}
              {showOffice && officeLocation && (
                <MapGeofence
                  geofence={officeLocation}
                  showLabel={true}
                  color="#3B82F6"
                />
              )}

              {/* Attendance markers */}
              <MapMarkers
                markers={markers}
                onMarkerClick={(marker) => {
                  const record = records.find(r =>
                    (marker.id.startsWith('checkin-') && r.id === marker.id.replace('checkin-', '')) ||
                    (marker.id.startsWith('checkout-') && r.id === marker.id.replace('checkout-', ''))
                  );
                  setSelectedRecord(record || null);
                }}
              />
            </Map>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            {showCheckIns && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Check-in</span>
              </div>
            )}
            {showCheckOuts && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Check-out</span>
              </div>
            )}
            {showOffice && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Office</span>
              </div>
            )}
          </div>

          {/* Selected Record Info */}
          {selectedRecord && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Selected Location</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>User:</strong> {selectedRecord.user.name}</p>
                {selectedRecord.user.department && (
                  <p><strong>Department:</strong> {selectedRecord.user.department}</p>
                )}
                <Badge className={
                  selectedRecord.status === 'present' ? 'bg-green-100 text-green-800' :
                  selectedRecord.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {selectedRecord.status.toUpperCase()}
                </Badge>
                {selectedRecord.workHours && (
                  <p><strong>Work Hours:</strong> {Number(selectedRecord.workHours).toFixed(1)}h</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="text-sm text-gray-600">
            <p>Total Records: {records.length}</p>
            <p>Check-ins: {records.filter(r => r.checkInLocation).length}</p>
            <p>Check-outs: {records.filter(r => r.checkOutLocation).length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
