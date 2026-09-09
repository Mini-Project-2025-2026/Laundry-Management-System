import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
import { colors, fonts, radius } from './theme';

const CUSTOMER_TABS = [
  { key: 'explore', label: 'Explore' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'notifications', label: 'Alerts' },
  { key: 'settings', label: 'Settings' },
];

const OWNER_TABS = [
  { key: 'business', label: 'Business' },
  { key: 'bookings', label: 'Orders' },
  { key: 'notifications', label: 'Alerts' },
  { key: 'settings', label: 'Settings' },
];

export default function MainApp() {
  const { api, user } = useApi();
  const isOwner = user?.role === 'LAUNDRY_OWNER';
  const [ownerViewMode, setOwnerViewMode] = useState('customer'); // Default to customer ordering mode!
  const activeIsOwner = isOwner && ownerViewMode === 'owner';
  const tabs = activeIsOwner ? OWNER_TABS : CUSTOMER_TABS;
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

  const toggleOwnerMode = () => {
    const newMode = ownerViewMode === 'owner' ? 'customer' : 'owner';
    setOwnerViewMode(newMode);
    setActiveTab(newMode === 'owner' ? 'business' : 'explore');
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
    if (activeTab === 'bookings') return activeIsOwner ? <OwnerBookingsScreen /> : <MyBookingsScreen />;
    if (activeTab === 'notifications') return <NotificationsScreen />;
    if (activeTab === 'settings') return <SettingsScreen />;
    return null;
  };

  return (
    <View style={styles.root}>
      {isOwner && (
        <View style={styles.modeSwitchBanner}>
          <Text style={styles.modeSwitchText}>
            {ownerViewMode === 'owner'
              ? 'Viewing as Laundry Shop Owner'
              : 'Customer Mode (Order Laundry)'}
          </Text>
          <Pressable style={styles.modeSwitchBtn} onPress={toggleOwnerMode}>
            <Text style={styles.modeSwitchBtnText}>
              {ownerViewMode === 'owner' ? 'Switch to Customer View' : 'Switch to Owner View'}
            </Text>
          </Pressable>
        </View>
      )}
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
    backgroundColor: '#FFFFFF',
  },
  modeSwitchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  modeSwitchText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: '#0369A1',
    flex: 1,
  },
  modeSwitchBtn: {
    backgroundColor: colors.gradientMid,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  modeSwitchBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
});
