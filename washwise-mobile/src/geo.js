import * as Location from 'expo-location';

/**
 * Requests location permission and returns { latitude, longitude, label }
 * where label is a reverse-geocoded "Area, City" string (uses the device's
 * native geocoder — no API key needed). Returns null if unavailable/denied;
 * callers should show a sensible fallback, never block on this.
 */
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;

    let label = null;
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = results?.[0];
      if (place) {
        label = [place.district || place.subregion || place.city, place.region]
          .filter(Boolean)
          .join(', ');
      }
    } catch {
      // Reverse geocoding can fail even when coords succeed — non-fatal.
    }

    return { latitude, longitude, label };
  } catch {
    return null;
  }
}

/** Haversine distance in kilometers between two lat/lng points. */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Formats a distance in km as "450m" or "3.2km" like the reference UI. */
export function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
