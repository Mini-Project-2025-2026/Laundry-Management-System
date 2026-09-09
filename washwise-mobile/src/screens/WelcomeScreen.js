import { Image, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius } from '../theme';

export default function WelcomeScreen({ onGetStarted, onHaveAccount }) {
  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, '#FFFFFF']}
      locations={[0, 0.32, 0.62]}
      style={styles.container}
    >
      <SafeAreaView style={styles.flex}>
        <Image source={require('../../assets/logo-mark.png')} style={styles.brandMark} />
        <Text style={styles.brandName}>WashWise</Text>

        <Image source={require('../../assets/laundry-basket.png')} style={styles.illustration} resizeMode="contain" />

        <Text style={styles.headline}>Laundry, done for you.{'\n'}Anytime, anywhere.</Text>

        <Pressable style={styles.primaryBtn} onPress={onGetStarted}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={onHaveAccount}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </Pressable>

        <Text style={styles.footnote}>
          By continuing you agree to our Terms of Service{'\n'}and Privacy Policy
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  brandMark: {
    width: 30,
    height: 30,
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#fff',
    marginTop: 6,
  },
  illustration: {
    width: 220,
    height: 220,
    marginTop: 34,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 26,
  },
  primaryBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 36,
  },
  primaryBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
  },
  secondaryBtn: {
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 18,
  },
});
