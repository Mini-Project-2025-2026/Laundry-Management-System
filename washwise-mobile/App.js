import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as NativeSplashScreen from 'expo-splash-screen';
import { useFonts, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

import { ApiProvider, useApi } from './src/api/client';
import AppSplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainApp from './src/MainApp';
import { colors, fonts, radius, shadows } from './src/theme';

// Native OS-level splash (hides once fonts are ready) is separate from our
// own animated in-app SplashScreen component (shows next, for a few seconds,
// with the rotating logo, before handing off to Welcome -> Login/Signup).
NativeSplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  const { user, ready } = useApi();
  // 'splash' -> 'welcome' -> 'login' | 'signup' (splash+welcome always play
  // once per app open, regardless of whether a session is already stored).
  const [phase, setPhase] = useState('splash');

  if (phase === 'splash' || !ready) {
    return (
      <>
        <StatusBar style="light" />
        <AppSplashScreen onFinish={() => setPhase('welcome')} />
      </>
    );
  }

  if (phase === 'welcome' && !user) {
    return (
      <>
        <StatusBar style="light" />
        <WelcomeScreen
          onGetStarted={() => setPhase('signup')}
          onHaveAccount={() => setPhase('login')}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {!user ? (
        phase === 'signup' ? (
          <SignupScreen onGoToLogin={() => setPhase('login')} />
        ) : (
          <LoginScreen onGoToSignup={() => setPhase('signup')} />
        )
      ) : (
        <MainApp />
      )}
    </>
  );
}

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && windowWidth > 540;

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await NativeSplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const appContent = (
    <SafeAreaProvider>
      <ApiProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <SafeAreaView style={styles.body} edges={['top', 'left', 'right']}>
            <AuthGate />
          </SafeAreaView>
        </View>
      </ApiProvider>
    </SafeAreaProvider>
  );

  if (!isDesktopWeb) {
    return appContent;
  }

  // Elegant responsive smartphone chassis on desktop displays
  return (
    <View style={styles.desktopOuter}>
      <View style={styles.desktopHeader}>
        <View style={styles.desktopLogoPill}>
          <Text style={styles.desktopLogoText}>🧺 WashWise</Text>
          <View style={styles.desktopLiveDot} />
          <Text style={styles.desktopLiveText}>Interactive Presentation Mode</Text>
        </View>
      </View>

      <View
        style={[
          styles.desktopPhoneChassis,
          { height: Math.min(windowHeight * 0.94, 900) },
        ]}
      >
        <View style={styles.phoneDynamicNotch} pointerEvents="none">
          <View style={styles.notchCamera} />
          <View style={styles.notchSpeaker} />
        </View>
        <View style={styles.phoneScreenWrapper}>{appContent}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
  },
  desktopOuter: {
    flex: 1,
    backgroundColor: '#090E17',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  desktopHeader: {
    marginBottom: 12,
  },
  desktopLogoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 8,
  },
  desktopLogoText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: '#F8FAFC',
  },
  desktopLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  desktopLiveText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#94A3B8',
  },
  desktopPhoneChassis: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#0F172A',
    borderRadius: 44,
    borderWidth: 6,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  phoneDynamicNotch: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    width: 110,
    height: 22,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notchCamera: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
  },
  notchSpeaker: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  phoneScreenWrapper: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
