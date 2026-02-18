
import { useState, useEffect, useCallback } from 'react';
import { OrientationData, LocationData } from '../types';

export const useCompass = () => {
  const [orientation, setOrientation] = useState<OrientationData>({ heading: 0, pitch: 0, roll: 0 });
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    altitude: null,
    speed: null,
    accuracy: null
  });
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const requestPermissions = useCallback(async () => {
    // Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true }
      );
    }

    // Orientation Permissions (iOS Specific)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setError('Permission to access orientation was denied.');
        }
      } catch (err) {
        setError('Orientation permission error');
      }
    } else {
      // Android / Older Browsers / Desktop
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS if available, otherwise alpha
      let heading = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
      setOrientation({
        heading: Math.round(heading),
        pitch: Math.round(event.beta || 0),
        roll: Math.round(event.gamma || 0)
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  return { orientation, location, error, requestPermissions, permissionGranted };
};
