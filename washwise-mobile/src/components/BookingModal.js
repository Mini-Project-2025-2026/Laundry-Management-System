import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

export default function BookingModal({ business, onClose, onSubmit }) {
  const [deliveryRequested, setDeliveryRequested] = useState(business.offersDelivery);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ laundryBusinessId: business.id, deliveryRequested, notes });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Book {business.businessName}</Text>
          <Text style={styles.subtitle}>{business.address}</Text>

          <Text style={styles.label}>Delivery</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.option, deliveryRequested && styles.optionActive]}
              onPress={() => setDeliveryRequested(true)}
              disabled={!business.offersDelivery}
            >
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={deliveryRequested ? '#fff' : colors.inkSoft}
              />
              <Text style={[styles.optionText, deliveryRequested && styles.optionTextActive]}>
                Deliver to me
              </Text>
            </Pressable>
            <Pressable
              style={[styles.option, !deliveryRequested && styles.optionActive]}
              onPress={() => setDeliveryRequested(false)}
            >
              <Ionicons
                name="walk-outline"
                size={18}
                color={!deliveryRequested ? '#fff' : colors.inkSoft}
              />
              <Text style={[styles.optionText, !deliveryRequested && styles.optionTextActive]}>
                I'll pick up
              </Text>
            </Pressable>
          </View>
          {!business.offersDelivery && (
            <Text style={styles.hint}>This business doesn't offer delivery — pickup only.</Text>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Notes for the laundry (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. 2 loads of shirts, 1 duvet, please separate colors"
            placeholderTextColor={colors.inkSoft}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton
            label={submitting ? 'Booking…' : 'Confirm Booking'}
            onPress={handleSubmit}
            disabled={submitting}
            style={{ marginTop: 18 }}
          />
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,26,33,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
    marginBottom: 18,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  optionActive: {
    backgroundColor: colors.gradientMid,
    borderColor: colors.gradientMid,
  },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  optionTextActive: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    marginTop: 6,
  },
  textArea: {
    fontFamily: fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
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
  cancelBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  cancelText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
});
