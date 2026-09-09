import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { CheckCircle2, CreditCard, Bike, Footprints, MapPin } from 'lucide-react-native';
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
            {/* Handover Stages Badges */}
            <View style={styles.handoverBadgeRow}>
              <View style={styles.handoverBadge}>
                {item.pickupType === 'COURIER_PICKUP' ? (
                  <Bike size={11} color={colors.gradientMid} />
                ) : (
                  <Footprints size={11} color={colors.inkSoft} />
                )}
                <Text style={styles.handoverBadgeText}>
                  Before wash: {item.pickupType === 'COURIER_PICKUP' ? 'Courier Pickup' : 'Drop-off at shop'}
                </Text>
              </View>

              <View style={styles.handoverBadge}>
                {item.returnType === 'COURIER_DELIVERY' ? (
                  <Bike size={11} color={colors.gradientMid} />
                ) : (
                  <Footprints size={11} color={colors.inkSoft} />
                )}
                <Text style={styles.handoverBadgeText}>
                  After wash: {item.returnType === 'COURIER_DELIVERY' ? 'Doorstep Delivery' : 'Shop Pick-up'}
                </Text>
              </View>
            </View>

            {item.deliveryAddress ? (
              <View style={styles.addressRow}>
                <MapPin size={12} color={colors.gradientMid} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.deliveryAddress}
                </Text>
              </View>
            ) : null}

            {item.notes ? (
              <Text style={styles.notesText} numberOfLines={2}>
                Notes: {item.notes}
              </Text>
            ) : null}

            {/* Total and Fee Summary */}
            {item.totalAmount != null && Number(item.totalAmount) > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Order Total:</Text>
                <Text style={styles.priceVal}>GHS {Number(item.totalAmount).toFixed(2)}</Text>
              </View>
            ) : null}

            <StatusTrack status={item.status} stages={BOOKING_STAGES} labels={STAGE_LABELS} />

            {item.status === 'COMPLETED' && !item.reviewed && (
              <Pressable style={styles.reviewBtn} onPress={() => setReviewingBooking(item)}>
                <Text style={styles.reviewBtnText}>Rate this laundry</Text>
              </Pressable>
            )}
            {item.status === 'COMPLETED' && item.reviewed && (
              <Text style={styles.reviewedText}>Thanks for your review!</Text>
            )}
            {item.paymentStatus === 'PAID' ? (
              <View style={styles.paidBadge}>
                <CheckCircle2 size={15} color={colors.good} strokeWidth={2.2} />
                <Text style={styles.paidBadgeText}>
                  Paid: GHS {Number(item.paidAmount || item.totalAmount || 0).toFixed(2)}
                </Text>
                {item.paymentReference ? (
                  <Text style={styles.paidRefText} numberOfLines={1}>
                    · {item.paymentReference}
                  </Text>
                ) : null}
              </View>
            ) : item.status !== 'CANCELLED' ? (
              <Pressable style={styles.payBtn} onPress={() => setPayingBooking(item)}>
                <CreditCard size={14} color={colors.gradientMid} strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.payBtnText}>
                  Pay GHS {Number(item.totalAmount || 50.0).toFixed(2)} with Paystack
                </Text>
              </Pressable>
            ) : null}
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
  handoverBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  handoverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  handoverBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.ink,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  addressText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    flex: 1,
  },
  notesText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    fontStyle: 'italic',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.paper,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginTop: 8,
    marginBottom: 6,
  },
  priceLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  priceVal: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.gradientMid,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  paidBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goodSoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  paidBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.good,
  },
  paidRefText: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.inkSoft,
    maxWidth: 140,
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
