import * as Location from 'expo-location';

class LocationService {
  static async getCurrentLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return null;
      }

      // Using lowest accuracy for speed, as we only need this twice a day/at order time
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location', error);
      return null;
    }
  }
}

export default LocationService;
