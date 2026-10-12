import { OnboardingFrame } from '../../components/onboarding-frame';
import { useEffect, useRef, useState } from 'react';
import { Redirect, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { useAuth } from '../../components/auth-provider';
import { ActionButton, ErrorMessage,  LoadingSkeleton } from '../../components/onboarding-ui';
import { copy } from '../../constants/copy';
import { completeMagicLink } from '../../lib/magic-link';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const { stage, retry } = useAuth();
  const c = copy.callback;
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const nativeUrl = Linking.useLinkingURL();
  const [webUrl] = useState(() => Platform.OS === 'web' ? window.location.href : null);
  const callbackUrl = Platform.OS === 'web' ? webUrl : nativeUrl;
  const operation = useRef<{ url: string; promise: Promise<void> } | null>(null);

  useEffect(() => {
    let active = true;
    if (!callbackUrl) return;
    // Reuse the operation during Strict Mode's effect replay.
    if (operation.current?.url !== callbackUrl) {
      setError(null); setDone(false);
      operation.current = { url: callbackUrl, promise: (async () => {
        // Remove bearer tokens from the browser address bar before any request.
        if (Platform.OS === 'web') window.history.replaceState(window.history.state, '', '/auth/callback');
        if (!supabase) throw new Error('Sign-in is not configured. Please try again later.');
        await completeMagicLink(callbackUrl, tokens => supabase!.auth.setSession(tokens));
      })() };
    }
    operation.current.promise.then(() => { if (active) setDone(true); })
      .catch(error => {
        if (active) setError(error instanceof Error ? error.message : 'Unable to sign in. Please request a new link.');
      });
    return () => { active = false; };
  }, [callbackUrl]);

  if (done && stage === 'eligibility') return <Redirect href="/eligibility" />;
  if (done && stage === 'profile-setup') return <Redirect href="/profile-setup" />;
  if (done && stage === 'home') return <Redirect href="/home" />;

  return (
    <OnboardingFrame title={error ? c.errorTitle : c.title} subtitle={error ? c.errorSubtitle : c.subtitle}>
      <ErrorMessage message={error ?? (stage === 'error' && done ? c.profileError : null)} />
      {error ? <ActionButton label={c.back} onPress={() => router.replace('/')} />
        : stage === 'error' && done ? <ActionButton label={c.retry} onPress={retry} />
        : <LoadingSkeleton />}
    </OnboardingFrame>
  );
}
