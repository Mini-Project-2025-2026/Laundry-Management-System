import { useState, useMemo } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  CheckCircle2,
  ShieldCheck,
  FlaskConical,
  CreditCard,
  Smartphone,
} from 'lucide-react-native';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

const PRESET_AMOUNTS = ['20.00', '50.00', '100.00', '200.00'];

export default function PaystackPaymentModal({ booking, api, onClose, onPaid }) {
  const initialAmount = useMemo(() => {
    if (booking?.totalAmount != null && Number(booking.totalAmount) > 0) {
      return Number(booking.totalAmount).toFixed(2);
    }
    return '50.00';
  }, [booking?.totalAmount]);

  const [amount, setAmount] = useState(initialAmount);
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedAmount, setVerifiedAmount] = useState(null);
  const [verifiedReference, setVerifiedReference] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('momo');
  const [phoneNumber, setPhoneNumber] = useState('0594284142');

  if (!booking) return null;

  const initialize = async (asMock = true) => {
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter a payment amount greater than 0.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.initializePaystackPayment(booking.id, amount, asMock);
      setCheckout(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (ref) => {
    const referenceToVerify = ref || checkout?.reference;
    if (!referenceToVerify || verifying) return;
    setError('');
    setVerifying(true);
    try {
      const res = await api.verifyPaystackPayment(referenceToVerify);
      setVerifiedAmount(res.amount || amount);
      setVerifiedReference(res.reference || referenceToVerify);
      setPaymentSuccess(true);
      onPaid?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (!url) return;
    if (
      url.includes('/payment/callback') ||
      url.includes('trxref=') ||
      (checkout?.reference && url.includes(checkout.reference))
    ) {
      verify();
    } else if (url.includes('cancel') || url.includes('close')) {
      setError('Payment cancelled.');
      setCheckout(null);
    }
  };

  const handleShouldStartLoadWithRequest = (req) => {
    const { url } = req;
    if (
      url.includes('/payment/callback') ||
      url.includes('trxref=') ||
      (checkout?.reference && url.includes(checkout.reference))
    ) {
      verify();
      return false;
    }
    return true;
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pay with Paystack</Text>
            <Text style={styles.subtitle}>
              {booking.bookingCode} · {booking.laundryBusiness?.businessName || 'Laundry Service'}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        {checkout && !checkout.isMock && !paymentSuccess && (
          <View style={styles.testHintBanner}>
            <FlaskConical size={14} color="#B45309" strokeWidth={2.2} />
            <Text style={styles.testHintText}>
              <Text style={{ fontFamily: fonts.bodySemiBold }}>Test MoMo (MTN): </Text>
              <Text style={{ fontFamily: fonts.monoSemiBold, color: '#78350F' }}>055 123 4987</Text>
              {'  •  '}
              <Text style={{ fontFamily: fonts.bodySemiBold }}>Card: </Text>
              <Text style={{ fontFamily: fonts.monoSemiBold, color: '#78350F' }}>4084 0840 8408 4084</Text>
            </Text>
          </View>
        )}

        {paymentSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIconWrap}>
              <CheckCircle2 size={68} color={colors.good} strokeWidth={2.2} />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your booking payment of GHS {Number(verifiedAmount || amount).toFixed(2)} was received and confirmed.
            </Text>

            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Status</Text>
                <View style={styles.paidPill}>
                  <Text style={styles.paidPillText}>PAID</Text>
                </View>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Booking Code</Text>
                <Text style={styles.receiptValue}>{booking.bookingCode}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Reference</Text>
                <Text style={[styles.receiptValue, styles.monoText]}>{verifiedReference}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Gateway</Text>
                <Text style={styles.receiptValue}>Paystack</Text>
              </View>
            </View>

            <GradientButton label="All Done" onPress={handleFinish} style={{ marginTop: 24 }} />
          </View>
        ) : !checkout ? (
          <View style={styles.form}>
            <View style={styles.infoBanner}>
              <ShieldCheck size={18} color={colors.gradientMid} strokeWidth={2.2} />
              <Text style={styles.infoBannerText}>
                Pay for laundry with MTN Mobile Money or official Paystack checkout.
              </Text>
            </View>

            <Text style={styles.label}>Quick Select Amount</Text>
            <View style={styles.chipsRow}>
              {PRESET_AMOUNTS.map((val) => (
                <Pressable
                  key={val}
                  style={[styles.chip, amount === val && styles.chipActive]}
                  onPress={() => setAmount(val)}
                >
                  <Text style={[styles.chipText, amount === val && styles.chipTextActive]}>
                    GHS {val}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Amount to Pay (GHS)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="50.00"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Primary Option: Direct MTN MoMo with 0594284142 */}
            <View style={styles.momoCard}>
              <View style={styles.momoHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={18} color="#0284C7" strokeWidth={2.2} />
                  <Text style={styles.momoTitle}>MTN Mobile Money</Text>
                </View>
                <View style={styles.momoBadge}>
                  <Text style={styles.momoBadgeText}>DIRECT / TEST</Text>
                </View>
              </View>

              <Text style={[styles.label, { marginTop: 12, marginBottom: 4 }]}>MoMo Phone Number</Text>
              <TextInput
                style={styles.momoInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="0594284142"
              />

              <GradientButton
                label={loading ? 'Processing…' : `Pay GHS ${Number(amount || 0).toFixed(2)} with MoMo`}
                onPress={() => initialize(true)}
                disabled={loading}
                style={{ marginTop: 4 }}
              />
            </View>

            {/* Secondary Option: Official Paystack Hosted Gateway */}
            <Pressable
              style={styles.paystackWebBtn}
              onPress={() => initialize(false)}
              disabled={loading}
            >
              <CreditCard size={15} color={colors.inkSoft} strokeWidth={2} />
              <Text style={styles.paystackWebText}>
                Open Paystack Web Gateway (Official popup)
              </Text>
            </Pressable>
          </View>
        ) : checkout.mock ? (
          /* Sandbox / Demo Simulation View */
          <View style={styles.mockContainer}>
            <View style={styles.mockBanner}>
              <FlaskConical size={20} color={colors.stamp} strokeWidth={2.2} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.mockBannerTitle}>Mobile Money Checkout</Text>
                <Text style={styles.mockBannerSub}>Simulating instant Mobile Money authorization.</Text>
              </View>
            </View>

            <View style={styles.mockCard}>
              <Text style={styles.mockLabel}>PAYMENT SUMMARY</Text>
              <Text style={styles.mockAmount}>GHS {Number(amount).toFixed(2)}</Text>
              <Text style={styles.mockRef}>Ref: {checkout.reference}</Text>

              <Text style={[styles.mockLabel, { marginTop: 18 }]}>PAYMENT METHOD</Text>
              <View style={styles.channelRow}>
                <Pressable
                  style={[styles.channelBtn, selectedChannel === 'momo' && styles.channelBtnActive]}
                  onPress={() => setSelectedChannel('momo')}
                >
                  <Smartphone
                    size={18}
                    color={selectedChannel === 'momo' ? '#fff' : colors.ink}
                    strokeWidth={2}
                  />
                  <Text style={[styles.channelBtnText, selectedChannel === 'momo' && styles.channelBtnTextActive]}>
                    MTN MoMo
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.channelBtn, selectedChannel === 'card' && styles.channelBtnActive]}
                  onPress={() => setSelectedChannel('card')}
                >
                  <CreditCard
                    size={18}
                    color={selectedChannel === 'card' ? '#fff' : colors.ink}
                    strokeWidth={2}
                  />
                  <Text style={[styles.channelBtnText, selectedChannel === 'card' && styles.channelBtnTextActive]}>
                    Debit Card
                  </Text>
                </Pressable>
              </View>

              {selectedChannel === 'momo' ? (
                <View style={styles.momoPromptBox}>
                  <Text style={styles.mockLabel}>RECIPIENT NUMBER</Text>
                  <TextInput
                    style={[styles.input, { marginTop: 6, marginBottom: 8 }]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="0594284142"
                  />
                  <Text style={styles.mockHint}>
                    Approving MTN MoMo prompt for GHS {Number(amount).toFixed(2)} on {phoneNumber || '0594284142'}.
                  </Text>
                </View>
              ) : (
                <Text style={styles.mockHint}>
                  Simulating Visa/Mastercard test card payment flow.
                </Text>
              )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {verifying ? (
              <View style={styles.verifyingWrap}>
                <ActivityIndicator size="small" color={colors.gradientMid} />
                <Text style={styles.verifyingText}>Confirming MoMo payment on {phoneNumber || '0594284142'}…</Text>
              </View>
            ) : (
              <>
                <GradientButton
                  label={
                    selectedChannel === 'momo'
                      ? `Approve MoMo Payment (${phoneNumber || '0594284142'})`
                      : 'Simulate Successful Payment'
                  }
                  onPress={() => verify(checkout.reference)}
                  disabled={verifying}
                  style={{ marginTop: 12 }}
                />
                <Pressable
                  style={styles.mockCancelBtn}
                  onPress={() => {
                    setCheckout(null);
                    setError('Payment cancelled.');
                  }}
                >
                  <Text style={styles.mockCancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          /* Live Paystack Hosted WebView */
          <>
            <WebView
              source={{ uri: checkout.authorizationUrl }}
              style={styles.webview}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            />
            <View style={styles.verifyBar}>
              <Text style={styles.copy}>
                Complete the transaction on Paystack. If not automatically returned, tap below:
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <GradientButton
                label={verifying ? 'Verifying with Paystack…' : 'I Completed Payment'}
                onPress={() => verify(checkout.reference)}
                disabled={verifying}
              />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  subtitle: { fontFamily: fonts.monoRegular, fontSize: 12, color: colors.inkSoft, marginTop: 3 },
  close: { fontFamily: fonts.bodySemiBold, color: colors.gradientMid, fontSize: 13 },
  form: { padding: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4E9F5',
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 20,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    lineHeight: 17,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    color: colors.inkSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.gradientMid,
    backgroundColor: '#E8EEFC',
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.gradientMid,
    fontFamily: fonts.bodySemiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.panel,
    padding: 13,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 16,
  },
  webview: { flex: 1 },
  verifyBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.panel,
  },
  copy: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 12,
  },
  error: {
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 12,
    fontFamily: fonts.body,
    fontSize: 13,
  },

  // Mock / Sandbox Styles
  mockContainer: {
    padding: 20,
    flex: 1,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: colors.stamp,
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 16,
  },
  mockBannerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.stampInk,
  },
  mockBannerSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.stampDark,
  },
  mockCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 16,
  },
  mockLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.inkSoft,
    letterSpacing: 0.5,
  },
  mockAmount: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    marginTop: 4,
  },
  mockRef: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
  },
  channelBtnActive: {
    backgroundColor: colors.gradientMid,
    borderColor: colors.gradientMid,
  },
  channelBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  channelBtnTextActive: {
    color: '#FFFFFF',
  },
  mockHint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    marginTop: 12,
    fontStyle: 'italic',
  },
  mockCancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  mockCancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  verifyingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  verifyingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gradientMid,
  },

  // Success Screen Styles
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 24,
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  receiptValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  monoText: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
  },
  paidPill: {
    backgroundColor: colors.goodSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  paidPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.good,
  },
  testHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 8,
  },
  testHintText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  momoCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  momoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  momoTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#0369A1',
  },
  momoBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  momoBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  momoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: '#0369A1',
    textTransform: 'uppercase',
  },
  momoInput: {
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    borderRadius: radius.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.monoSemiBold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 10,
  },
  paystackWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    marginTop: 4,
  },
  paystackWebText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  momoPromptBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});