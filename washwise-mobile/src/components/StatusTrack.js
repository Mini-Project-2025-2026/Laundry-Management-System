import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, fonts } from '../theme';

const DEFAULT_STAGES = ['RECEIVED', 'WASHING', 'DRYING', 'IRONING', 'READY', 'DELIVERED'];

function titleCase(str) {
  return str[0] + str.slice(1).toLowerCase();
}

export default function StatusTrack({ status, stages = DEFAULT_STAGES, cancelledValue = 'CANCELLED', labels }) {
  if (status === cancelledValue) {
    return (
      <View style={styles.track}>
        <View style={styles.step}>
          <View style={[styles.circle, styles.circleCancelled]}>
            <X size={13} color="#fff" strokeWidth={2.5} />
          </View>
          <Text style={styles.labelCancelled}>Cancelled</Text>
        </View>
      </View>
    );
  }

  const currentIndex = stages.indexOf(status);

  return (
    <View style={styles.track}>
      {stages.map((stage, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const isLast = i === stages.length - 1;
        return (
          <View key={stage} style={styles.step}>
            <View style={styles.connectorRow}>
              <View
                style={[
                  styles.circle,
                  done && styles.circleDone,
                  current && styles.circleCurrent,
                ]}
              >
                {done ? (
                  <Check size={12} color="#fff" strokeWidth={2.5} />
                ) : current ? (
                  <View style={styles.currentDot} />
                ) : (
                  <Text style={styles.circleText}>{i + 1}</Text>
                )}
              </View>
              {!isLast && (
                <View style={[styles.connector, done && styles.connectorDone]} />
              )}
            </View>
            <Text style={[styles.label, (done || current) && styles.labelActive]}>
              {labels?.[stage] ?? titleCase(stage)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const CIRCLE = 26;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    marginVertical: 14,
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
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  circleCurrent: {
    backgroundColor: colors.brandDark,
    borderColor: '#38BDF8',
    borderWidth: 2.5,
    ...shadows.glow,
  },
  currentDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  circleCancelled: {
    backgroundColor: colors.alert,
    borderColor: colors.alert,
  },
  circleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkSoft,
  },
  labelCancelled: {
    fontFamily: fonts.bodySemiBold,
    color: colors.alert,
    fontSize: 10,
    marginTop: 5,
  },
  connector: {
    flex: 1,
    height: 2.5,
    backgroundColor: colors.line,
    marginHorizontal: -1,
  },
  connectorDone: {
    backgroundColor: '#059669',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkMuted || colors.inkSoft,
    marginTop: 5,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
  },
});
