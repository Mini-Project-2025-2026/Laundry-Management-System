import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { colors } from './src/theme';

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

  return (
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
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
  },
});
