import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useApi } from '../api/client';
import { colors, fonts, radius } from '../theme';

export default function HomeScreen() {
  const { user, logout } = useApi();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>You're logged in</Text>
      <Text style={styles.subtitle}>This is a placeholder landing screen.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Name</Text>
        <Text style={styles.cardValue}>{user?.fullName}</Text>
        <Text style={styles.cardLabel}>Email</Text>
        <Text style={styles.cardValue}>{user?.email}</Text>
        <Text style={styles.cardLabel}>Account type</Text>
        <Text style={styles.cardValue}>
          {user?.role === 'LAUNDRY_OWNER' ? 'Laundry owner' : 'Customer'}
        </Text>
      </View>

      <View style={styles.nextBox}>
        <Text style={styles.nextTitle}>Coming next, once you send your UI</Text>
        <Text style={styles.nextItem}>
          {user?.role === 'LAUNDRY_OWNER'
            ? '• Register/manage your laundry business (hours, delivery, location)\n• View & update incoming bookings'
            : '• Browse laundry businesses with map + ratings\n• Book a laundry, choose delivery or pickup\n• Leave reviews'}
        </Text>
        <Text style={styles.nextItem}>• Notifications inbox{'\n'}• Settings (change password, privacy policy, terms, delete account)</Text>
      </View>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginTop: 10,
  },
  cardValue: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
  },
  nextBox: {
    backgroundColor: colors.warnSoft,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 24,
  },
  nextTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.warnInk,
    marginBottom: 8,
  },
  nextItem: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.warnInk,
    lineHeight: 19,
    marginBottom: 6,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.alert,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.alert,
  },
});
