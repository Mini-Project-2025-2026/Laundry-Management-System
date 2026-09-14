import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Compass, Receipt, Bell, Settings, Store } from 'lucide-react-native';
import { colors, fonts, radius, shadows } from '../theme';

const ICON_MAP = {
  explore: Compass,
  bookings: Receipt,
  notifications: Bell,
  settings: Settings,
  business: Store,
};

export default function BottomTabBar({ tabs, active, onNavigate, badges = {} }) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const badgeCount = badges[tab.key];
        const IconComponent = ICON_MAP[tab.key] || Compass;

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onNavigate(tab.key)}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <IconComponent
                size={20}
                color={isActive ? colors.brandDark : colors.inkSoft}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {!!badgeCount && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    ...shadows.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  tabPressed: {
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 48,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: '#E0F2FE',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandDark,
    marginTop: 1,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: colors.inkMuted || '#94A3B8',
  },
  labelActive: {
    color: colors.brandDark,
    fontFamily: fonts.bodySemiBold,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: '#FFFFFF',
  },
});
