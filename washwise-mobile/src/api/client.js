import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL_KEY = 'laundryTicket:apiBaseUrl';
const TOKEN_KEY = 'laundryTicket:authToken';
const USER_KEY = 'laundryTicket:authUser';

function resolveDefaultBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080/api`;
    }
  }
  return 'http://localhost:8080/api';
}

const DEFAULT_BASE_URL = resolveDefaultBaseUrl();

const ApiContext = createContext(null);

async function request(baseUrl, path, options = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
      if (body.fieldErrors) {
        message = Object.values(body.fieldErrors).join(', ');
      }
    } catch {
      // no JSON body
    }
    if ((res.status === 401 || res.status === 403) && (!message || message.includes('failed') || message === 'Forbidden')) {
      message = 'Your session has expired. Please log out in Settings and sign in again.';
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function ApiProvider({ children }) {
  const [baseUrl, setBaseUrlState] = useState(DEFAULT_BASE_URL);
  const [token, setTokenState] = useState(null);
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BASE_URL_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ])
      .then(([savedBaseUrl, savedToken, savedUser]) => {
        if (savedBaseUrl && (!savedBaseUrl.includes('localhost') || resolveDefaultBaseUrl().includes('localhost'))) {
          setBaseUrlState(savedBaseUrl);
        } else {
          setBaseUrlState(resolveDefaultBaseUrl());
        }
        if (savedToken) setTokenState(savedToken);
        if (savedUser) setUserState(JSON.parse(savedUser));
      })
      .finally(() => setReady(true));
  }, []);

  const setBaseUrl = useCallback((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    setBaseUrlState(trimmed);
    AsyncStorage.setItem(BASE_URL_KEY, trimmed).catch(() => {});
  }, []);

  const persistSession = useCallback((authResponse) => {
    const { token: newToken, ...userInfo } = authResponse;
    setTokenState(newToken);
    setUserState(userInfo);
    AsyncStorage.setItem(TOKEN_KEY, newToken).catch(() => {});
    AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo)).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setUserState(null);
    AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]).catch(() => {});
  }, []);

  const api = useMemo(
    () => ({
      // Auth
      signup: async (payload) => {
        const res = await request(baseUrl, '/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
        persistSession(res);
        return res;
      },
      login: async (payload) => {
        const res = await request(baseUrl, '/auth/login', { method: 'POST', body: JSON.stringify(payload) });
        persistSession(res);
        return res;
      },
      getMe: () => request(baseUrl, '/auth/me', {}, token),
      changePassword: (payload) =>
        request(baseUrl, '/auth/change-password', { method: 'PATCH', body: JSON.stringify(payload) }, token),
      deleteAccount: () => request(baseUrl, '/auth/me', { method: 'DELETE' }, token),
      registerPushToken: (pushToken) =>
        request(baseUrl, '/auth/push-token', { method: 'PATCH', body: JSON.stringify({ token: pushToken }) }, token),
      logout,

      // Customers (original counter/staff flow)
      listCustomers: (search) =>
        request(baseUrl, `/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
      createCustomer: (payload) =>
        request(baseUrl, '/customers', { method: 'POST', body: JSON.stringify(payload) }),

      // Orders (original counter/staff flow)
      listOrders: () => request(baseUrl, '/orders'),
      createOrder: (payload) => request(baseUrl, '/orders', { method: 'POST', body: JSON.stringify(payload) }),
      updateOrderStatus: (id, status) =>
        request(baseUrl, `/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

      // Payments (original counter/staff flow)
      recordPayment: (orderId, payload) =>
        request(baseUrl, `/orders/${orderId}/payments`, { method: 'POST', body: JSON.stringify(payload) }),
      getPayments: (orderId) => request(baseUrl, `/orders/${orderId}/payments`),

      // Pricing (original counter/staff flow)
      listPriceList: () => request(baseUrl, '/price-list'),

      // Marketplace: laundry businesses
      listBusinesses: (search) =>
        request(baseUrl, `/laundry-businesses${search ? `?search=${encodeURIComponent(search)}` : ''}`),
      getBusiness: (id) => request(baseUrl, `/laundry-businesses/${id}`),
      getMyBusinesses: () => request(baseUrl, '/laundry-businesses/mine', {}, token),
      registerBusiness: (payload) =>
        request(baseUrl, '/laundry-businesses', { method: 'POST', body: JSON.stringify(payload) }, token),
      updateBusiness: (id, payload) =>
        request(baseUrl, `/laundry-businesses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),

      // Marketplace: reviews
      getReviews: (businessId) => request(baseUrl, `/laundry-businesses/${businessId}/reviews`),
      submitReview: (businessId, payload) =>
        request(baseUrl, `/laundry-businesses/${businessId}/reviews`, { method: 'POST', body: JSON.stringify(payload) }, token),

      // Marketplace: bookings
      createBooking: (payload) =>
        request(baseUrl, '/bookings', { method: 'POST', body: JSON.stringify(payload) }, token),
      getMyBookings: () => request(baseUrl, '/bookings/mine', {}, token),
      getBusinessBookings: (businessId) => request(baseUrl, `/bookings/business/${businessId}`, {}, token),
      getOwnerBookings: () => request(baseUrl, '/bookings/owner/mine', {}, token),
      updateBookingStatus: (id, status) =>
        request(baseUrl, `/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
      initializePaystackPayment: (bookingId, amount, mock = false) =>
        request(baseUrl, '/payments/paystack/initialize', {
          method: 'POST',
          body: JSON.stringify({ bookingId, amount: Number(amount), mock }),
        }, token),
      verifyPaystackPayment: (reference) =>
        request(baseUrl, '/payments/paystack/verify', {
          method: 'POST',
          body: JSON.stringify({ reference }),
        }, token),

      // Marketplace: notifications
      getMyNotifications: () => request(baseUrl, '/notifications/mine', {}, token),
      getUnreadNotificationCount: () => request(baseUrl, '/notifications/mine/unread-count', {}, token),
      markNotificationRead: (id) => request(baseUrl, `/notifications/${id}/read`, { method: 'PATCH' }, token),
    }),
    [baseUrl, token, persistSession, logout]
  );

  return (
    <ApiContext.Provider value={{ baseUrl, setBaseUrl, api, ready, token, user, logout }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within an ApiProvider');
  return ctx;
}
