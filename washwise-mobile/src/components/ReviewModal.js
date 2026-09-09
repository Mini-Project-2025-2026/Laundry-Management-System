import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Sparkles, CheckCircle2, Clock, Tag, Bike } from 'lucide-react-native';
import RatingStars from './RatingStars';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

const FACTORS = [
  { key: 'cleanliness', label: 'Cleanliness & hygiene', icon: Sparkles },
  { key: 'accuracy', label: 'Accuracy of order', icon: CheckCircle2 },
  { key: 'qualityAndTimeliness', label: 'Quality & timeliness', icon: Clock },
  { key: 'pricingFairness', label: 'Fair, transparent pricing', icon: Tag },
  { key: 'pickupDeliveryConvenience', label: 'Pickup/delivery convenience', icon: Bike },
];

export default function ReviewModal({ business, onClose, onSubmit }) {
  const [overall, setOverall] = useState(5);
  const [factors, setFactors] = useState({});
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setFactor = (key, val) => setFactors((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ overall, ...factors, comment });
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Rate {business.businessName}</Text>
            <Text style={styles.subtitle}>How was your laundry experience?</Text>

            <View style={styles.overallRow}>
              <RatingStars value={overall} size={32} spacing={6} onChange={setOverall} />
            </View>

            {FACTORS.map((f) => {
              const IconComp = f.icon;
              return (
                <View key={f.key} style={styles.factorRow}>
                  <View style={styles.factorLeft}>
                    <IconComp size={14} color={colors.gradientMid} strokeWidth={2} />
                    <Text style={styles.factorLabel}>{f.label}</Text>
                  </View>
                  <RatingStars
                    value={factors[f.key] ?? 0}
                    size={17}
                    spacing={3}
                    onChange={(v) => setFactor(f.key, v)}
                  />
                </View>
              );
            })}

            <Text style={[styles.label, { marginTop: 14 }]}>Comment (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell other customers what stood out…"
              placeholderTextColor={colors.inkSoft}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton
              label={submitting ? 'Submitting…' : 'Submit Review'}
              onPress={handleSubmit}
              disabled={submitting}
              style={{ marginTop: 18 }}
            />
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Not now</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 22,
    paddingBottom: 34,
    maxHeight: '85%',
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
  },
  overallRow: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  factorLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginBottom: 8,
  },
  textArea: {
    fontFamily: fonts.body,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 12,
    minHeight: 70,
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
