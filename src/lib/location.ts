import { LocationData, GeofenceConfig } from '@/types';

/**
 * Get current position using Geolocation API
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000, // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        
        try {
          // Reverse geocode to get address
          const address = await reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            address,
            accuracy,
            timestamp: new Date(),
            altitude: altitude || undefined,
            heading: heading || undefined,
            speed: speed || undefined,
          });
        } catch (error) {
          // If reverse geocoding fails, still return location data
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            accuracy,
            timestamp: new Date(),
            altitude: altitude || undefined,
            heading: heading || undefined,
            speed: speed || undefined,
          });
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Validate location against geofence
 */
export const validateLocation = (
  location: LocationData,
  geofence: GeofenceConfig
): boolean => {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    geofence.center.latitude,
    geofence.center.longitude
  );

  return distance <= geofence.radius && location.accuracy <= geofence.tolerance;
};

/**
 * Reverse geocode coordinates to address using Google Maps API
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

/**
 * Format location for display
 */
export const formatLocation = (location: LocationData): string => {
  return `${location.address} (±${location.accuracy.toFixed(0)}m)`;
};

/**
 * Check if location permissions are granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  if (!navigator.permissions) {
    return false;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch (error) {
    return false;
  }
};

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 5000 }
    );
  });
};
