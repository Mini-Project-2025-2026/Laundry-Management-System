import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

export default function CheckRow({ checked, onToggle, label }) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  boxChecked: {
    backgroundColor: colors.gradientMid,
    borderColor: colors.gradientMid,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  labelChecked: {
    color: colors.ink,
    fontFamily: fonts.bodyMedium,
  },
});
