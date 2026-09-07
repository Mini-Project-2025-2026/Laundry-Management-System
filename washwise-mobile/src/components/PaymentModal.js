import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import ChipSelect from './ChipSelect';
import { colors, fonts, radius } from '../theme';

const METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'ONLINE'];

function titleCase(str) {
  return str.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
}

export default function PaymentModal({ order, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async () => {
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ amount: Number(amount), method });
      setAmount('');
      setMethod('CASH');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Record payment</Text>
          <Text style={styles.subtitle}>{order.orderCode}</Text>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Method</Text>
          <ChipSelect options={METHODS} value={method} onChange={setMethod} getLabel={titleCase} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, submitting && styles.btnDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={styles.btnPrimaryText}>{submitting ? 'Recording…' : 'Record payment'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,26,33,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.ink,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 20,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  btnPrimary: {
    backgroundColor: colors.stamp,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.stampInk,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnSecondaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
