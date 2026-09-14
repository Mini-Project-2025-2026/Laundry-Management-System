import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin, ChevronDown, Bell, ShoppingBag } from 'lucide-react-native';
import { colors, fonts, radius, shadows } from '../theme';

export default function HomeHeader({ userName, locationLabel, unreadCount, onPressBell, onPressBag }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{userName?.[0]?.toUpperCase() ?? 'W'}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.homeRow}>
          <Text style={styles.homeLabel}>Current Location</Text>
          <ChevronDown size={13} color={colors.inkSoft} strokeWidth={2.5} />
        </View>
        <View style={styles.locationRow}>
          <MapPin size={13} color={colors.brandDark} strokeWidth={2.5} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel || 'Locating nearest laundromats…'}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        onPress={onPressBell}
        hitSlop={6}
      >
        <Bell size={19} color={colors.ink} strokeWidth={2} />
        {!!unreadCount && <View style={styles.dot} />}
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        onPress={onPressBag}
        hitSlop={6}
      >
        <ShoppingBag size={19} color={colors.ink} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    ...shadows.sm,
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#FFFFFF',
  },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  homeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
  },
  iconBtnPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: '#F1F5F9',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.alert,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
