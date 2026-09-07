import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function PromoBanner() {
  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Laundry Made Easy.{'\n'}Get 50% OFF On Wash & Fold Today!</Text>
        <View style={styles.codeChip}>
          <Text style={styles.codeText}>Use code: WASH50</Text>
        </View>
      </View>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="washing-machine" size={54} color="rgba(255,255,255,0.9)" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: 16,
    overflow: 'hidden',
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: '#fff',
    lineHeight: 19,
  },
  codeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  codeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: '#fff',
  },
  iconWrap: {
    width: 64,
    alignItems: 'center',
  },
});
