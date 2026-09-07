import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApi } from '../api/client';
import AuthBackground from '../components/AuthBackground';
import IconPillInput from '../components/IconPillInput';
import GradientButton from '../components/GradientButton';
import CheckRow from '../components/CheckRow';
import SlideFadeIn from '../components/SlideFadeIn';
import { colors, fonts, radius } from '../theme';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'LAUNDRY_OWNER', label: 'Laundry Owner' },
];

export default function SignupScreen({ onGoToLogin }) {
  const { api } = useApi();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!fullName || !email || !password) {
      setError('Fill in your name, email, and password.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setSubmitting(true);
    try {
      await api.signup({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        role,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SlideFadeIn direction="right">
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Book laundry services, or list your own business</Text>

            <View style={styles.roleRow}>
              {ROLES.map((r) => {
                const active = r.value === role;
                return (
                  <Pressable key={r.value} style={styles.roleWrap} onPress={() => setRole(r.value)}>
                    {active ? (
                      <LinearGradient
                        colors={[colors.gradientTop, colors.gradientMid]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.rolePill}
                      >
                        <Text style={styles.roleTextActive}>{r.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.rolePill, styles.rolePillInactive]}>
                        <Text style={styles.roleText}>{r.label}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.form}>
              <IconPillInput icon="person-outline" placeholder="Full name" value={fullName} onChangeText={setFullName} />
              <IconPillInput
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              <IconPillInput
                icon="call-outline"
                placeholder="Phone number (optional)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <IconPillInput
                icon="lock-closed-outline"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <CheckRow
                checked={agreed}
                onToggle={() => setAgreed((v) => !v)}
                label="I agree to the Terms & Privacy Policy"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <GradientButton
                label={submitting ? 'Creating account…' : 'Sign Up'}
                onPress={handleSignup}
                disabled={submitting}
                style={{ marginTop: 22 }}
              />

              <Pressable style={styles.switchLink} onPress={onGoToLogin}>
                <Text style={styles.switchLinkText}>
                  Already have an account? <Text style={styles.switchLinkAccent}>Log in</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SlideFadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: '30%',
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: 20,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  roleWrap: {
    flex: 1,
  },
  rolePill: {
    borderRadius: radius.pill,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillInactive: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  roleTextActive: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#fff',
  },
  form: {
    marginTop: 4,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchLinkText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  switchLinkAccent: {
    fontFamily: fonts.bodySemiBold,
    color: colors.gradientMid,
  },
});
