import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

export default function PaystackPaymentModal({ booking, api, onClose, onPaid }) {
  const [amount, setAmount] = useState('');
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!booking) return null;

  const initialize = async () => {
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter a payment amount greater than 0.');
      return;
    }
    setLoading(true);
    try {
      setCheckout(await api.initializePaystackPayment(booking.id, amount));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    setVerifying(true);
    try {
      await api.verifyPaystackPayment(checkout.reference);
      onPaid();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pay for booking</Text>
            <Text style={styles.subtitle}>{booking.bookingCode}</Text>
          </View>
          <Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable>
        </View>

        {!checkout ? (
          <View style={styles.form}>
            <Text style={styles.copy}>Choose how much you want to pay securely with Paystack.</Text>
            <Text style={styles.label}>Amount (GHS)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="50.00"
              autoFocus
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GradientButton label={loading ? 'Starting checkout…' : 'Continue to Paystack'} onPress={initialize} disabled={loading} />
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: checkout.authorizationUrl }}
              style={styles.webview}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
            />
            <View style={styles.verifyBar}>
              <Text style={styles.copy}>After completing payment, return here and verify the transaction.</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GradientButton label={verifying ? 'Verifying…' : 'I completed payment'} onPress={verify} disabled={verifying} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  subtitle: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.inkSoft, marginTop: 3 },
  close: { fontFamily: fonts.bodySemiBold, color: colors.gradientMid, fontSize: 13 },
  form: { padding: 20 },
  copy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { fontFamily: fonts.bodySemiBold, color: colors.inkSoft, fontSize: 11, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 13, fontFamily: fonts.body, fontSize: 17, color: colors.ink, marginBottom: 16 },
  webview: { flex: 1 },
  verifyBar: { padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.panel },
  error: { color: colors.alert, backgroundColor: colors.alertSoft, padding: 10, borderRadius: radius.sm, marginBottom: 12, fontFamily: fonts.body, fontSize: 13 },
});