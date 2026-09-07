import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../api/client';
import { getCurrentLocation, distanceKm, formatDistance } from '../geo';
import HomeHeader from '../components/HomeHeader';
import ServicesRow from '../components/ServicesRow';
import PromoBanner from '../components/PromoBanner';
import SectionHeader from '../components/SectionHeader';
import BusinessCard from '../components/BusinessCard';
import BusinessDetailScreen from './BusinessDetailScreen';
import { colors, fonts, radius } from '../theme';

export default function ExploreScreen({ onOpenNotifications, onOpenBookings, unreadCount = 0 }) {
  const { api, user } = useApi();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('home'); // 'home' | 'browse'
  const [location, setLocation] = useState(null); // { latitude, longitude, label }

  const load = useCallback(
    async (keyword, isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        setBusinesses(await api.listBusinesses(keyword));
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

  useEffect(() => {
    getCurrentLocation().then((loc) => {
      if (loc) setLocation(loc);
    });
  }, []);

  const businessesWithDistance = useMemo(() => {
    return businesses.map((b) => {
      let distanceLabel = null;
      if (location && b.latitude != null && b.longitude != null) {
        const km = distanceKm(location.latitude, location.longitude, b.latitude, b.longitude);
        distanceLabel = formatDistance(km);
      }
      return { ...b, _distanceLabel: distanceLabel };
    });
  }, [businesses, location]);

  const popularNearby = useMemo(
    () => [...businessesWithDistance].sort((a, b) => b.averageRating - a.averageRating).slice(0, 10),
    [businessesWithDistance]
  );

  if (selectedId) {
    return (
      <BusinessDetailScreen
        businessId={selectedId}
        onBack={() => setSelectedId(null)}
        onBooked={() => {}}
      />
    );
  }

  const handleServicePress = (label) => {
    setSearch(label);
    setMode('browse');
    load(label);
  };

  const enterBrowse = () => {
    setMode('browse');
  };

  const handleSubmitSearch = () => {
    setMode('browse');
    load(search);
  };

  return (
    <View style={styles.screen}>
      <HomeHeader
        userName={user?.fullName}
        locationLabel={location?.label ?? 'Kumasi, Ashanti'}
        unreadCount={unreadCount}
        onPressBell={onOpenNotifications}
        onPressBag={onOpenBookings}
      />

      <View style={styles.searchRow}>
        {mode === 'browse' && (
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.ink}
            style={{ marginRight: 4 }}
            onPress={() => setMode('home')}
          />
        )}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.inkSoft} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search laundries or areas…"
            placeholderTextColor={colors.inkSoft}
            value={search}
            onChangeText={setSearch}
            onFocus={enterBrowse}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode === 'home' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(search, true)} />}
        >
          <SectionHeader title="Services" actionLabel="View all" onPressAction={enterBrowse} />
          <ServicesRow onPressService={handleServicePress} />

          <View style={{ height: 16 }} />
          <PromoBanner />

          <View style={{ height: 18 }} />
          <SectionHeader title="Popular Laundry Nearby" onPressAction={enterBrowse} />
          <FlatList
            data={popularNearby}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(b) => String(b.id)}
            ListEmptyComponent={
              !loading && <Text style={styles.emptyText}>No laundries found yet.</Text>
            }
            renderItem={({ item }) => (
              <BusinessCard
                business={item}
                variant="wide"
                distanceLabel={item._distanceLabel}
                onPress={() => setSelectedId(item.id)}
              />
            )}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <>
          <Text style={styles.resultsCount}>
            {businessesWithDistance.length} laundry shop{businessesWithDistance.length === 1 ? '' : 's'}
            {search ? ` for "${search}"` : ' nearby'}
          </Text>
          <FlatList
            data={businessesWithDistance}
            keyExtractor={(b) => String(b.id)}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(search, true)} />}
            ListEmptyComponent={
              !loading && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No laundries found. Try a different search.</Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <BusinessCard
                business={item}
                variant="grid"
                distanceLabel={item._distanceLabel}
                onPress={() => setSelectedId(item.id)}
              />
            )}
          />
        </>
      )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.ink,
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
  resultsCount: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
