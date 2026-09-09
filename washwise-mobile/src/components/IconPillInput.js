import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Mail, Lock, User, Phone, MapPin, Hash } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';

const ICON_MAP = {
  'mail-outline': Mail,
  'mail': Mail,
  'lock-closed-outline': Lock,
  'lock': Lock,
  'person-outline': User,
  'person': User,
  'call-outline': Phone,
  'phone': Phone,
  'location-outline': MapPin,
};

export default function IconPillInput({ icon, onFocus, onBlur, ...inputProps }) {
  const [isFocused, setIsFocused] = useState(false);
  const IconComponent = typeof icon === 'function' ? icon : (ICON_MAP[icon] || Hash);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <View style={[styles.iconWrap, isFocused && styles.iconWrapFocused]}>
        <IconComponent
          size={18}
          color={isFocused ? colors.gradientMid : colors.inkSoft}
          strokeWidth={2}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.inkSoft}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  containerFocused: {
    borderColor: colors.gradientMid,
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.08,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapFocused: {
    backgroundColor: '#E0F2FE',
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
  },
});
