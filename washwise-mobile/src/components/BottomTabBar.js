import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Compass, Receipt, Bell, Settings, Store } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

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
            style={styles.tab}
            onPress={() => onNavigate(tab.key)}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <IconComponent
                size={20}
                color={isActive ? colors.brandDark : '#94A3B8'}
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconContainer: {
    width: 44,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: colors.brandSoft,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#94A3B8',
  },
  labelActive: {
    color: colors.brandDark,
    fontFamily: fonts.bodySemiBold,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 3,
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
