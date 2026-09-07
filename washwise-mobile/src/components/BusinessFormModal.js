import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GradientButton from './GradientButton';
import { colors, fonts, radius } from '../theme';

const DAYS = [
  { value: 'MONDAY', label: 'Mon' },
  { value: 'TUESDAY', label: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wed' },
  { value: 'THURSDAY', label: 'Thu' },
  { value: 'FRIDAY', label: 'Fri' },
  { value: 'SATURDAY', label: 'Sat' },
  { value: 'SUNDAY', label: 'Sun' },
];

const STEP_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

function formatMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTimeToMinutes(timeStr, fallback) {
  if (!timeStr) return fallback;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Steps in 15-minute increments (no date/time-picker dependency needed).
function TimeStepper({ label, totalMinutes, onChange }) {
  const bump = (delta) => onChange((totalMinutes + delta + MINUTES_PER_DAY) % MINUTES_PER_DAY);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepperBtn} onPress={() => bump(-STEP_MINUTES)}>
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{formatMinutes(totalMinutes)}</Text>
        <Pressable style={styles.stepperBtn} onPress={() => bump(STEP_MINUTES)}>
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BusinessFormModal({ initial, onClose, onSubmit }) {
  const [businessName, setBusinessName] = useState(initial?.businessName ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [latitude, setLatitude] = useState(initial?.latitude != null ? String(initial.latitude) : '');
  const [longitude, setLongitude] = useState(initial?.longitude != null ? String(initial.longitude) : '');
  const [workingDays, setWorkingDays] = useState(new Set(initial?.workingDays ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']));
  const [openMinutes, setOpenMinutes] = useState(parseTimeToMinutes(initial?.openTime, 8 * 60));
  const [closeMinutes, setCloseMinutes] = useState(parseTimeToMinutes(initial?.closeTime, 20 * 60));
  const [offersDelivery, setOffersDelivery] = useState(initial?.offersDelivery ?? false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day) => {
    setWorkingDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (!businessName || !address) {
      setError('Business name and address are required.');
      return;
    }
    if (workingDays.size === 0) {
      setError('Select at least one working day.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        businessName: businessName.trim(),
        description: description.trim() || undefined,
        address: address.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        workingDays: Array.from(workingDays),
        openTime: `${formatMinutes(openMinutes)}:00`,
        closeTime: `${formatMinutes(closeMinutes)}:00`,
        offersDelivery,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>{initial ? 'Edit Business' : 'Register Business'}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Business name</Text>
          <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Sparkle Clean Laundry" />

          <Text style={[styles.label, { marginTop: 14 }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Fast, friendly laundry service…"
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="12 Adum Street, Kumasi" />

          <View style={[styles.row, { marginTop: 14 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Latitude (optional)</Text>
              <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numeric" placeholder="6.6885" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Longitude (optional)</Text>
              <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numeric" placeholder="-1.6244" />
            </View>
          </View>
          <Text style={styles.hint}>
            Used to plot your business on the map. Find these from any maps app (long-press a location to see coordinates).
          </Text>

          <Text style={[styles.label, { marginTop: 16 }]}>Working days</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const active = workingDays.has(d.value);
              return (
                <Pressable
                  key={d.value}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => toggleDay(d.value)}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.row, { marginTop: 16 }]}>
            <TimeStepper label="Opens" totalMinutes={openMinutes} onChange={setOpenMinutes} />
            <TimeStepper label="Closes" totalMinutes={closeMinutes} onChange={setCloseMinutes} />
          </View>
          <Text style={styles.hint}>Adjusts in 15-minute steps.</Text>

          <View style={styles.deliveryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Offers delivery</Text>
              <Text style={styles.hint}>Let customers choose delivery instead of pickup</Text>
            </View>
            <Switch
              value={offersDelivery}
              onValueChange={setOffersDelivery}
              trackColor={{ true: colors.gradientMid, false: colors.line }}
              thumbColor="#fff"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GradientButton
            label={submitting ? 'Saving…' : initial ? 'Save Changes' : 'Register Business'}
            onPress={handleSubmit}
            disabled={submitting}
            style={{ marginTop: 22 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.ink,
  },
  close: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gradientMid,
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
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.panel,
    color: colors.ink,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 6,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  dayChipActive: {
    backgroundColor: colors.gradientMid,
    borderColor: colors.gradientMid,
  },
  dayChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  dayChipTextActive: {
    color: '#fff',
    fontFamily: fonts.bodySemiBold,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  stepperValue: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.ink,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginTop: 16,
  },
});
