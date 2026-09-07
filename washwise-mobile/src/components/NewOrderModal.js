import { useState } from 'react';
import { Modal, View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import ChipSelect from './ChipSelect';
import { colors, fonts, radius } from '../theme';

const GARMENTS = ['SHIRT', 'TROUSER', 'SUIT', 'DRESS', 'BEDSHEET', 'CURTAIN', 'JACKET', 'TOWEL', 'OTHER'];
const SERVICES = ['WASH', 'DRY_CLEAN', 'IRON', 'WASH_AND_IRON', 'WASH_AND_FOLD'];

function titleCase(str) {
  return str.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
}

function emptyItem() {
  return { garmentType: 'SHIRT', serviceType: 'WASH', quantity: 1 };
}

export default function NewOrderModal({ visible, customers, onClose, onCreate }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? null);
  const [items, setItems] = useState([emptyItem()]);
  const [discountPercent, setDiscountPercent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const bumpQty = (index, delta) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
    );
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setItems([emptyItem()]);
    setDiscountPercent('');
    setError('');
  };

  const handleCreate = async () => {
    setError('');
    if (!customerId) {
      setError('Register a customer first, on the Customers tab.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        customerId,
        items,
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
      });
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New order</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Customer</Text>
          {customers.length === 0 ? (
            <Text style={styles.hint}>No customers yet — add one from the Customers tab first.</Text>
          ) : (
            <ChipSelect
              options={customers.map((c) => c.id)}
              value={customerId}
              onChange={setCustomerId}
              getLabel={(id) => customers.find((c) => c.id === id)?.fullName ?? id}
            />
          )}

          {items.map((item, i) => (
            <View key={i} style={styles.itemBlock}>
              <View style={styles.itemHeadRow}>
                <Text style={styles.itemTitle}>Item {i + 1}</Text>
                {items.length > 1 && (
                  <Pressable onPress={() => removeItem(i)}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.label}>Garment</Text>
              <ChipSelect
                options={GARMENTS}
                value={item.garmentType}
                onChange={(v) => updateItem(i, 'garmentType', v)}
                getLabel={titleCase}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Service</Text>
              <ChipSelect
                options={SERVICES}
                value={item.serviceType}
                onChange={(v) => updateItem(i, 'serviceType', v)}
                getLabel={titleCase}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Quantity</Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepperBtn} onPress={() => bumpQty(i, -1)}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{item.quantity}</Text>
                <Pressable style={styles.stepperBtn} onPress={() => bumpQty(i, 1)}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={styles.addItemBtn}
            onPress={() => setItems((prev) => [...prev, emptyItem()])}
          >
            <Text style={styles.addItemText}>+ Add another item</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 16 }]}>Discount % (optional)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
            value={discountPercent}
            onChangeText={setDiscountPercent}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.createBtn, submitting && styles.createBtnDisabled]}
            disabled={submitting || customers.length === 0}
            onPress={handleCreate}
          >
            <Text style={styles.createBtnText}>{submitting ? 'Creating…' : 'Create order'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  close: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.steelDark,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginBottom: 8,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginBottom: 16,
  },
  itemBlock: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
  },
  itemHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  remove: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: colors.alert,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  stepperBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.ink,
  },
  stepperValue: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.ink,
    minWidth: 24,
    textAlign: 'center',
  },
  addItemBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addItemText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.steelDark,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: colors.panel,
    color: colors.ink,
    maxWidth: 140,
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
  createBtn: {
    marginTop: 20,
    backgroundColor: colors.stamp,
    paddingVertical: 13,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    color: colors.stampInk,
  },
});
