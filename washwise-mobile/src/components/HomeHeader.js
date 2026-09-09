import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin, ChevronDown, Bell, ShoppingBag } from 'lucide-react-native';
import { colors, fonts } from '../theme';

export default function HomeHeader({ userName, locationLabel, unreadCount, onPressBell, onPressBag }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{userName?.[0]?.toUpperCase() ?? 'W'}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.homeRow}>
          <Text style={styles.homeLabel}>Current Location</Text>
          <ChevronDown size={14} color={colors.inkSoft} strokeWidth={2.5} />
        </View>
        <View style={styles.locationRow}>
          <MapPin size={13} color={colors.brand} strokeWidth={2.5} />
          <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
        </View>
      </View>

      <Pressable style={styles.iconBtn} onPress={onPressBell}>
        <Bell size={19} color={colors.ink} strokeWidth={2} />
        {!!unreadCount && <View style={styles.dot} />}
      </Pressable>
      <Pressable style={styles.iconBtn} onPress={onPressBag}>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gradientMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: '#fff',
  },
  homeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  homeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  iconBtn: {
    marginLeft: 6,
    padding: 4,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.alert,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
});
