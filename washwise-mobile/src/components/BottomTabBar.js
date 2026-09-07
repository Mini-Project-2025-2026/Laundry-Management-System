import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function BottomTabBar({ tabs, active, onNavigate, badges = {} }) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const badgeCount = badges[tab.key];
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onNavigate(tab.key)}>
            <View>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={21}
                color={isActive ? colors.stamp : '#8EA3B2'}
              />
              {!!badgeCount && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.steelDark,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#CDD9E1',
  },
  labelActive: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
  },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.stamp,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: '#fff',
  },
});
