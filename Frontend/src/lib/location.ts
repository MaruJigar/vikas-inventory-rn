import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

export type CoordsResult =
  | { ok: true; coords: Coords }
  | { ok: false; reason: 'permission' | 'insecure' | 'error' };

/**
 * Cross-platform current position. On web the prompt fires on the position
 * request itself (not the permission request), and insecure origins are
 * blocked outright — both handled here so callers just branch on `reason`.
 */
export async function getCurrentCoords(): Promise<CoordsResult> {
  try {
    if (Platform.OS === 'web') {
      if ((globalThis as { isSecureContext?: boolean }).isSecureContext === false) {
        return { ok: false, reason: 'insecure' };
      }
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return { ok: false, reason: 'permission' };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      ok: true,
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
