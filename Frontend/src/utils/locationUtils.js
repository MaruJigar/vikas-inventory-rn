import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';

export class LocationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}

export const getSafeLocation = async (timeoutMs = 20000) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationError('Location access is required to continue.', 'LOCATION_PERMISSION_DENIED');
  }

  const hasServices = await Location.hasServicesEnabledAsync();
  if (!hasServices) {
    throw new LocationError('Please enable Location Services (GPS) on your device and try again.', 'LOCATION_SERVICES_DISABLED');
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new LocationError('We couldn\'t determine your location. Please check your GPS signal and try again.', 'LOCATION_TIMEOUT'));
    }, timeoutMs);
  });

  const locationPromise = Location.getCurrentPositionAsync({ 
    accuracy: Location.Accuracy.Balanced 
  });

  try {
    const location = await Promise.race([locationPromise, timeoutPromise]);
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    if (error instanceof LocationError) {
      throw error;
    }
    throw new LocationError('We couldn\'t determine your location. Please ensure Location Services are enabled.', 'LOCATION_UNAVAILABLE');
  }
};

export const withLocationRecovery = async (actionFn, options = {}) => {
  const timeoutMs = options.timeoutMs || 20000;
  
  const attempt = async () => {
    try {
      const location = await getSafeLocation(timeoutMs);
      await actionFn(location);
    } catch (error) {
      if (error instanceof LocationError) {
        if (error.code === 'LOCATION_PERMISSION_DENIED') {
          Alert.alert(
            'Location Permission Required',
            'This action requires location access. Please enable location permissions in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        } else if (error.code === 'LOCATION_SERVICES_DISABLED') {
          Alert.alert(
            'Location Services Disabled',
            'Please enable Location Services (GPS) on your device and try again.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: attempt }
            ]
          );
        } else {
          // LOCATION_TIMEOUT or LOCATION_UNAVAILABLE
          Alert.alert(
            'Location Not Available',
            'We couldn\'t determine your location. Please ensure GPS is enabled and try again.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: attempt }
            ]
          );
        }
      } else {
        Alert.alert('Location Error', error.message || 'An unexpected error occurred acquiring location.');
      }
    }
  };

  return attempt();
};
