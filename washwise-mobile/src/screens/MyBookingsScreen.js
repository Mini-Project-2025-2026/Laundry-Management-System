import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useApi } from '../api/client';
import StatusTrack from '../components/StatusTrack';
import ReviewModal from '../components/ReviewModal';
import PaystackPaymentModal from '../components/PaystackPaymentModal';
import { colors, fonts, radius } from '../theme';

const BOOKING_STAGES = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'COMPLETED'];
const STAGE_LABELS = {
  PENDING: 'Placed',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  READY: 'Ready',
  COMPLETED: 'Done',
};

export default function MyBookingsScreen() {
  const { api } = useApi();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setBookings(await api.getMyBookings());
    } catch (err) {
      setError(err.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (payload) => {
    await api.submitReview(reviewingBooking.laundryBusiness.id, { ...payload, bookingId: reviewingBooking.id });
    await load();
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.subtitle}>Track every order from placed to delivered</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={bookings}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No bookings yet — find a laundry on Explore.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.businessName}>{item.laundryBusiness?.businessName}</Text>
              <Text style={styles.code}>{item.bookingCode}</Text>
            </View>
            <Text style={styles.meta}>
              {item.deliveryRequested ? 'Delivery' : 'Pickup'}
              {item.notes ? ` · ${item.notes}` : ''}
            </Text>

            <StatusTrack status={item.status} stages={BOOKING_STAGES} labels={STAGE_LABELS} />

            {item.status === 'COMPLETED' && !item.reviewed && (
              <Pressable style={styles.reviewBtn} onPress={() => setReviewingBooking(item)}>
                <Text style={styles.reviewBtnText}>Rate this laundry</Text>
              </Pressable>
            )}
            {item.status === 'COMPLETED' && item.reviewed && (
              <Text style={styles.reviewedText}>Thanks for your review!</Text>
            )}
            {item.status !== 'CANCELLED' && item.paymentStatus !== 'PAID' && (
              <Pressable style={styles.payBtn} onPress={() => setPayingBooking(item)}>
                <Text style={styles.payBtnText}>Pay securely with Paystack</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {reviewingBooking && (
        <ReviewModal
          business={reviewingBooking.laundryBusiness}
          onClose={() => setReviewingBooking(null)}
          onSubmit={handleReview}
        />
      )}
      {payingBooking && (
        <PaystackPaymentModal
          booking={payingBooking}
          api={api}
          onClose={() => setPayingBooking(null)}
          onPaid={load}
        />
      )}
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
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.ink,
  },
  code: {
    fontFamily: fonts.monoRegular,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  reviewBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.warnSoft,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  reviewBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.warnInk,
  },
  reviewedText: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.good,
  },
  payBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gradientMid,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  payBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.gradientMid,
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
