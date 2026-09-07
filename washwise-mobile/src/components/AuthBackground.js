import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * Recreates the reference's "curved blob" look using two layered circles
 * rather than an SVG path — a big paper-colored circle carves the wave out
 * of the top gradient block, and a smaller gradient circle peeks in at the
 * bottom-right. No new dependency beyond expo-linear-gradient (already used
 * on Splash/Welcome).
 */
export default function AuthBackground() {
  const topBlockHeight = SCREEN_H * 0.4;
  const carveCircleSize = SCREEN_W * 1.7;
  const bottomBlobSize = SCREEN_W * 0.85;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: topBlockHeight }}
      />
      <View
        style={{
          position: 'absolute',
          width: carveCircleSize,
          height: carveCircleSize,
          borderRadius: carveCircleSize / 2,
          backgroundColor: colors.paper,
          top: topBlockHeight - carveCircleSize * 0.34,
          left: SCREEN_W - carveCircleSize * 0.42,
        }}
      />
      <LinearGradient
        colors={[colors.gradientMid, colors.gradientTop]}
        style={{
          position: 'absolute',
          width: bottomBlobSize,
          height: bottomBlobSize,
          borderRadius: bottomBlobSize / 2,
          bottom: -bottomBlobSize * 0.62,
          right: -bottomBlobSize * 0.4,
        }}
      />
    </View>
  );
}
