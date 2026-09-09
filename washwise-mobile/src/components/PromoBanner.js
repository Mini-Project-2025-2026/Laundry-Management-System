import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Tag } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

export default function PromoBanner() {
  return (
    <LinearGradient
      colors={[colors.steelDark, colors.steel]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.sparkleBadge}>
            <Sparkles size={12} color={colors.stamp} strokeWidth={2.5} />
            <Text style={styles.badgeText}>SPECIAL WELCOME OFFER</Text>
          </View>
        </View>
        
        <Text style={styles.title}>50% Off Your First Wash</Text>
        <Text style={styles.subtitle}>Premium wash, steam press & doorstep delivery</Text>
        
        <View style={styles.codeRow}>
          <View style={styles.codeChip}>
            <Tag size={12} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.codeText}>CODE: WASH50</Text>
          </View>
          <Text style={styles.termsText}>Applies at checkout</Text>
        </View>
      </View>
      
      <View style={styles.accentCircle} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: colors.stamp,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  codeText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: '#FFFFFF',
  },
  termsText: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  accentCircle: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
  },
});
