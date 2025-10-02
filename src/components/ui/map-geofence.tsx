'use client';

import { Circle, Popup } from 'react-leaflet';
import { GeofenceConfig } from '@/types';

export interface MapGeofenceProps {
  geofence: GeofenceConfig;
  showLabel?: boolean;
  color?: string;
  fillOpacity?: number;
}

export function MapGeofence({
  geofence,
  showLabel = true,
  color = '#3B82F6',
  fillOpacity = 0.1,
}: MapGeofenceProps) {
  const center: [number, number] = [geofence.center.latitude, geofence.center.longitude];

  return (
    <Circle
      center={center}
      radius={geofence.radius}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity,
        weight: 2,
      }}
    >
      {showLabel && (
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-lg mb-2">🎯 Geofence Area</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>📍 Center: {geofence.center.latitude.toFixed(6)}, {geofence.center.longitude.toFixed(6)}</p>
              <p>📏 Radius: {geofence.radius} meters</p>
              <p>🎯 Tolerance: {geofence.tolerance} meters</p>
            </div>
          </div>
        </Popup>
      )}
    </Circle>
  );
}

// Multiple geofences component
export interface MapGeofencesProps {
  geofences: GeofenceConfig[];
  showLabels?: boolean;
}

export function MapGeofences({ geofences, showLabels = true }: MapGeofencesProps) {
  return (
    <>
      {geofences.map((geofence, index) => (
        <MapGeofence
          key={index}
          geofence={geofence}
          showLabel={showLabels}
        />
      ))}
    </>
  );
}
