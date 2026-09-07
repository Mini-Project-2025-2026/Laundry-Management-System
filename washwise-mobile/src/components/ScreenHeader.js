import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function ScreenHeader({ title, onBack, right }) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
  },
  backBtn: {
    width: 32,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
  },
  rightSlot: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
});
