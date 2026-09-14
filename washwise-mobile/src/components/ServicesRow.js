import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Waves, Wind, Sparkles, Layers } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

const SERVICES = [
  {
    key: 'wash',
    label: 'Wash & Fold',
    minPrice: 10,
    icon: Waves,
    accent: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    key: 'iron',
    label: 'Steam Iron',
    minPrice: 20,
    icon: Wind,
    accent: '#D97706',
    bg: '#FEF3C7',
  },
  {
    key: 'dryclean',
    label: 'Dry Clean',
    minPrice: 25,
    icon: Sparkles,
    accent: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    key: 'bedding',
    label: 'Duvets & Linens',
    minPrice: 35,
    icon: Layers,
    accent: '#059669',
    bg: '#ECFDF5',
  },
];

export default function ServicesRow({ onPressService }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {SERVICES.map((s) => {
        const IconComponent = s.icon;
        return (
          <Pressable
            key={s.key}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
            onPress={() => onPressService(s.label)}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
              <IconComponent size={22} color={s.accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {s.label}
            </Text>
            <View style={styles.priceChip}>
              <Text style={styles.priceText}>From ₵{s.minPrice}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 6,
    gap: 10,
  },
  tile: {
    width: 108,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    ...shadows.sm,
  },
  tilePressed: {
    transform: [{ scale: 0.95 }],
    borderColor: colors.brandDark,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
  },
  priceChip: {
    backgroundColor: colors.panelAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  priceText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.steelDark,
  },
});
