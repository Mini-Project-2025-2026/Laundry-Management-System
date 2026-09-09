import { View, Pressable, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '../theme';

/**
 * Read-only by default (display a rating). Pass onChange to make it an
 * interactive picker (used in the review form).
 */
export default function RatingStars({ value = 0, size = 15, onChange, spacing = 2 }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <View style={[styles.row, { gap: spacing }]}>
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        const starIcon = (
          <Star
            size={size}
            color={filled ? colors.stamp : '#CBD5E1'}
            fill={filled ? colors.stamp : 'transparent'}
            strokeWidth={2}
          />
        );
        return interactive ? (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            {starIcon}
          </Pressable>
        ) : (
          <View key={n}>{starIcon}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
