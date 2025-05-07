import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.onLocationChanged = null;
  }

  // Request location permissions on Android
  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Sijaintilupa',
            message: 'Sovellus tarvitsee pääsyn sijaintiisi poronhoitajien läheisyyden varmistamiseksi.',
            buttonNeutral: 'Kysy myöhemmin',
            buttonNegative: 'Peruuta',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Sijaintiluvan pyytäminen epäonnistui', error);
        return false;
      }
    }
    return true; // iOS will prompt automatically
  }

  // Initialize location service
  async initialize() {
    try {
      // Request permissions first
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Sijaintioikeuksia ei myönnetty');
      }

      // Configure geolocation
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
        enableBackgroundLocationUpdates: false,
      });

      return true;
    } catch (error) {
      console.error('Sijaintipalvelun alustus epäonnistui', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Sijainnin haku epäonnistui', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  }

  // Start watching location changes
  startWatchingLocation() {
    if (this.watchId !== null) {
      this.stopWatchingLocation();
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.currentLocation = location;

        if (this.onLocationChanged) {
          this.onLocationChanged(location);
        }
      },
      (error) => {
        console.error('Sijainnin seuraaminen epäonnistui', error);
      },
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 },
    );
  }

  // Stop watching location
  stopWatchingLocation() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two locations in meters
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    }

    // Haversine formula to calculate distance between two points on Earth
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in meters
  }

  // Check if a location is within proximity (e.g., 100 meters)
  isInProximity(location1, location2, proximityThreshold = 100) {
    if (!location1 || !location2) {return false;}

    const distance = this.calculateDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude,
    );

    return distance <= proximityThreshold;
  }

  // Clean up resources
  destroy() {
    this.stopWatchingLocation();
  }
}

// Export singleton instance
export default new LocationService();