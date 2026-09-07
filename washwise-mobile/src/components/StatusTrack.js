import { View, Text, StyleSheet } from 'react-native';
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
            <Text style={styles.circleTextCancelled}>✕</Text>
          </View>
          <Text style={styles.labelActive}>Cancelled</Text>
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
                <Text
                  style={[
                    styles.circleText,
                    (done || current) && styles.circleTextActive,
                  ]}
                >
                  {done ? '✓' : i + 1}
                </Text>
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

const CIRCLE = 24;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    marginVertical: 12,
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
    backgroundColor: colors.steel,
    borderColor: colors.steel,
  },
  circleCurrent: {
    backgroundColor: colors.stamp,
    borderColor: colors.stamp,
  },
  circleCancelled: {
    backgroundColor: colors.alert,
    borderColor: colors.alert,
  },
  circleText: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.inkSoft,
  },
  circleTextActive: {
    color: '#fff',
  },
  circleTextCancelled: {
    color: '#fff',
    fontFamily: fonts.monoRegular,
    fontSize: 12,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.line,
    marginHorizontal: -1,
  },
  connectorDone: {
    backgroundColor: colors.steel,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: colors.inkSoft,
    marginTop: 4,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
  },
});
