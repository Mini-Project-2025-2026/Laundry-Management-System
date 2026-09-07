import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useApi } from '../api/client';
import { colors, fonts, radius } from '../theme';

function titleCase(str) {
  return str.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
}

export default function PricingScreen() {
  const { api } = useApi();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listPriceList()
      .then(setPrices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Price list</Text>
      <Text style={styles.subtitle}>What each garment costs per service — orders price themselves from this.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={prices}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No prices configured yet.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.garment}>{titleCase(item.garmentType)}</Text>
              <Text style={styles.service}>{titleCase(item.serviceType)}</Text>
            </View>
            <Text style={styles.price}>GHS {Number(item.price).toFixed(2)}</Text>
          </View>
        )}
      />

      <Text style={styles.footnote}>
        To add or change prices, use the API's{' '}
        <Text style={styles.mono}>POST /api/price-list</Text> endpoint — an editable screen for this
        is a natural next addition.
      </Text>
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
    marginBottom: 14,
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
  garment: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  service: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.steelDark,
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
  footnote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    paddingVertical: 12,
  },
  mono: {
    fontFamily: fonts.monoRegular,
  },
});
