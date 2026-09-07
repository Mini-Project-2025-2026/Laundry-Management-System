import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * direction: 'right' means the content slides in FROM the right (used when
 * moving forward, e.g. Login -> Signup); 'left' slides in from the left
 * (moving back, Signup -> Login).
 */
export default function SlideFadeIn({ direction = 'right', children, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const startX = direction === 'right' ? 36 : -36;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [startX, 0] });

  return (
    <Animated.View style={[{ flex: 1, opacity: progress, transform: [{ translateX }] }, style]}>
      {children}
    </Animated.View>
  );
}
