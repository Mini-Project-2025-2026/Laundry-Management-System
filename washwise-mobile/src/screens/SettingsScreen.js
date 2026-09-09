import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useApi } from '../api/client';
import SettingsRow from '../components/SettingsRow';
import ApiSettingsBanner from '../components/ApiSettingsBanner';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import LegalTextModal from '../components/LegalTextModal';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, TERMS_OF_USE } from '../legalContent';
import { colors, fonts, radius } from '../theme';

export default function SettingsScreen() {
  const { api, user, logout } = useApi();
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'delete' | 'privacy' | 'terms-service' | 'terms-use'

  const close = () => setActiveModal(null);

  const handleDelete = async () => {
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      Alert.alert('Delete Account Failed', err.message || 'An error occurred while deleting your account.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.fullName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.fullName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>
              {user?.role === 'LAUNDRY_OWNER' ? 'Laundry owner account' : 'Customer account'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow icon="lock-closed-outline" label="Change Password" onPress={() => setActiveModal('password')} />
          <SettingsRow icon="log-out-outline" label="Log Out" onPress={logout} />
          <SettingsRow icon="trash-outline" label="Delete Account" danger onPress={() => setActiveModal('delete')} last />
        </View>

        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.section}>
          <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => setActiveModal('privacy')} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => setActiveModal('terms-service')} />
          <SettingsRow icon="reader-outline" label="Terms of Use" onPress={() => setActiveModal('terms-use')} last />
        </View>

        <Text style={styles.sectionLabel}>Backend connection</Text>
        <ApiSettingsBanner />
      </ScrollView>

      {activeModal === 'password' && (
        <ChangePasswordModal onClose={close} onSubmit={(payload) => api.changePassword(payload)} />
      )}
      {activeModal === 'delete' && <DeleteAccountModal onClose={close} onConfirm={handleDelete} />}
      {activeModal === 'privacy' && (
        <LegalTextModal title="Privacy Policy" paragraphs={PRIVACY_POLICY} onClose={close} />
      )}
      {activeModal === 'terms-service' && (
        <LegalTextModal title="Terms of Service" paragraphs={TERMS_OF_SERVICE} onClose={close} />
      )}
      {activeModal === 'terms-use' && (
        <LegalTextModal title="Terms of Use" paragraphs={TERMS_OF_USE} onClose={close} />
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
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 22,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gradientMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: '#fff',
  },
  profileName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  profileEmail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 1,
  },
  profileRole: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: colors.gradientMid,
    marginTop: 3,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  section: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
});
