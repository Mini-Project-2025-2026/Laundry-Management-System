import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { darkColors, fonts } from '../theme';

export default function StatBar({ stats }) {
  return (
    <View style={styles.row}>
      {stats.map((s, i) => (
        <View key={s.label} style={[styles.item, i < stats.length - 1 && styles.divider]}>
          <Ionicons name={s.icon} size={16} color={darkColors.accent} />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
        </View>
      ))}
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
    paddingVertical: 14,
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
