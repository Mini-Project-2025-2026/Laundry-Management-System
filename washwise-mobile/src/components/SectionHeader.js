import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function SectionHeader({ title, actionLabel = 'See all', onPressAction }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onPressAction && (
        <Pressable onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15.5,
    color: colors.ink,
  },
  action: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.gradientMid,
  },
});
