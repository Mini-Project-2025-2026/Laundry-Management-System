import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../api/client';
import StatBar from '../components/StatBar';
import OwnerBusinessCard from '../components/OwnerBusinessCard';
import BusinessFormModal from '../components/BusinessFormModal';
import { darkColors, fonts, radius } from '../theme';

export default function MyBusinessScreen() {
  const { api } = useApi();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [formTarget, setFormTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setBusinesses(await api.getMyBusinesses());
    } catch (err) {
      setError(err.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setFormTarget(null);
    setShowForm(true);
  };

  const openEdit = (business) => {
    setFormTarget(business);
    setShowForm(true);
  };

  const handleSave = async (payload) => {
    if (formTarget) {
      await api.updateBusiness(formTarget.id, payload);
    } else {
      await api.registerBusiness(payload);
    }
    await load();
  };

  const totalBookings = businesses.reduce((sum, b) => sum + b.totalBookings, 0);
  const totalReviews = businesses.reduce((sum, b) => sum + b.reviewCount, 0);
  const avgRating = businesses.length
    ? (businesses.reduce((sum, b) => sum + b.averageRating, 0) / businesses.length).toFixed(1)
    : '—';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Business</Text>
          <Text style={styles.subtitle}>Manage your laundry listings</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openNew}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      <StatBar
        stats={[
          { icon: 'storefront-outline', value: businesses.length, label: 'Businesses' },
          { icon: 'receipt-outline', value: totalBookings, label: 'Bookings' },
          { icon: 'star-outline', value: avgRating, label: 'Avg Rating' },
          { icon: 'chatbubble-ellipses-outline', value: totalReviews, label: 'Reviews' },
        ]}
      />

      <View style={{ height: 16 }} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={businesses}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={darkColors.accent} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                You haven't registered a laundry business yet. Tap "Add" to get listed.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <OwnerBusinessCard business={item} onPress={() => openEdit(item)} />}
      />

      {showForm && (
        <BusinessFormModal
          initial={formTarget}
          onClose={() => setShowForm(false)}
          onSubmit={handleSave}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: darkColors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: darkColors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: darkColors.accent,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  addBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#fff',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: darkColors.alert,
    backgroundColor: darkColors.alertSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  empty: {
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: darkColors.textMuted,
    textAlign: 'center',
  },
});
