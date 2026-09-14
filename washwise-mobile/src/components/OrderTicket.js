import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import StatusTrack from './StatusTrack';
import { colors, fonts, radius } from '../theme';

const FLOW = ['RECEIVED', 'WASHING', 'DRYING', 'IRONING', 'READY', 'DELIVERED'];

function titleCase(str) {
  return str
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

function formatItems(items) {
  return items
    .map((it) => `${it.quantity}x ${titleCase(it.garmentType)} (${titleCase(it.serviceType)})`)
    .join(', ');
}

function pillStyle(paymentStatus) {
  if (paymentStatus === 'PAID') return [styles.pill, styles.pillPaid];
  if (paymentStatus === 'PARTIALLY_PAID') return [styles.pill, styles.pillPartial];
  return [styles.pill, styles.pillUnpaid];
}

function pillTextStyle(paymentStatus) {
  if (paymentStatus === 'PAID') return styles.pillTextPaid;
  if (paymentStatus === 'PARTIALLY_PAID') return styles.pillTextPartial;
  return styles.pillTextUnpaid;
}

export default function OrderTicket({ order, onAdvance, onOpenPayment }) {
  const [busy, setBusy] = useState(false);

  const currentIndex = FLOW.indexOf(order.status);
  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';
  const nextStage = !isTerminal ? FLOW[currentIndex + 1] : null;
  const paid = order.paymentStatus === 'PAID';
  const balance = Number(order.totalAmount ?? 0) - Number(order._paid ?? 0);

  const handleAdvance = async () => {
    if (!nextStage) return;
    setBusy(true);
    try {
      await onAdvance(order, nextStage);
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert('Cancel order?', `This will cancel ${order.orderCode}. This can't be undone.`, [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await onAdvance(order, 'CANCELLED');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.ticket}>
      <View style={styles.notchLeft} />
      <View style={styles.notchRight} />

      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{order.orderCode}</Text>
          <Text style={styles.customer}>
            {order.customer?.fullName} · {order.customer?.phoneNumber}
          </Text>
        </View>
        <View style={pillStyle(order.paymentStatus)}>
          <Text style={pillTextStyle(order.paymentStatus)}>
            {order.paymentStatus === 'PARTIALLY_PAID' ? 'PARTIAL' : order.paymentStatus}
          </Text>
        </View>
      </View>

      <View style={styles.perf} />

      <StatusTrack status={order.status} />

      <Text style={styles.items}>{formatItems(order.items)}</Text>

      <View style={styles.totalsRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalsLine}>
            Subtotal <Text style={styles.mono}>GHS {Number(order.subtotal).toFixed(2)}</Text>
          </Text>
          {Number(order.discountAmount) > 0 && (
            <Text style={styles.totalsLine}>
              Discount <Text style={styles.mono}>−GHS {Number(order.discountAmount).toFixed(2)}</Text>
            </Text>
          )}
          {!paid && (
            <Text style={styles.totalsLine}>
              Balance due <Text style={styles.mono}>GHS {balance.toFixed(2)}</Text>
            </Text>
          )}
        </View>
        <Text style={styles.totalAmount}>GHS {Number(order.totalAmount).toFixed(2)}</Text>
      </View>

      <View style={styles.perf} />

      <View style={styles.actions}>
        {!paid && (
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => onOpenPayment(order)}
          >
            <Text style={styles.btnSecondaryText}>Record payment</Text>
          </Pressable>
        )}

        {nextStage && (
          <Pressable
            style={[styles.btn, styles.btnPrimary, busy && styles.btnDisabled]}
            disabled={busy}
            onPress={handleAdvance}
          >
            <Text style={styles.btnPrimaryText}>
              {busy ? 'Updating…' : `Move to ${titleCase(nextStage)}`}
            </Text>
          </Pressable>
        )}

        {!isTerminal && (
          <Pressable style={styles.btnGhost} onPress={confirmCancel} disabled={busy}>
            <Text style={styles.btnGhostText}>Cancel order</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 16,
    position: 'relative',
    ...shadows.card,
  },
  notchLeft: {
    position: 'absolute',
    left: -8,
    top: '48%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  notchRight: {
    position: 'absolute',
    right: -8,
    top: '48%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: 15,
    color: colors.steelDark,
  },
  customer: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  perf: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  items: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: 10,
    lineHeight: 18,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  totalsLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 2,
  },
  mono: {
    fontFamily: fonts.monoRegular,
    color: colors.ink,
  },
  totalAmount: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  btnPrimary: {
    backgroundColor: colors.stamp,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.stampInk,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  btnSecondaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  btnGhost: {
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  btnGhostText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.alert,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  pill: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
  },
  pillUnpaid: { backgroundColor: colors.alertSoft },
  pillPartial: { backgroundColor: colors.warnSoft },
  pillPaid: { backgroundColor: colors.goodSoft },
  pillTextUnpaid: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: '#8A3A20' },
  pillTextPartial: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.warnInk },
  pillTextPaid: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.good },
});
