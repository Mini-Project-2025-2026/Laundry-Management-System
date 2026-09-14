import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Tag } from 'lucide-react-native';
import { colors, fonts, radius, shadows } from '../theme';

export default function PromoBanner() {
  return (
    <LinearGradient
      colors={['#0369A1', '#0284C7', '#0EA5E9']}
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
          <Text style={styles.termsText}>Auto-applies at checkout</Text>
        </View>
      </View>
      
      <View style={styles.accentCircle} />
      <View style={styles.accentCircleSmall} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.lg,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.glow,
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
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: '#FDE68A',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 2,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  codeText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  termsText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  accentCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  accentCircleSmall: {
    position: 'absolute',
    right: 60,
    bottom: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
});
