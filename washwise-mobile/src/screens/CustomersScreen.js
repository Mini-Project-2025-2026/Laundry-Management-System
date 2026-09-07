import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useApi } from '../api/client';
import { colors, fonts, radius } from '../theme';

const emptyForm = { fullName: '', phoneNumber: '', email: '', address: '' };

export default function CustomersScreen() {
  const { api } = useApi();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    async (keyword, isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        setCustomers(await api.listCustomers(keyword));
      } catch (err) {
        setError(err.message);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleRegister = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.createCustomer(form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>Registration, search, and loyalty points.</Text>
        </View>
        <Pressable style={styles.newBtn} onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.newBtnText}>{showForm ? 'Close' : '+ New'}</Text>
        </Pressable>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={form.fullName}
            onChangeText={(v) => setForm({ ...form, fullName: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(v) => setForm({ ...form, phoneNumber: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Address (optional)"
            value={form.address}
            onChangeText={(v) => setForm({ ...form, address: v })}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={[styles.registerBtn, submitting && styles.disabled]}
            disabled={submitting || !form.fullName || !form.phoneNumber}
            onPress={handleRegister}
          >
            <Text style={styles.registerBtnText}>{submitting ? 'Registering…' : 'Register customer'}</Text>
          </Pressable>
        </View>
      )}

      <TextInput
        style={styles.search}
        placeholder="Search by name, phone, or email…"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(search)}
        returnKeyType="search"
      />

      {!showForm && error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={customers}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(search, true)} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No customers found.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.meta}>{item.phoneNumber}{item.email ? ` · ${item.email}` : ''}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsValue}>{item.loyaltyPoints}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  newBtn: {
    backgroundColor: colors.stamp,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  newBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.stampInk,
  },
  formCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: colors.paper,
    color: colors.ink,
  },
  registerBtn: {
    backgroundColor: colors.stamp,
    paddingVertical: 11,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: 2,
  },
  disabled: { opacity: 0.5 },
  registerBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    color: colors.stampInk,
  },
  search: {
    fontFamily: fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: colors.panel,
    marginBottom: 12,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  pointsBadge: {
    alignItems: 'center',
    backgroundColor: colors.warnSoft,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pointsValue: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.warnInk,
  },
  pointsLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.warnInk,
    textTransform: 'uppercase',
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
});
