import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useApi } from './api/client';
import { registerForPushNotificationsAsync } from './notifications';
import BottomTabBar from './components/BottomTabBar';
import ExploreScreen from './screens/ExploreScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import MyBusinessScreen from './screens/MyBusinessScreen';
import OwnerBookingsScreen from './screens/OwnerBookingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './theme';

const CUSTOMER_TABS = [
  { key: 'explore', label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
  { key: 'bookings', label: 'Bookings', icon: 'receipt-outline', iconActive: 'receipt' },
  { key: 'notifications', label: 'Alerts', icon: 'notifications-outline', iconActive: 'notifications' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

const OWNER_TABS = [
  { key: 'business', label: 'Business', icon: 'storefront-outline', iconActive: 'storefront' },
  { key: 'bookings', label: 'Orders', icon: 'receipt-outline', iconActive: 'receipt' },
  { key: 'notifications', label: 'Alerts', icon: 'notifications-outline', iconActive: 'notifications' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export default function MainApp() {
  const { api, user } = useApi();
  const isOwner = user?.role === 'LAUNDRY_OWNER';
  const tabs = isOwner ? OWNER_TABS : CUSTOMER_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const res = await api.getUnreadNotificationCount();
      setUnreadCount(res.unread ?? 0);
    } catch {
      // non-critical — badge just won't update this cycle
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  // Register for push once per login session. Silent no-op if unavailable
  // (simulator, permission denied, Expo Go on Android) — the in-app inbox
  // above always works regardless.
  useEffect(() => {
    let cancelled = false;
    registerForPushNotificationsAsync().then((token) => {
      if (token && !cancelled) {
        api.registerPushToken(token).catch(() => {});
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // While the app is open, bump the badge as soon as a push arrives instead
  // of waiting for the next tab switch.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      refreshUnreadCount();
    });
    return () => sub.remove();
  }, []);

  const handleNavigate = (key) => {
    setActiveTab(key);
    if (key !== 'notifications') {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  };

  const renderScreen = () => {
    if (activeTab === 'explore')
      return (
        <ExploreScreen
          unreadCount={unreadCount}
          onOpenNotifications={() => handleNavigate('notifications')}
          onOpenBookings={() => handleNavigate('bookings')}
        />
      );
    if (activeTab === 'business') return <MyBusinessScreen />;
    if (activeTab === 'bookings') return isOwner ? <OwnerBookingsScreen /> : <MyBookingsScreen />;
    if (activeTab === 'notifications') return <NotificationsScreen />;
    if (activeTab === 'settings') return <SettingsScreen />;
    return null;
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>{renderScreen()}</View>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.tabBarWrap}>
        <BottomTabBar
          tabs={tabs}
          active={activeTab}
          onNavigate={handleNavigate}
          badges={{ notifications: unreadCount }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
  },
  tabBarWrap: {
    backgroundColor: colors.steelDark,
  },
});
