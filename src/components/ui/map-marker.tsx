'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export interface LocationMarker {
  id: string;
  position: [number, number];
  title?: string;
  description?: string;
  address?: string;
  type?: 'checkin' | 'checkout' | 'office' | 'user';
  timestamp?: Date;
}

export interface MapMarkerProps {
  marker: LocationMarker;
  icon?: L.Icon;
  onClick?: (marker: LocationMarker) => void;
}

// Default icons for different marker types
const createIcon = (type: LocationMarker['type']) => {
  const colors = {
    checkin: '#10B981', // green
    checkout: '#EF4444', // red
    office: '#3B82F6', // blue
    user: '#2563EB', // deep blue
  };

  const color = colors[type || 'user'];

  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 13.807 12.5 28.5 12.5 28.5S25 26.307 25 12.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
        <circle cx="12.5" cy="12.5" r="7" fill="white"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

export function MapMarker({ marker, icon, onClick }: MapMarkerProps) {
  const markerIcon = icon || createIcon(marker.type);

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Marker
      position={marker.position}
      icon={markerIcon}
      eventHandlers={{
        click: () => onClick?.(marker),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-lg mb-2">
            {marker.title || `${marker.type?.toUpperCase() || 'LOCATION'}`}
          </h3>

          {marker.address && (
            <p className="text-sm text-gray-400 mb-2">
              📍 {marker.address}
            </p>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>Lat: {marker.position[0].toFixed(6)}</p>
            <p>Lng: {marker.position[1].toFixed(6)}</p>
            {marker.timestamp && (
              <p>⏰ {formatTimestamp(marker.timestamp)}</p>
            )}
          </div>

          {marker.description && (
            <p className="text-sm mt-2 text-gray-700">
              {marker.description}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// Multiple markers component
export interface MapMarkersProps {
  markers: LocationMarker[];
  onMarkerClick?: (marker: LocationMarker) => void;
}

export function MapMarkers({ markers, onMarkerClick }: MapMarkersProps) {
  return (
    <>
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          marker={marker}
          onClick={onMarkerClick}
        />
      ))}
    </>
  );
}
