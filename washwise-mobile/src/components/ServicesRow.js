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
    paddingVertical: 4,
    gap: 10,
  },
  tile: {
    width: 108,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tilePressed: {
    transform: [{ scale: 0.97 }],
    borderColor: colors.gradientMid,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  priceText: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.inkSoft,
  },
});
