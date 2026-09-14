import { useMemo, useEffect } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

/**
 * Interactive Leaflet.js + OpenStreetMap MapView.
 * Supports:
 * - Multi-business markers with custom sky blue pins and booking popups.
 * - Single coordinate marker (for detail screens).
 * - User location marker with pulsing radar effect.
 * - Two-way communication via window.ReactNativeWebView.postMessage.
 */
export default function MapView({
  latitude,
  longitude,
  label,
  businesses,
  userLocation,
  selectedBusinessId,
  onSelectBusiness,
  height = 220,
  style,
}) {
  const isMulti = Array.isArray(businesses) && businesses.length > 0;
  const hasSingle = latitude != null && longitude != null;
  const hasData = isMulti || hasSingle;

  const html = useMemo(() => {
    if (!hasData) return '';

    // Calculate center coordinates and zoom
    let centerLat = 6.6745; // Default Kumasi
    let centerLng = -1.5716;
    let initialZoom = 13;

    if (userLocation?.latitude != null && userLocation?.longitude != null) {
      centerLat = userLocation.latitude;
      centerLng = userLocation.longitude;
    } else if (hasSingle) {
      centerLat = latitude;
      centerLng = longitude;
      initialZoom = 15;
    } else if (isMulti && businesses[0]?.latitude != null) {
      centerLat = businesses[0].latitude;
      centerLng = businesses[0].longitude;
    }

    const businessesJson = JSON.stringify(
      (businesses || []).map((b) => ({
        id: b.id,
        name: b.businessName || 'Laundry',
        address: b.address || '',
        lat: b.latitude,
        lng: b.longitude,
        rating: b.averageRating ? Number(b.averageRating).toFixed(1) : '5.0',
        delivery: b.offersDelivery ? 'Pickup & Delivery' : 'Shop Dropoff',
        isSelected: b.id === selectedBusinessId,
      }))
    );

    const userLocJson = userLocation?.latitude
      ? JSON.stringify({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          label: userLocation.label || 'Your Location',
        })
      : 'null';

    const singlePinJson = hasSingle
      ? JSON.stringify({
          lat: latitude,
          lng: longitude,
          label: (label || '').replace(/'/g, "\\'"),
        })
      : 'null';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; }
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #F0F9FF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution { font-size: 8px !important; opacity: 0.55; }
    
    /* Modern Sky Blue Shop Pin */
    .shop-marker {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .shop-pin {
      width: 32px;
      height: 32px;
      background: #0EA5E9;
      border: 2.5px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(14, 165, 233, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .shop-pin.active {
      background: #0284C7;
      transform: rotate(-45deg) scale(1.15);
      box-shadow: 0 6px 14px rgba(2, 132, 199, 0.55);
    }
    .shop-pin-inner {
      transform: rotate(45deg);
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
    }

    /* User Location Radar Marker */
    .user-dot {
      width: 16px;
      height: 16px;
      background: #0284C7;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(14, 165, 233, 0.35);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.5); }
      70% { box-shadow: 0 0 0 12px rgba(14, 165, 233, 0); }
      100% { box-shadow: 0 0 0 3px rgba(14, 165, 233, 0); }
    }

    /* Popup Styling */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      padding: 6px;
      box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.15), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
      border: 1px solid #E0F2FE;
    }
    .leaflet-popup-content {
      margin: 8px 10px;
      line-height: 1.35;
    }
    .popup-box {
      min-width: 170px;
      max-width: 220px;
    }
    .popup-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 3px;
    }
    .popup-addr {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 6px;
    }
    .popup-badge-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .popup-rating {
      font-size: 11px;
      font-weight: 700;
      color: #0EA5E9;
      background: #E0F2FE;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .popup-delivery {
      font-size: 10px;
      font-weight: 600;
      color: #0369A1;
      background: #F0F9FF;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .popup-action {
      display: block;
      width: 100%;
      background: #0EA5E9;
      color: #FFFFFF;
      text-align: center;
      padding: 7px 0;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }
    .popup-action:active {
      background: #0284C7;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${centerLat}, ${centerLng}], ${initialZoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    function selectBusiness(id) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_BUSINESS', id: id }));
      }
    }

    var businesses = ${businessesJson};
    var userLoc = ${userLocJson};
    var singlePin = ${singlePinJson};

    var bounds = [];

    // Add User Location Marker
    if (userLoc && userLoc.lat != null && userLoc.lng != null) {
      var userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div class="user-dot"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([userLoc.lat, userLoc.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>You are here</b><br>' + userLoc.label);
      bounds.push([userLoc.lat, userLoc.lng]);
    }

    // Add Single Pin (if given)
    if (singlePin && singlePin.lat != null && singlePin.lng != null) {
      var shopIcon = L.divIcon({
        className: 'shop-marker',
        html: '<div class="shop-pin"><div class="shop-pin-inner">&#9679;</div></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
      L.marker([singlePin.lat, singlePin.lng], { icon: shopIcon })
        .addTo(map)
        .bindPopup('<b>' + singlePin.label + '</b>')
        .openPopup();
      bounds.push([singlePin.lat, singlePin.lng]);
    }

    // Add Multi-business pins
    if (businesses && businesses.length > 0) {
      businesses.forEach(function(b, idx) {
        if (b.lat == null || b.lng == null) return;
        var isSelected = b.isSelected;
        var iconHtml = '<div class="shop-pin ' + (isSelected ? 'active' : '') + '">' +
                       '<div class="shop-pin-inner">' + (idx + 1) + '</div></div>';
        var icon = L.divIcon({
          className: 'shop-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30]
        });

        var popupHtml = '<div class="popup-box">' +
          '<div class="popup-title">' + b.name + '</div>' +
          '<div class="popup-addr">' + b.address + '</div>' +
          '<div class="popup-badge-row">' +
            '<span class="popup-rating">&#9733; ' + b.rating + '</span>' +
            '<span class="popup-delivery">' + b.delivery + '</span>' +
          '</div>' +
          '<button class="popup-action" onclick="selectBusiness(' + b.id + ')">Select & Book</button>' +
        '</div>';

        var marker = L.marker([b.lat, b.lng], { icon: icon }).addTo(map);
        marker.bindPopup(popupHtml);

        if (isSelected) {
          marker.openPopup();
        }

        bounds.push([b.lat, b.lng]);
      });
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  </script>
</body>
</html>`;
  }, [hasData, hasSingle, isMulti, latitude, longitude, label, businesses, userLocation, selectedBusinessId]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_BUSINESS' && onSelectBusiness) {
        const found = (businesses || []).find((b) => b.id === data.id);
        if (found) {
          onSelectBusiness(found);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleWebMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'SELECT_BUSINESS' && data.id && onSelectBusiness) {
          const found = (businesses || []).find((b) => b.id === data.id);
          onSelectBusiness(found || data.id);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', handleWebMessage);
    return () => window.removeEventListener('message', handleWebMessage);
  }, [businesses, onSelectBusiness]);

  if (!hasData) {
    return (
      <View style={[styles.fallback, { height }, style]}>
        <MapPin size={24} color={colors.inkSoft} strokeWidth={2} />
        <Text style={styles.fallbackText}>Location coordinates loading…</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height }, style]}>
        <iframe
          srcDoc={html}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: radius.md,
          }}
          title="Interactive Laundry Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: colors.line,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    borderRadius: radius.md,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  fallbackTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  fallbackText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
  },
});
