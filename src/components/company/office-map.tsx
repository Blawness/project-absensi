'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/ui/map').then(mod => ({ default: mod.Map })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  ),
});

const MapGeofence = dynamic(() => import('@/components/ui/map-geofence').then(mod => ({ default: mod.MapGeofence })), {
  ssr: false,
});

export function OfficeMap() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Map
        center={[-6.2088, 106.8456]}
        zoom={16}
        height="250px"
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
  );
}

