import { Pressable, Text, View, StyleSheet } from 'react-native';
import {
  Lock,
  LogOut,
  Trash2,
  ShieldCheck,
  FileText,
  BookOpen,
  ChevronRight,
  CircleDot,
} from 'lucide-react-native';
import { colors, fonts } from '../theme';

const ICON_MAP = {
  'lock-closed-outline': Lock,
  'log-out-outline': LogOut,
  'trash-outline': Trash2,
  'shield-checkmark-outline': ShieldCheck,
  'document-text-outline': FileText,
  'reader-outline': BookOpen,
};

export default function SettingsRow({ icon, label, onPress, danger = false, last = false }) {
  const IconComponent = typeof icon === 'function' ? icon : (ICON_MAP[icon] || CircleDot);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, last && styles.rowLast, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        <IconComponent
          size={16}
          color={danger ? colors.alert : colors.gradientMid}
          strokeWidth={2.2}
        />
      </View>
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      <ChevronRight size={16} color={colors.inkSoft} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: colors.alertSoft,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
  },
  labelDanger: {
    color: colors.alert,
  },
});
