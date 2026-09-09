import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Pencil, Star, Receipt } from 'lucide-react-native';
import { getBusinessImageUrl } from '../businessImages';
import { darkColors, fonts, radius } from '../theme';

export default function OwnerBusinessCard({ business, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: getBusinessImageUrl(business.id) }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.name} numberOfLines={1}>{business.businessName}</Text>
          <Pencil size={15} color={darkColors.accent} strokeWidth={2.2} />
        </View>
        <Text style={styles.address} numberOfLines={1}>{business.address}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Star size={11} color={darkColors.stamp} fill={darkColors.stamp} />
            <Text style={styles.statText}>{Number(business.averageRating).toFixed(1)} ({business.reviewCount})</Text>
          </View>
          <View style={styles.statItem}>
            <Receipt size={11} color={darkColors.textMuted} strokeWidth={2} />
            <Text style={styles.statText}>{business.totalBookings} bookings</Text>
          </View>
          {business.offersDelivery && (
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: darkColors.card,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: 88,
    backgroundColor: darkColors.cardBorder,
  },
  body: {
    flex: 1,
    padding: 12,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: darkColors.textPrimary,
    marginRight: 8,
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: darkColors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: darkColors.textMuted,
  },
  deliveryBadge: {
    backgroundColor: darkColors.goodSoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  deliveryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: darkColors.good,
  },
});
