
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';
import { Platform } from 'react-native';
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
    try {
      // 1. Request Location Permissions (Required for high-accuracy heading on mobile)
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        setError('Location permission denied. Required for compass accuracy.');
        return;
      }

      // 2. Start Location Watching
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy
          });
        }
      );

      // 3. Sensor Permission handling (iOS/Safari Web)
      if (Platform.OS === 'web' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response !== 'granted') {
          setError('Sensor permission denied');
          return;
        }
      }
      
      setPermissionGranted(true);
    } catch (err) {
      console.error(err);
      setError('Initialization failed. Check hardware capabilities.');
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    let headingSubscription: any = null;
    let motionSubscription: any = null;

    if (Platform.OS === 'web') {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        let heading = (event as any).webkitCompassHeading;
        if (heading === undefined) {
           heading = (360 - (event.alpha || 0)) % 360;
        }
        
        setOrientation(prev => ({
          ...prev,
          heading: Math.round(heading),
          pitch: Math.round(event.beta || 0),
          roll: Math.round(event.gamma || 0)
        }));
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    } else {
      // Native App: Use fused heading API for stability
      const initNativeSensors = async () => {
        headingSubscription = await Location.watchHeadingAsync((data) => {
          setOrientation(prev => ({
            ...prev,
            heading: Math.round(data.trueHeading !== -1 ? data.trueHeading : data.magHeading)
          }));
        });
      };

      // Stable Pitch/Roll via DeviceMotion
      DeviceMotion.setUpdateInterval(100);
      motionSubscription = DeviceMotion.addListener(result => {
        if (result.rotation) {
          const pitch = (result.rotation.beta * 180) / Math.PI;
          const roll = (result.rotation.gamma * 180) / Math.PI;
          setOrientation(prev => ({
            ...prev,
            pitch: Math.round(pitch),
            roll: Math.round(roll)
          }));
        }
      });

      initNativeSensors();

      return () => {
        if (headingSubscription) headingSubscription.remove();
        if (motionSubscription) motionSubscription.remove();
      };
    }
  }, [permissionGranted]);

  return { orientation, location, error, requestPermissions, permissionGranted };
};
