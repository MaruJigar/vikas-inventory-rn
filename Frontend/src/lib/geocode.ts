import { Platform } from 'react-native';

export interface PlaceResult {
  label: string;
  latitude: number;
  longitude: number;
}

/**
 * Free-text place search via OpenStreetMap Nominatim (no API key). Works on web
 * and native. For heavy production use, swap for Google Places (needs a key).
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  // Scope to India + English so local areas/localities resolve (an unscoped
  // search tends to only match big cities).
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=8' +
    '&countrycodes=in&accept-language=en&q=' +
    encodeURIComponent(q);

  // Nominatim asks for an identifying User-Agent on non-browser clients.
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (Platform.OS !== 'web') {
    headers['User-Agent'] = 'VikasInventoryApp/1.0';
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return data.map((d) => ({
    label: d.display_name,
    latitude: parseFloat(d.lat),
    longitude: parseFloat(d.lon),
  }));
}
