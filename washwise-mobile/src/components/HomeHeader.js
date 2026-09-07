import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function HomeHeader({ userName, locationLabel, unreadCount, onPressBell, onPressBag }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{userName?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={styles.homeRow}>
          <Text style={styles.homeLabel}>Home</Text>
          <Ionicons name="chevron-down" size={14} color={colors.inkSoft} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={colors.gradientMid} />
          <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
        </View>
      </View>

      <Pressable style={styles.iconBtn} onPress={onPressBell}>
        <Ionicons name="notifications-outline" size={21} color={colors.ink} />
        {!!unreadCount && <View style={styles.dot} />}
      </Pressable>
      <Pressable style={styles.iconBtn} onPress={onPressBag}>
        <Ionicons name="bag-outline" size={21} color={colors.ink} />
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
