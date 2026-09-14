import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Star, MapPin, Bike, Clock } from 'lucide-react-native';
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
      style={({ pressed }) => [
        styles.card,
        variant === 'wide' ? styles.cardWide : styles.cardGrid,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: getBusinessImageUrl(business.id) }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
          <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
          <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
            {isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.name} numberOfLines={1}>
            {business.businessName}
          </Text>
          <View style={styles.ratingPill}>
            <Star size={11} color={colors.stamp} fill={colors.stamp} />
            <Text style={styles.ratingText}>{Number(business.averageRating).toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({business.reviewCount})</Text>
          </View>
        </View>

        <Text style={styles.hoursSubtext} numberOfLines={1}>
          {label}
        </Text>

        <View style={styles.tagsRow}>
          {tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {business.offersDelivery && (
          <View style={styles.perksRow}>
            <View style={styles.perk}>
              <Bike size={11} color={colors.good} strokeWidth={2.2} />
              <Text style={styles.perkText}>Free Pickup</Text>
            </View>
            <View style={styles.perk}>
              <Clock size={11} color={colors.good} strokeWidth={2.2} />
              <Text style={styles.perkText}>24hr Turnaround</Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.pricePrefix}>Starting</Text>
            <Text style={styles.priceValue}>₵{price}</Text>
          </View>

          {distanceLabel && (
            <View style={styles.distanceRow}>
              <MapPin size={10} color={colors.inkSoft} strokeWidth={2.2} />
              <Text style={styles.distanceText}>{distanceLabel}</Text>
            </View>
          )}

          <Pressable style={styles.bookBtn} onPress={onPress}>
            <Text style={styles.bookBtnText}>Book</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 112;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    borderColor: colors.brandDark,
  },
  cardWide: {
    width: 236,
    marginRight: 14,
  },
  cardGrid: {
    flex: 1,
    margin: 6,
  },
  imageWrap: {
    position: 'relative',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.line,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...shadows.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: colors.good,
  },
  dotClosed: {
    backgroundColor: colors.alert,
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
  },
  textOpen: {
    color: '#047857',
  },
  textClosed: {
    color: '#B91C1C',
  },
  body: {
    padding: 12,
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
    fontSize: 13.5,
    color: colors.ink,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.stampSoft || '#FEF3C7',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  ratingText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    color: colors.stampDark,
  },
  ratingCount: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.stampDark,
  },
  hoursSubtext: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: colors.panelAlt,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9.5,
    color: colors.steelDark,
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  perkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9.5,
    color: '#059669',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  pricePrefix: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.ink,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.inkSoft,
  },
  bookBtn: {
    backgroundColor: colors.brandDark,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 5.5,
  },
  bookBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
});
