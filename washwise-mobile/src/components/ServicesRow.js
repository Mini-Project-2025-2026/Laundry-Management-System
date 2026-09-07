import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

const SERVICES = [
  { key: 'wash', label: 'Washing', minPrice: 10, icon: 'washing-machine' },
  { key: 'iron', label: 'Ironing', minPrice: 20, icon: 'iron-outline' },
  { key: 'dryclean', label: 'Dry Cleaning', minPrice: 25, icon: 'tshirt-crew-outline' },
];

export default function ServicesRow({ onPressService }) {
  return (
    <View style={styles.row}>
      {SERVICES.map((s) => (
        <Pressable key={s.key} style={styles.tile} onPress={() => onPressService(s.label)}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={s.icon} size={22} color={colors.gradientMid} />
          </View>
          <Text style={styles.label}>{s.label}</Text>
          <Text style={styles.price}>Min ₵{s.minPrice}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4E9F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: colors.ink,
  },
  price: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
    marginTop: 1,
  },
});
