import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useApi } from '../api/client';
import ApiSettingsBanner from '../components/ApiSettingsBanner';
import OrderTicket from '../components/OrderTicket';
import NewOrderModal from '../components/NewOrderModal';
import PaymentModal from '../components/PaymentModal';
import { colors, fonts } from '../theme';

export default function OrdersScreen() {
  const { api } = useApi();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);

  const loadAll = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const [ordersRes, customersRes] = await Promise.all([api.listOrders(), api.listCustomers()]);

        const withPaid = await Promise.all(
          ordersRes.map(async (o) => {
            try {
              const payments = await api.getPayments(o.id);
              const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
              return { ...o, _paid: paid };
            } catch {
              return { ...o, _paid: 0 };
            }
          })
        );

        setOrders(withPaid.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setCustomers(customersRes);
      } catch (err) {
        setError(err.message);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [api]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreate = async (payload) => {
    await api.createOrder(payload);
    setShowForm(false);
    await loadAll();
  };

  const handleAdvance = async (order, status) => {
    setError('');
    try {
      await api.updateOrderStatus(order.id, status);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (payload) => {
    await api.recordPayment(paymentOrder.id, payload);
    await loadAll();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Tickets, stamped as they move through the shop.</Text>
        </View>
        <Pressable style={styles.newBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.newBtnText}>+ New</Text>
        </Pressable>
      </View>

      <ApiSettingsBanner />

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {orders.length === 0 && customers.length === 0
                  ? 'No customers yet — add one on the Customers tab, then create your first order.'
                  : 'No orders yet. Tap "+ New" to create one.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <OrderTicket order={item} onAdvance={handleAdvance} onOpenPayment={setPaymentOrder} />
        )}
      />

      <NewOrderModal
        visible={showForm}
        customers={customers}
        onClose={() => setShowForm(false)}
        onCreate={handleCreate}
      />

      <PaymentModal order={paymentOrder} onClose={() => setPaymentOrder(null)} onSubmit={handlePayment} />
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
    maxWidth: 240,
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
  errorBanner: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
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
    textAlign: 'center',
  },
});
