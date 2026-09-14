import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { ArrowLeft, Search, List as ListIcon, MapPin, Star, Bike, ChevronRight, X } from 'lucide-react-native';
import { useApi } from '../api/client';
import { getCurrentLocation, distanceKm, formatDistance } from '../geo';
import HomeHeader from '../components/HomeHeader';
import ServicesRow from '../components/ServicesRow';
import PromoBanner from '../components/PromoBanner';
import SectionHeader from '../components/SectionHeader';
import BusinessCard from '../components/BusinessCard';
import BusinessDetailScreen from './BusinessDetailScreen';
import MapView from '../components/MapView';
import { colors, fonts, radius, shadows } from '../theme';

const QUICK_FILTERS = [
  { key: 'ALL', label: '✨ All' },
  { key: 'DELIVERY', label: '🚴 Free Pickup' },
  { key: 'RATED', label: '⭐ Top Rated (4.5+)' },
  { key: 'WASH', label: '🧺 Wash & Fold', keyword: 'Wash' },
  { key: 'IRON', label: '💨 Steam Iron', keyword: 'Iron' },
  { key: 'DRYCLEAN', label: '✨ Dry Clean', keyword: 'Dry Clean' },
];

export default function ExploreScreen({ onOpenNotifications, onOpenBookings, unreadCount = 0 }) {
  const { api, user } = useApi();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState('home'); // 'home' | 'browse'
  const [viewType, setViewType] = useState('list'); // 'list' | 'map'
  const [selectedMapBusiness, setSelectedMapBusiness] = useState(null);
  const [location, setLocation] = useState(null); // { latitude, longitude, label }

  const load = useCallback(
    async (keyword, isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const list = await api.listBusinesses(keyword);
        setBusinesses(list);
        if (list.length > 0 && !selectedMapBusiness) {
          setSelectedMapBusiness(list[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [api, selectedMapBusiness]
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
      let rawKm = 9999;
      if (location && b.latitude != null && b.longitude != null) {
        rawKm = distanceKm(location.latitude, location.longitude, b.latitude, b.longitude);
        distanceLabel = formatDistance(rawKm);
      }
      return { ...b, _distanceLabel: distanceLabel, _rawKm: rawKm };
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

  const filteredBusinesses = useMemo(() => {
    return businessesWithDistance.filter((b) => {
      if (activeFilter === 'DELIVERY') return b.offersDelivery;
      if (activeFilter === 'RATED') return Number(b.averageRating || 0) >= 4.5;
      return true;
    });
  }, [businessesWithDistance, activeFilter]);

  const activeMapShop = selectedMapBusiness || filteredBusinesses[0] || businessesWithDistance[0];

  return (
    <View style={styles.screen}>
      <HomeHeader
        userName={user?.fullName}
        locationLabel={location?.label ?? 'Kumasi, Ashanti'}
        unreadCount={unreadCount}
        onPressBell={onOpenNotifications}
        onPressBag={onOpenBookings}
      />

      <View style={styles.topControlRow}>
        <View style={styles.searchBox}>
          {mode === 'browse' && (
            <Pressable onPress={() => setMode('home')} hitSlop={6}>
              <ArrowLeft size={18} color={colors.ink} style={{ marginRight: 4 }} />
            </Pressable>
          )}
          <Search size={16} color={colors.inkSoft} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search laundries or areas…"
            placeholderTextColor={colors.inkMuted || colors.inkSoft}
            value={search}
            onChangeText={setSearch}
            onFocus={enterBrowse}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
          />
          {!!search && (
            <Pressable
              onPress={() => {
                setSearch('');
                setActiveFilter('ALL');
                load('');
              }}
              hitSlop={8}
            >
              <X size={15} color={colors.inkSoft} strokeWidth={2.2} />
            </Pressable>
          )}
        </View>

        {/* View Switcher: List vs Map */}
        <View style={styles.viewToggleGroup}>
          <Pressable
            style={[styles.viewToggleBtn, viewType === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewType('list')}
          >
            <ListIcon size={14} color={viewType === 'list' ? '#FFFFFF' : colors.inkSoft} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={[styles.viewToggleBtn, viewType === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setViewType('map')}
          >
            <MapPin size={14} color={viewType === 'map' ? '#FFFFFF' : colors.inkSoft} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {QUICK_FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => {
                  setActiveFilter(f.key);
                  if (f.keyword) {
                    setSearch(f.keyword);
                    setMode('browse');
                    load(f.keyword);
                  } else if (f.key === 'ALL') {
                    setSearch('');
                    load('');
                  }
                }}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Map View Mode */}
      {viewType === 'map' ? (
        <View style={styles.mapContainer}>
          <View style={styles.mapWrap}>
            <MapView
              businesses={businessesWithDistance}
              userLocation={location}
              selectedBusinessId={activeMapShop?.id}
              onSelectBusiness={(b) => setSelectedMapBusiness(b)}
              height="100%"
            />
          </View>

          {/* Floating Selected Laundry Card */}
          {activeMapShop && (
            <View style={styles.mapCardContainer}>
              <Pressable
                style={styles.mapShopCard}
                onPress={() => setSelectedId(activeMapShop.id)}
              >
                <View style={styles.mapShopInfo}>
                  <View style={styles.mapShopHead}>
                    <Text style={styles.mapShopName} numberOfLines={1}>
                      {activeMapShop.businessName}
                    </Text>
                    <View style={styles.mapRatingBadge}>
                      <Star size={11} color={colors.gradientMid} fill={colors.gradientMid} />
                      <Text style={styles.mapRatingText}>
                        {Number(activeMapShop.averageRating || 5.0).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.mapShopAddr} numberOfLines={1}>
                    {activeMapShop.address}
                  </Text>
                  <View style={styles.mapTagRow}>
                    {activeMapShop._distanceLabel && (
                      <View style={styles.mapDistTag}>
                        <MapPin size={10} color={colors.gradientMid} />
                        <Text style={styles.mapDistText}>{activeMapShop._distanceLabel}</Text>
                      </View>
                    )}
                    <View style={styles.mapDeliveryTag}>
                      <Bike size={10} color="#0369A1" />
                      <Text style={styles.mapDeliveryText}>
                        {activeMapShop.offersDelivery ? 'Pickup & Delivery' : 'Shop Dropoff'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mapBookBtn}>
                  <Text style={styles.mapBookBtnText}>Book</Text>
                  <ChevronRight size={14} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>
          )}
        </View>
      ) : mode === 'home' ? (
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
            {filteredBusinesses.length} laundry shop{filteredBusinesses.length === 1 ? '' : 's'}
            {search ? ` for "${search}"` : ' found'}
          </Text>
          <FlatList
            data={filteredBusinesses}
            keyExtractor={(b) => String(b.id)}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(search, true)} />}
            ListEmptyComponent={
              !loading && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>No laundries matched your filter. Try tapping '✨ All'.</Text>
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
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.ink,
  },
  filterScroll: {
    paddingVertical: 2,
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadows.sm,
  },
  filterPillActive: {
    backgroundColor: colors.brandDark,
    borderColor: colors.brandDark,
  },
  filterPillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bodySemiBold,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: colors.gradientMid,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 12,
    position: 'relative',
  },
  mapWrap: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  mapCardContainer: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    right: 8,
  },
  mapShopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapShopInfo: {
    flex: 1,
    marginRight: 10,
  },
  mapShopHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  mapShopName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  mapRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E0F2FE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
  },
  mapRatingText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.gradientMid,
  },
  mapShopAddr: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  mapTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapDistTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  mapDistText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: colors.gradientMid,
  },
  mapDeliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  mapDeliveryText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: '#0369A1',
  },
  mapBookBtn: {
    backgroundColor: colors.gradientMid,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  mapBookBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
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
