import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Shirt,
  Sparkles,
  Footprints,
  Bike,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react-native';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

const SERVICES = [
  { id: 'wash_fold', name: 'Wash & Fold', unit: 'load', price: 12.0 },
  { id: 'wash_iron', name: 'Wash & Steam Press', unit: 'load', price: 20.0 },
  { id: 'iron_only', name: 'Press / Ironing Only', unit: 'load', price: 10.0 },
  { id: 'duvet', name: 'Bedding & Duvets', unit: 'piece', price: 30.0 },
  { id: 'dry_clean', name: 'Delicates / Dry Clean', unit: 'piece', price: 25.0 },
];

export default function BookingModal({ business, userLocation, onClose, onSubmit }) {
  // Quantities for each service
  const [quantities, setQuantities] = useState({
    wash_fold: 1, // default 1 load
    wash_iron: 0,
    iron_only: 0,
    duvet: 0,
    dry_clean: 0,
  });

  // Stage 1: Dirty laundry handover (before wash)
  // 'CUSTOMER_DROPOFF' (Free ₵0) vs 'COURIER_PICKUP' (Distance fee)
  const [pickupType, setPickupType] = useState('CUSTOMER_DROPOFF');

  // Stage 2: Clean laundry handover (after wash)
  // 'CUSTOMER_PICKUP' (Free ₵0) vs 'COURIER_DELIVERY' (Distance fee)
  const [returnType, setReturnType] = useState(
    business?.offersDelivery ? 'COURIER_DELIVERY' : 'CUSTOMER_PICKUP'
  );

  const [address, setAddress] = useState(userLocation?.label || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute distance and courier delivery fees
  const distanceKm = useMemo(() => {
    if (
      userLocation?.latitude != null &&
      userLocation?.longitude != null &&
      business?.latitude != null &&
      business?.longitude != null
    ) {
      const R = 6371;
      const dLat = ((business.latitude - userLocation.latitude) * Math.PI) / 180;
      const dLon = ((business.longitude - userLocation.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.latitude * Math.PI) / 180) *
          Math.cos((business.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.max(1.0, Number((R * c).toFixed(1)));
    }
    return 2.5; // fallback default distance in km
  }, [userLocation, business]);

  // Fee calculation: Base ₵10.00 + ₵2.00/km (min ₵12.00)
  const oneWayCourierFee = useMemo(() => {
    return Math.max(12.0, Number((10.0 + distanceKm * 2.0).toFixed(2)));
  }, [distanceKm]);

  // Service subtotal
  const serviceSubtotal = useMemo(() => {
    return SERVICES.reduce((sum, item) => {
      const qty = quantities[item.id] || 0;
      return sum + qty * item.price;
    }, 0);
  }, [quantities]);

  const collectionFee = pickupType === 'COURIER_PICKUP' ? oneWayCourierFee : 0.0;
  const deliveryFee = returnType === 'COURIER_DELIVERY' ? oneWayCourierFee : 0.0;
  const totalAmount = serviceSubtotal + collectionFee + deliveryFee;

  const handleQtyChange = (serviceId, delta) => {
    setQuantities((prev) => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [serviceId]: next };
    });
  };

  const totalItemsCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    setError('');
    if (totalItemsCount === 0) {
      setError('Please select at least 1 laundry service or item.');
      return;
    }
    const needsAddress = pickupType === 'COURIER_PICKUP' || returnType === 'COURIER_DELIVERY';
    if (needsAddress && (!address || address.trim().length < 3)) {
      setError('Please enter your pickup / delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const summaryItems = SERVICES.filter((s) => quantities[s.id] > 0)
        .map((s) => `${quantities[s.id]}x ${s.name}`)
        .join(', ');

      const combinedNotes = [summaryItems, notes.trim()].filter(Boolean).join(' | ');

      await onSubmit({
        laundryBusinessId: business.id,
        deliveryRequested: pickupType === 'COURIER_PICKUP' || returnType === 'COURIER_DELIVERY',
        pickupType,
        returnType,
        serviceFee: serviceSubtotal,
        collectionFee,
        deliveryFee,
        totalAmount,
        deliveryAddress: needsAddress ? address.trim() : null,
        notes: combinedNotes,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Book Laundry Service</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {business.businessName} · {business.address}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Services Selection */}
            <View style={styles.sectionHeaderRow}>
              <Shirt size={16} color={colors.gradientMid} />
              <Text style={styles.sectionTitle}>1. Select Laundry Services</Text>
            </View>

            <View style={styles.serviceList}>
              {SERVICES.map((s) => {
                const qty = quantities[s.id] || 0;
                return (
                  <View key={s.id} style={[styles.serviceCard, qty > 0 && styles.serviceCardActive]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{s.name}</Text>
                      <Text style={styles.servicePrice}>
                        GHS {s.price.toFixed(2)} <Text style={styles.serviceUnit}>/ {s.unit}</Text>
                      </Text>
                    </View>

                    <View style={styles.stepper}>
                      <Pressable
                        style={[styles.stepBtn, qty === 0 && styles.stepBtnDisabled]}
                        onPress={() => handleQtyChange(s.id, -1)}
                        disabled={qty === 0}
                      >
                        <Minus size={13} color={qty === 0 ? colors.inkSoft : colors.ink} />
                      </Pressable>
                      <Text style={styles.stepCount}>{qty}</Text>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => handleQtyChange(s.id, 1)}
                      >
                        <Plus size={13} color={colors.ink} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 2. Collection Handover (Before Wash) */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <Footprints size={16} color={colors.gradientMid} />
              <Text style={styles.sectionTitle}>2. Collection: Dirty Laundry Handover</Text>
            </View>
            <Text style={styles.sectionHint}>
              How will the dirty laundry reach the laundry shop?
            </Text>

            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionCard,
                  pickupType === 'CUSTOMER_DROPOFF' && styles.optionCardActive,
                ]}
                onPress={() => setPickupType('CUSTOMER_DROPOFF')}
              >
                <View style={styles.optionHead}>
                  <Footprints
                    size={18}
                    color={pickupType === 'CUSTOMER_DROPOFF' ? colors.gradientMid : colors.inkSoft}
                  />
                  <Text
                    style={[
                      styles.optionPriceTag,
                      pickupType === 'CUSTOMER_DROPOFF' && styles.optionPriceTagActive,
                    ]}
                  >
                    FREE
                  </Text>
                </View>
                <Text style={styles.optionTitle}>I'll Drop It Off</Text>
                <Text style={styles.optionDesc}>
                  You bring dirty clothes directly to the shop counter.
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.optionCard,
                  pickupType === 'COURIER_PICKUP' && styles.optionCardActive,
                  !business.offersDelivery && styles.optionCardDisabled,
                ]}
                onPress={() => business.offersDelivery && setPickupType('COURIER_PICKUP')}
                disabled={!business.offersDelivery}
              >
                <View style={styles.optionHead}>
                  <Bike
                    size={18}
                    color={pickupType === 'COURIER_PICKUP' ? colors.gradientMid : colors.inkSoft}
                  />
                  <Text
                    style={[
                      styles.optionPriceTag,
                      pickupType === 'COURIER_PICKUP' && styles.optionPriceTagActive,
                    ]}
                  >
                    +GHS {oneWayCourierFee.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.optionTitle}>Courier Pickup</Text>
                <Text style={styles.optionDesc}>
                  Team dispatches a rider to collect from your address.
                </Text>
              </Pressable>
            </View>

            {/* 3. Return Handover (After Wash) */}
            <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
              <Bike size={16} color={colors.gradientMid} />
              <Text style={styles.sectionTitle}>3. Return: Clean Laundry Handover</Text>
            </View>
            <Text style={styles.sectionHint}>
              How do you want your clean, fresh clothes returned?
            </Text>

            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionCard,
                  returnType === 'CUSTOMER_PICKUP' && styles.optionCardActive,
                ]}
                onPress={() => setReturnType('CUSTOMER_PICKUP')}
              >
                <View style={styles.optionHead}>
                  <Footprints
                    size={18}
                    color={returnType === 'CUSTOMER_PICKUP' ? colors.gradientMid : colors.inkSoft}
                  />
                  <Text
                    style={[
                      styles.optionPriceTag,
                      returnType === 'CUSTOMER_PICKUP' && styles.optionPriceTagActive,
                    ]}
                  >
                    FREE
                  </Text>
                </View>
                <Text style={styles.optionTitle}>I'll Pick It Up</Text>
                <Text style={styles.optionDesc}>
                  Collect your packed laundry from the shop once ready.
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.optionCard,
                  returnType === 'COURIER_DELIVERY' && styles.optionCardActive,
                  !business.offersDelivery && styles.optionCardDisabled,
                ]}
                onPress={() => business.offersDelivery && setReturnType('COURIER_DELIVERY')}
                disabled={!business.offersDelivery}
              >
                <View style={styles.optionHead}>
                  <Bike
                    size={18}
                    color={returnType === 'COURIER_DELIVERY' ? colors.gradientMid : colors.inkSoft}
                  />
                  <Text
                    style={[
                      styles.optionPriceTag,
                      returnType === 'COURIER_DELIVERY' && styles.optionPriceTagActive,
                    ]}
                  >
                    +GHS {oneWayCourierFee.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.optionTitle}>Doorstep Delivery</Text>
                <Text style={styles.optionDesc}>
                  Clean laundry is delivered straight to your door.
                </Text>
              </Pressable>
            </View>

            {/* Address input if pickup or delivery is selected */}
            {(pickupType === 'COURIER_PICKUP' || returnType === 'COURIER_DELIVERY') && (
              <View style={styles.addressBox}>
                <View style={styles.addressBoxHead}>
                  <MapPin size={15} color={colors.gradientMid} />
                  <Text style={styles.inputLabel}>Your Pickup / Delivery Address</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Hall 4 Room 12, KNUST Campus or Santasi Roundabout"
                  placeholderTextColor={colors.inkSoft}
                  value={address}
                  onChangeText={setAddress}
                />
                <Text style={styles.distEstText}>
                  Estimated distance: ~{distanceKm} km (₵{oneWayCourierFee.toFixed(2)} per trip)
                </Text>
              </View>
            )}

            {/* Special notes */}
            <View style={{ marginTop: 18 }}>
              <Text style={styles.inputLabel}>Wash Instructions / Notes (optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Separate white fabrics, extra starch on shirts"
                placeholderTextColor={colors.inkSoft}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Price Breakdown Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Laundry Services ({totalItemsCount} items)</Text>
                <Text style={styles.summaryVal}>GHS {serviceSubtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Collection Handover ({pickupType === 'COURIER_PICKUP' ? 'Courier Pickup' : 'Customer Drop-off'})
                </Text>
                <Text style={styles.summaryVal}>
                  {collectionFee > 0 ? `GHS ${collectionFee.toFixed(2)}` : 'FREE'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Return Handover ({returnType === 'COURIER_DELIVERY' ? 'Doorstep Delivery' : 'Customer Pick-up'})
                </Text>
                <Text style={styles.summaryVal}>
                  {deliveryFee > 0 ? `GHS ${deliveryFee.toFixed(2)}` : 'FREE'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>GHS {totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color={colors.alert} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GradientButton
              label={
                submitting
                  ? 'Confirming Order…'
                  : `Confirm & Pay · GHS ${totalAmount.toFixed(2)}`
              }
              onPress={handleSubmit}
              disabled={submitting || totalItemsCount === 0}
              style={{ marginTop: 20 }}
            />

            <View style={styles.securityNote}>
              <ShieldCheck size={14} color={colors.gradientMid} />
              <Text style={styles.securityText}>
                Pay securely in app via Paystack (Mobile Money / Bank Card)
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '92%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gradientMid,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  serviceList: {
    gap: 8,
    marginTop: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serviceCardActive: {
    borderColor: colors.gradientMid,
    backgroundColor: '#F0F9FF',
  },
  serviceName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  servicePrice: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.gradientMid,
    marginTop: 2,
  },
  serviceUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
    minWidth: 22,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
  },
  optionCardActive: {
    borderColor: colors.gradientMid,
    backgroundColor: '#F0F9FF',
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionPriceTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.inkSoft,
    backgroundColor: colors.panel,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  optionPriceTagActive: {
    color: colors.gradientMid,
    backgroundColor: '#E0F2FE',
  },
  optionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 4,
  },
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    lineHeight: 15,
  },
  addressBox: {
    marginTop: 16,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: radius.md,
    padding: 12,
  },
  addressBoxHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  distEstText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.gradientMid,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    marginTop: 6,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginTop: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
  },
  summaryTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    flex: 1,
  },
  summaryVal: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  totalVal: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.gradientMid,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.alertSoft,
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 14,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.alert,
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  securityText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
});
