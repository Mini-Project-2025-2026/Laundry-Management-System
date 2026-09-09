import { View, Text, StyleSheet } from 'react-native';
import {
  Store,
  Receipt,
  Star,
  MessageSquare,
  Clock,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react-native';
import { darkColors, fonts } from '../theme';

const ICON_MAP = {
  'storefront-outline': Store,
  'receipt-outline': Receipt,
  'star-outline': Star,
  'star': Star,
  'chatbubble-ellipses-outline': MessageSquare,
  'time-outline': Clock,
  'sync-outline': RefreshCw,
  'checkmark-done-outline': CheckCircle2,
};

export default function StatBar({ stats }) {
  return (
    <View style={styles.row}>
      {stats.map((s, i) => {
        const IconComponent = typeof s.icon === 'function' ? s.icon : (ICON_MAP[s.icon] || TrendingUp);
        return (
          <View key={s.label} style={[styles.item, i < stats.length - 1 && styles.divider]}>
            <View style={styles.iconWrap}>
              <IconComponent size={14} color={darkColors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.value}>{s.value}</Text>
              <Text style={styles.label}>{s.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: darkColors.card,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    borderRightWidth: 1,
    borderRightColor: darkColors.cardBorder,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(27, 84, 232, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: darkColors.textPrimary,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: darkColors.textMuted,
    marginTop: 1,
  },
});
