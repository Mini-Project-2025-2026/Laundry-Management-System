import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function MapPlaceholder({ address, latitude, longitude }) {
  return (
    <View style={styles.box}>
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.gridCell} />
        ))}
      </View>
      <View style={styles.pinWrap}>
        <Ionicons name="location" size={28} color={colors.gradientMid} />
      </View>
      <Text style={styles.address} numberOfLines={2}>{address}</Text>
      {latitude != null && longitude != null && (
        <Text style={styles.coords}>
          {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
        </Text>
      )}
      <Text style={styles.note}>Map view coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    backgroundColor: '#E4E9F5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.5,
  },
  gridCell: {
    width: '16.66%',
    height: '25%',
    borderWidth: 1,
    borderColor: '#D3DBEE',
  },
  pinWrap: {
    marginBottom: 6,
  },
  address: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
  },
  coords: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.inkSoft,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
