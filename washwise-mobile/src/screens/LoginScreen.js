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
import { useApi } from '../api/client';
import AuthBackground from '../components/AuthBackground';
import IconPillInput from '../components/IconPillInput';
import GradientButton from '../components/GradientButton';
import CheckRow from '../components/CheckRow';
import SlideFadeIn from '../components/SlideFadeIn';
import ApiSettingsBanner from '../components/ApiSettingsBanner';
import { colors, fonts, radius } from '../theme';

export default function LoginScreen({ onGoToSignup }) {
  const { api } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await api.login({ email: email.trim(), password });
      // On success, ApiProvider stores the token/user — App.js reacts to
      // that and switches away from the auth screens automatically.
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SlideFadeIn direction="left">
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to book or manage a laundry service</Text>

            <View style={styles.form}>
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
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View style={styles.rowBetween}>
                <CheckRow checked={rememberMe} onToggle={() => setRememberMe((v) => !v)} label="Remember me" />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <GradientButton
                label={submitting ? 'Logging in…' : 'Login'}
                onPress={handleLogin}
                disabled={submitting}
                style={{ marginTop: 26 }}
              />

              <Pressable style={styles.switchLink} onPress={onGoToSignup}>
                <Text style={styles.switchLinkText}>
                  Don't have an account? <Text style={styles.switchLinkAccent}>Sign up</Text>
                </Text>
              </Pressable>

              <ApiSettingsBanner />

              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>Quick Demo Sign-In (Tap to fill)</Text>
                <View style={styles.demoBtnRow}>
                  <Pressable
                    style={styles.demoBtn}
                    onPress={() => {
                      setEmail('customer@demo.com');
                      setPassword('password123');
                    }}
                  >
                    <Text style={styles.demoBtnTitle}>Customer Demo</Text>
                    <Text style={styles.demoBtnSub}>customer@demo.com (Order Laundry)</Text>
                  </Pressable>

                  <Pressable
                    style={styles.demoBtn}
                    onPress={() => {
                      setEmail('owner@demo.com');
                      setPassword('password123');
                    }}
                  >
                    <Text style={styles.demoBtnTitle}>Laundry Owner Demo</Text>
                    <Text style={styles.demoBtnSub}>owner@demo.com (Manage Shop)</Text>
                  </Pressable>
                </View>
              </View>
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
    paddingTop: '34%',
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
    marginBottom: 28,
  },
  form: {
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  forgot: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gradientMid,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.alert,
    backgroundColor: colors.alertSoft,
    padding: 10,
    borderRadius: 10,
    marginTop: 16,
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
  demoBox: {
    marginTop: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
    borderRadius: radius.md,
  },
  demoTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.steelDark,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  demoBtnRow: {
    gap: 8,
  },
  demoBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    ...shadows.sm,
  },
  demoBtnTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.steelDark,
  },
  demoBtnSub: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
});
