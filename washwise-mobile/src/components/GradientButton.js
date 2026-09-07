import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius } from '../theme';

export default function GradientButton({ label, onPress, disabled, style }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wrap, style]}>
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  gradient: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gradientMid,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: '#fff',
  },
});
