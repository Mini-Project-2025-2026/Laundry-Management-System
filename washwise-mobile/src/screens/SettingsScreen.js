import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useApi } from '../api/client';
import SettingsRow from '../components/SettingsRow';
import ApiSettingsBanner from '../components/ApiSettingsBanner';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import LegalTextModal from '../components/LegalTextModal';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, TERMS_OF_USE } from '../legalContent';
import { colors, fonts, radius, shadows } from '../theme';

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
            <View style={[styles.roleChip, user?.role === 'LAUNDRY_OWNER' ? styles.roleChipOwner : styles.roleChipCustomer]}>
              <Text style={[styles.roleChipText, user?.role === 'LAUNDRY_OWNER' ? styles.roleChipTextOwner : styles.roleChipTextCustomer]}>
                {user?.role === 'LAUNDRY_OWNER' ? '👑 Laundry Shop Owner' : '🧺 Customer Account'}
              </Text>
            </View>
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

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>WashWise v1.0.0 · Smart Laundry Platform</Text>
          <Text style={styles.versionSubtext}>Final Year Project · Academic Year 2025/2026</Text>
        </View>
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
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 22,
    ...shadows.card,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    ...shadows.sm,
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: '#FFFFFF',
  },
  profileName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15.5,
    color: colors.ink,
  },
  profileEmail: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 1,
  },
  roleChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 6,
  },
  roleChipCustomer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleChipOwner: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  roleChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
  },
  roleChipTextCustomer: {
    color: '#047857',
  },
  roleChipTextOwner: {
    color: '#0369A1',
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
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    marginBottom: 22,
    ...shadows.sm,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    gap: 4,
  },
  versionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  versionSubtext: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.inkMuted || '#94A3B8',
  },
});
