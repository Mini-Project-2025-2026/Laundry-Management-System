import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBusinessImageUrl } from '../businessImages';
import { getBusinessTags, getStartingPrice } from '../businessTags';
import { getOpenStatus } from '../businessHours';
import { colors, fonts, radius } from '../theme';

/**
 * variant: 'wide' for the horizontal "Popular Nearby" rail, 'grid' for the
 * 2-column search-results grid. Same content, different sizing.
 */
export default function BusinessCard({ business, onPress, distanceLabel, variant = 'grid' }) {
  const { isOpen, label } = getOpenStatus(business);
  const tags = getBusinessTags(business.id);
  const price = getStartingPrice(business.id);

  return (
    <Pressable
      style={[styles.card, variant === 'wide' ? styles.cardWide : styles.cardGrid]}
      onPress={onPress}
    >
      <Image source={{ uri: getBusinessImageUrl(business.id) }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.name} numberOfLines={1}>{business.businessName}</Text>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={10} color={colors.stamp} />
            <Text style={styles.ratingText}>{Number(business.averageRating).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({business.reviewCount})</Text>
          </View>
        </View>

        <Text style={[styles.statusText, isOpen ? styles.open : styles.closed]}>
          {isOpen ? 'Open' : 'Closed'} · {label}
        </Text>

        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
        </View>

        {business.offersDelivery && (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={11} color={colors.good} />
              <Text style={styles.badgeText}>Free Pickup</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={11} color={colors.good} />
              <Text style={styles.badgeText}>24hr Delivery</Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.price}>From ₵{price}</Text>
          {distanceLabel && (
            <View style={styles.distanceRow}>
              <Ionicons name="location" size={10} color={colors.inkSoft} />
              <Text style={styles.distanceText}>{distanceLabel}</Text>
            </View>
          )}
          <Pressable style={styles.bookBtn} onPress={onPress}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 100;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  cardWide: {
    width: 210,
    marginRight: 12,
  },
  cardGrid: {
    flex: 1,
    margin: 6,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.line,
  },
  body: {
    padding: 10,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.ink,
  },
  ratingCount: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.inkSoft,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    marginTop: 4,
  },
  open: {
    color: colors.good,
  },
  closed: {
    color: colors.alert,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: colors.paper,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: '100%',
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.inkSoft,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.good,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.ink,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: colors.inkSoft,
  },
  bookBtn: {
    backgroundColor: colors.gradientMid,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  bookBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: '#fff',
  },
});
