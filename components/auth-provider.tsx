import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { hasAcceptedOnboarding, isProfileComplete } from '../lib/onboarding';
import { supabase } from '../lib/supabase';

type Stage = 'loading' | 'signed-out' | 'eligibility' | 'profile-setup' | 'home' | 'error';
const AuthContext = createContext<{ stage: Stage; retry: () => void }>({ stage: 'loading', retry: () => {} });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>();
  const [sessionError, setSessionError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [profile, setProfile] = useState<{ userId: string; complete: boolean; error: boolean } | null>(null);
  const userId = session?.user.id;
  const accepted = hasAcceptedOnboarding(session?.user.user_metadata);

  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    const client = supabase;
    let active = true;
    let authEventReceived = false;
    setSessionError(false);
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      if (active) { setSession(nextSession); setSessionError(false); }
    });
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setSessionError(true);
      else if (!authEventReceived) setSession(data.session);
    }).catch(() => { if (active) setSessionError(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [attempt]);

  useEffect(() => {
    if (!supabase || Platform.OS === 'web') return;
    const client = supabase;
    const updateRefresh = (state: string) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    updateRefresh(AppState.currentState);
    const listener = AppState.addEventListener('change', updateRefresh);
    return () => { listener.remove(); client.auth.stopAutoRefresh(); };
  }, []);

  useEffect(() => {
    setProfile(null);
    if (!supabase || !userId || !accepted) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    Promise.resolve(supabase.from('profiles').select('full_name,date_of_birth,city,intention,setup_completed_at')
      .eq('id', userId).abortSignal(controller.signal).maybeSingle())
      .then(({ data, error }) => {
        if (active) setProfile({ userId, complete: !error && isProfileComplete(data), error: Boolean(error) });
      }, () => { if (active) setProfile({ userId, complete: false, error: true }); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [userId, accepted, attempt]);

  let stage: Stage = 'loading';
  if (sessionError) stage = 'error';
  else if (session === null) stage = 'signed-out';
  else if (session && !accepted) stage = 'eligibility';
  else if (profile?.userId === userId && profile) stage = profile.error ? 'error' : profile.complete ? 'home' : 'profile-setup';

  return <AuthContext.Provider value={{ stage, retry: () => { setProfile(null); setAttempt(n => n + 1); } }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
