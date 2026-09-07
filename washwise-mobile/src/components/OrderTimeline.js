import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { darkColors, fonts } from '../theme';

function shortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

const STAGES = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'COMPLETED'];
const LABELS = { PENDING: 'Placed', ACCEPTED: 'Accepted', IN_PROGRESS: 'In Progress', READY: 'Ready', COMPLETED: 'Done' };

export default function OrderTimeline({ status, updatedAt }) {
  if (status === 'CANCELLED') {
    return (
      <View style={styles.cancelledRow}>
        <Ionicons name="close-circle" size={16} color={darkColors.alert} />
        <Text style={styles.cancelledText}>Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STAGES.indexOf(status);

  return (
    <View style={styles.track}>
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const isLast = i === STAGES.length - 1;
        return (
          <View key={stage} style={styles.step}>
            <View style={styles.connectorRow}>
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                {done && <Ionicons name="checkmark" size={10} color="#fff" />}
              </View>
              {!isLast && <View style={[styles.line, done && styles.lineDone]} />}
            </View>
            <Text style={[styles.label, (done || current) && styles.labelActive]}>
              {LABELS[stage]}
            </Text>
            {current && updatedAt && <Text style={styles.date}>{shortDate(updatedAt)}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const DOT = 20;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: darkColors.cardBorder,
    backgroundColor: darkColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: darkColors.good,
    borderColor: darkColors.good,
  },
  dotCurrent: {
    backgroundColor: darkColors.accent,
    borderColor: darkColors.accent,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: darkColors.cardBorder,
  },
  lineDone: {
    backgroundColor: darkColors.good,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 8.5,
    color: darkColors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: fonts.bodySemiBold,
    color: darkColors.textPrimary,
  },
  date: {
    fontFamily: fonts.monoRegular,
    fontSize: 8,
    color: darkColors.accent,
    marginTop: 2,
  },
  cancelledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
  },
  cancelledText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: darkColors.alert,
  },
});
