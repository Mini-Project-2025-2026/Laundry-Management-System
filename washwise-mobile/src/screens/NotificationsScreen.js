import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { CheckCircle2, RefreshCw, CreditCard, Bell } from 'lucide-react-native';
import { useApi } from '../api/client';
import { colors, fonts, radius } from '../theme';

const ICONS = {
  ORDER_COMPLETED: CheckCircle2,
  BOOKING_STATUS_CHANGE: RefreshCw,
  PAYMENT_CONFIRMED: CreditCard,
  GENERAL: Bell,
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsScreen() {
  const { api } = useApi();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setNotifications(await api.getMyNotifications());
    } catch (err) {
      setError(err.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = async (notification) => {
    if (notification.readFlag) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, readFlag: true } : n))
    );
    try {
      await api.markNotificationRead(notification.id);
    } catch {
      // best-effort; leave optimistic update in place
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Updates on your bookings</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={notifications}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nothing yet — you'll see updates here as your bookings progress.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const IconComponent = ICONS[item.type] || Bell;
          return (
            <Pressable style={[styles.row, !item.readFlag && styles.rowUnread]} onPress={() => handlePress(item)}>
              <View style={[styles.iconWrap, !item.readFlag && styles.iconWrapUnread]}>
                <IconComponent
                  size={18}
                  color={item.readFlag ? colors.inkSoft : colors.gradientMid}
                  strokeWidth={2.2}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.readFlag && <View style={styles.dot} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: 10,
  },
  rowUnread: {
    borderColor: colors.gradientMid,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: {
    backgroundColor: '#E4E9F5',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.stamp,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
