import { View, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function IconPillInput({ icon, ...inputProps }) {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[colors.gradientTop, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Ionicons name={icon} size={20} color="#fff" />
      </LinearGradient>
      <View style={styles.pill}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.inkSoft}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const BADGE_SIZE = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.panel,
    borderRadius: radius.pill,
    marginLeft: -BADGE_SIZE / 2,
    paddingLeft: BADGE_SIZE / 2 + 14,
    paddingRight: 18,
    height: BADGE_SIZE - 6,
    justifyContent: 'center',
    shadowColor: '#1C2430',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
});
