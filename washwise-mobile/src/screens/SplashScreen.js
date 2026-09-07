import { useEffect, useRef } from 'react';
import { View, Image, Text, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

// Total time on screen: entrance -> slow spin -> fade out.
const ENTRANCE_MS = 900;
const SPIN_MS = 5200;
const EXIT_MS = 900;
const TOTAL_MS = ENTRANCE_MS + SPIN_MS + EXIT_MS; // ~7s

export default function SplashScreen({ onFinish }) {
  const entrance = useRef(new Animated.Value(0)).current; // 0 -> 1, drives fade/slide/scale in
  const spin = useRef(new Animated.Value(0)).current; // loops 0 -> 1 continuously
  const exit = useRef(new Animated.Value(1)).current; // 1 -> 0 at the very end

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      Animated.timing(entrance, {
        toValue: 1,
        duration: ENTRANCE_MS,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => spinLoop.start());

    const exitTimer = setTimeout(() => {
      Animated.timing(exit, {
        toValue: 0,
        duration: EXIT_MS,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, ENTRANCE_MS + SPIN_MS);

    const finishTimer = setTimeout(onFinish, TOTAL_MS);

    return () => {
      spinLoop.stop();
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [entrance, spin, exit, onFinish]);

  const logoScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const logoOpacity = entrance;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const textTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const textOpacity = entrance;

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, '#FFFFFF']}
      locations={[0, 0.55, 1]}
      style={styles.container}
    >
      <Animated.View style={{ opacity: exit }}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Animated.Image
            source={require('../../assets/logo-mark.png')}
            style={[styles.logo, { transform: [{ rotate }] }]}
          />
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textTranslateY }] }}>
          <Text style={styles.appName}>WashWise</Text>
          <Text style={styles.tagline}>The smart way to get your laundry done</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 108,
    height: 108,
  },
  appName: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'center',
  },
});
