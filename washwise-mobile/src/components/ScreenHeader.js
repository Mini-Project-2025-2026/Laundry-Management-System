import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, fonts } from '../theme';

export default function ScreenHeader({ title, onBack, right }) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
        <ArrowLeft size={20} color={colors.ink} strokeWidth={2.2} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});
