import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import MapView from '../components/MapView';
import RatingStars from '../components/RatingStars';
import GradientButton from '../components/GradientButton';
import BookingModal from '../components/BookingModal';
import { colors, fonts, radius } from '../theme';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };

function formatHour(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutePart = m ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour12}${minutePart}${period}`;
}

export default function BusinessDetailScreen({ businessId, onBack, onBooked }) {
  const { api } = useApi();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const [b, r] = await Promise.all([api.getBusiness(businessId), api.getReviews(businessId)]);
        setBusiness(b);
        setReviews(r);
      } catch (err) {
        setError(err.message);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [api, businessId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleBook = async (payload) => {
    await api.createBooking(payload);
    setBookingMessage('Booking confirmed! Track it in the Bookings tab.');
    onBooked?.();
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Business" onBack={onBack} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Business" onBack={onBack} />
        <Text style={styles.errorText}>{error || 'Not found.'}</Text>
      </View>
    );
  }

  const sortedDays = [...business.workingDays].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

  return (
    <View style={styles.screen}>
      <ScreenHeader title={business.businessName} onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <MapView latitude={business.latitude} longitude={business.longitude} label={business.businessName} />
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={13} color={colors.inkSoft} />
          <Text style={styles.addressText}>{business.address}</Text>
        </View>

        {business.description ? <Text style={styles.description}>{business.description}</Text> : null}

        <View style={styles.ratingRow}>
          <RatingStars value={business.averageRating} size={16} />
          <Text style={styles.ratingValue}>{Number(business.averageRating).toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({business.reviewCount} reviews · {business.totalBookings} bookings)</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.gradientMid} />
            <Text style={styles.infoText}>
              {formatHour(business.openTime)} – {formatHour(business.closeTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.gradientMid} />
            <Text style={styles.infoText}>{sortedDays.map((d) => DAY_SHORT[d]).join(', ')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name={business.offersDelivery ? 'bicycle-outline' : 'walk-outline'}
              size={16}
              color={colors.gradientMid}
            />
            <Text style={styles.infoText}>
              {business.offersDelivery ? 'Offers pickup & delivery' : 'Pickup only'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet — be the first after your booking.</Text>
        ) : (
          reviews.slice(0, 8).map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <Text style={styles.reviewer}>{r.customer?.fullName ?? 'Customer'}</Text>
                <RatingStars value={r.overall} size={12} />
              </View>
              {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            </View>
          ))
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <View style={styles.bookBar}>
        {bookingMessage ? (
          <Text style={styles.bookingConfirm}>{bookingMessage}</Text>
        ) : (
          <GradientButton label="Book Now" onPress={() => setShowBooking(true)} />
        )}
      </View>

      {showBooking && (
        <BookingModal business={business} onClose={() => setShowBooking(false)} onSubmit={handleBook} />
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
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.alert,
    textAlign: 'center',
    marginTop: 40,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  addressText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    flex: 1,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 20,
    marginTop: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  ratingValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  ratingCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  infoCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    marginTop: 22,
    marginBottom: 10,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  reviewCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  reviewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewer: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  reviewComment: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    lineHeight: 18,
  },
  bookBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  bookingConfirm: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.good,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
