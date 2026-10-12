import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { Easing, ReduceMotion, cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { brand, theme } from '../constants/theme';
import { router, useRootNavigationState } from 'expo-router';
import { useAuth } from './auth-provider';
import { loadFeedAccess } from '../lib/feed-service';

if (Platform.OS !== 'web') void SplashScreen.preventAutoHideAsync().catch(() => {});

export function StartupSplash({ children }: PropsWithChildren) {
  const { stage } = useAuth();
  const navigation = useRootNavigationState();
  const checked = useRef(false);
  const [checking, setChecking] = useState(false);
  const [visible, setVisible] = useState(true);
  const [laidOut, setLaidOut] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const started = useRef(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (checked.current || stage === 'loading') return;
    if (stage !== 'home') { checked.current = true; setChecking(false); return; }
    if (!navigation?.key) return;
    const controller = new AbortController();
    let active = true;
    setChecking(true);
    const timeout = setTimeout(() => controller.abort(), 15000);
    loadFeedAccess(controller.signal).then(approved => {
      if (active && !approved) router.replace('/verification');
    }).catch(() => {
      // The existing feed owns access-check errors and retry UI.
    }).finally(() => {
      clearTimeout(timeout);
      if (active) { checked.current = true; setChecking(false); }
    });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [stage, navigation?.key]);

  useEffect(() => {
    if (!laidOut || !imageReady) return;
    started.current = true;
    if (Platform.OS !== 'web') void SplashScreen.hideAsync().catch(() => {});
    opacity.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
    const timer = setTimeout(() => setVisible(false), 4500);
    return () => { clearTimeout(timer); cancelAnimation(opacity); cancelAnimation(scale); };
  }, [laidOut, imageReady, opacity, scale]);

  // An asset failure must never strand the app behind its native launch screen.
  useEffect(() => {
    const fallback = setTimeout(() => { if (!started.current) setImageReady(true); }, 2000);
    return () => clearTimeout(fallback);
  }, []);

  const showing = visible || checking;
  return <View style={{ flex: 1, backgroundColor: brand }}>
    <View style={{ flex: 1 }} pointerEvents={showing ? 'none' : 'auto'} accessibilityElementsHidden={showing} importantForAccessibility={showing ? 'no-hide-descendants' : 'auto'}>
      {children}
    </View>
    {showing ? <View onLayout={() => setLaidOut(true)} style={styles.cover} accessibilityViewIsModal>
      <StatusBar style="dark" />
      <Animated.View style={[styles.mark, animated]}>
        <Image source={require('../assets/logo.png')} onLoadEnd={() => setImageReady(true)} style={styles.logo} resizeMode="contain" accessibilityLabel="ConnectPK logo" />
      </Animated.View>
      <Animated.View style={[styles.copy, animated]}>
        <Text style={styles.name}>ConnectPK</Text>
        <Text style={styles.tagline}>Where professionals build together</Text>
      </Animated.View>
    </View> : null}
  </View>;
}
const styles = StyleSheet.create({
  cover: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: brand, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  mark: { width: 160, height: 160 },
  logo: { width: '100%', height: '100%' },
  copy: { position: 'absolute', top: '50%', marginTop: 104, paddingHorizontal: theme.spacing.lg, alignItems: 'center', gap: theme.spacing.sm },
  name: { ...theme.typography.title, color: theme.colors.onAction },
  tagline: { ...theme.typography.body, color: theme.colors.onAction, textAlign: 'center', maxWidth: 320 },
});
