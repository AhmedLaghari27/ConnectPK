import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { StartupSplash } from '../components/startup-splash';
import { NotificationProvider } from '../components/notification-provider';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../components/auth-provider';
import { ActionButton, OnboardingScreen, LoadingSkeleton } from '../components/onboarding-ui';
import { SignOutButton } from '../components/sign-out-button';
import { useTheme } from '../constants/theme';
import { copy } from '../constants/copy';

function AuthRoutes() {
  const reduceMotion = useReducedMotion();
  const { stage, retry } = useAuth();
  const theme = useTheme();
  const isCallback = usePathname() === '/auth/callback';
  if (stage === 'loading' && !isCallback) return (
    <OnboardingScreen title={copy.loading.title} subtitle={copy.loading.subtitle}>
      <LoadingSkeleton />
    </OnboardingScreen>
  );
  if (stage === 'error' && !isCallback) return (
    <OnboardingScreen title={copy.accountError.title} subtitle={copy.accountError.subtitle}>
      <ActionButton label={copy.accountError.retry} onPress={retry} /><SignOutButton />
    </OnboardingScreen>
  );
  return (
    <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'fade', contentStyle: { backgroundColor: theme.colors.background } }}>
      <Stack.Protected guard={stage === 'signed-out'}>
        <Stack.Screen name="index" /><Stack.Screen name="email" />
      </Stack.Protected>
      <Stack.Protected guard={stage === 'eligibility'}><Stack.Screen name="eligibility" /></Stack.Protected>
      <Stack.Protected guard={stage === 'profile-setup'}><Stack.Screen name="profile-setup" /></Stack.Protected>
      <Stack.Protected guard={stage === 'home'}><Stack.Screen name="home" /><Stack.Screen name="search" /><Stack.Screen name="messages" /><Stack.Screen name="notifications" /><Stack.Screen name="profile" /><Stack.Screen name="member/[id]" /><Stack.Screen name="edit-profile" /><Stack.Screen name="edit-post/[id]" /><Stack.Screen name="chat/[id]" /><Stack.Screen name="create" options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: reduceMotion ? 'none' : 'slide_from_bottom' }} /><Stack.Screen name="post/[id]" /><Stack.Screen name="verification" /></Stack.Protected>
      <Stack.Screen name="auth/callback" />
    </Stack>
  );
}

export default function RootLayout() {
  const theme = useTheme();
  return <SafeAreaProvider><AuthProvider><NotificationProvider><StatusBar style={theme.isDark ? "light" : "dark"} /><StartupSplash><AuthRoutes /></StartupSplash></NotificationProvider></AuthProvider></SafeAreaProvider>;
}
