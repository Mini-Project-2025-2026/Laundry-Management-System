import { useMemo } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

/**
 * Renders a real, pannable/zoomable map with a pin at the given coordinates,
 * using Leaflet.js + OpenStreetMap tiles inside a WebView. Deliberately not
 * react-native-maps: that requires a custom native build (leaving Expo Go)
 * and a Google Maps API key. This needs neither — react-native-webview is
 * fully supported in Expo Go, and OpenStreetMap tiles are free, no key.
 *
 * This app targets iOS/Android via Expo Go, not web — react-native-webview
 * doesn't support the web platform, so this renders a plain fallback there
 * instead of crashing (e.g. if someone presses 'w' in the Expo CLI).
 */
export default function MapView({ latitude, longitude, label, height = 180 }) {
  const hasCoords = latitude != null && longitude != null;

  const html = useMemo(() => {
    if (!hasCoords) return '';
    const safeLabel = (label ?? '').replace(/'/g, "\\'").replace(/</g, '&lt;');
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([${latitude}, ${longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([${latitude}, ${longitude}]).addTo(map)
      .bindPopup('${safeLabel}')
      .openPopup();
  </script>
</body>
</html>`;
  }, [hasCoords, latitude, longitude, label]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallback, { height }]}>
        <Ionicons name="location-outline" size={22} color={colors.inkSoft} />
        <Text style={styles.fallbackText}>
          Map preview isn't available in the browser — open this app in Expo Go on
          your phone or a simulator to see it.
        </Text>
      </View>
    );
  }

  if (!hasCoords) {
    return (
      <View style={[styles.fallback, { height }]}>
        <View style={styles.fallbackInner} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    borderRadius: radius.md,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  fallbackInner: {
    flex: 1,
  },
  fallbackText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
