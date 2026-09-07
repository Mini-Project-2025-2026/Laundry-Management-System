import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useApi } from '../api/client';
import StatBar from '../components/StatBar';
import OrderTimeline from '../components/OrderTimeline';
import { darkColors, fonts, radius } from '../theme';

const FLOW = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'COMPLETED'];
function titleCase(str) {
  return str.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
}

export default function OwnerBookingsScreen() {
  const { api } = useApi();
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const myBusinesses = await api.getMyBusinesses();
      setBusinesses(myBusinesses);
      const all = await Promise.all(myBusinesses.map((b) => api.getBusinessBookings(b.id)));
      setBookings(all.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const advance = async (booking) => {
    const currentIndex = FLOW.indexOf(booking.status);
    const next = FLOW[currentIndex + 1];
    if (!next) return;
    setBusyId(booking.id);
    try {
      await api.updateBookingStatus(booking.id, next);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const cancel = (booking) => {
    Alert.alert('Cancel booking?', `This will cancel ${booking.bookingCode}.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          setBusyId(booking.id);
          try {
            await api.updateBookingStatus(booking.id, 'CANCELLED');
            await load();
          } catch (err) {
            setError(err.message);
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const activeCount = bookings.filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.subtitle}>
        {businesses.length === 0 ? 'Register a business to start receiving bookings' : 'Incoming orders across your businesses'}
      </Text>

      <StatBar
        stats={[
          { icon: 'time-outline', value: pendingCount, label: 'New' },
          { icon: 'sync-outline', value: activeCount, label: 'Active' },
          { icon: 'checkmark-done-outline', value: completedCount, label: 'Completed' },
          { icon: 'receipt-outline', value: bookings.length, label: 'Total' },
        ]}
      />

      <View style={{ height: 16 }} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={bookings}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={darkColors.accent} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No bookings yet.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isTerminal = item.status === 'COMPLETED' || item.status === 'CANCELLED';
          const nextStage = !isTerminal ? FLOW[FLOW.indexOf(item.status) + 1] : null;
          const busy = busyId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.customer?.fullName}</Text>
                  <Text style={styles.code}>{item.bookingCode}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{titleCase(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {item.deliveryRequested ? 'Delivery' : 'Pickup'}
                {item.notes ? ` · ${item.notes}` : ''}
              </Text>

              <OrderTimeline status={item.status} updatedAt={item.updatedAt} />

              <View style={styles.actions}>
                {nextStage && (
                  <Pressable
                    style={[styles.actionBtn, styles.primaryBtn, busy && styles.disabled]}
                    disabled={busy}
                    onPress={() => advance(item)}
                  >
                    <Text style={styles.primaryBtnText}>
                      {busy ? 'Updating…' : `Move to ${titleCase(nextStage)}`}
                    </Text>
                  </Pressable>
                )}
                {!isTerminal && (
                  <Pressable style={styles.cancelBtn} onPress={() => cancel(item)} disabled={busy}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: darkColors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: darkColors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: darkColors.alert,
    backgroundColor: darkColors.alertSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: darkColors.card,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: darkColors.textPrimary,
  },
  code: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: darkColors.textMuted,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: darkColors.accentSoft,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
  },
  statusPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: darkColors.accent,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: darkColors.textMuted,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  primaryBtn: {
    backgroundColor: darkColors.accent,
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  cancelText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: darkColors.alert,
  },
  empty: {
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: darkColors.textMuted,
    textAlign: 'center',
  },
});
