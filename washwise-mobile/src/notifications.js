import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Show notifications with an alert/sound even while the app is open in the
// foreground (default behavior hides them while foregrounded).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests notification permission and returns an Expo push token, or null
 * if unavailable (simulator, permission denied, or — notably — Expo Go on
 * Android in recent SDKs, which no longer supports receiving remote push;
 * this call may still return a token there, but delivery isn't guaranteed).
 * Never throws — push registration is a nice-to-have, not a blocker.
 */
export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      // Simulators/emulators generally can't receive push at all.
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    return tokenResponse.data;
  } catch (err) {
    // Best-effort: missing EAS project config, no network, etc. — the app
    // works fine without a push token, it just won't get remote alerts.
    console.warn('Push registration skipped:', err.message);
    return null;
  }
}
