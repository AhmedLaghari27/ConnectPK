import { OnboardingFrame } from '../components/onboarding-frame';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton, CheckBox, ErrorMessage,  useUiStyles } from '../components/onboarding-ui';
import { SignOutButton } from '../components/sign-out-button';
import { copy } from '../constants/copy';
import { conductRules } from '../constants/conduct';
import { authErrorMessage, TERMS_VERSION } from '../lib/onboarding';
import { supabase } from '../lib/supabase';

export default function EligibilityScreen() {
  const s = useUiStyles(); const c = copy.eligibility;
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  async function continueOnboarding() {
    if (!adult || !terms || !supabase || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: {
        age_confirmed_18_plus: true,
        conduct_terms_version: TERMS_VERSION,
        conduct_terms_accepted_at: new Date().toISOString(),
      } });
      if (error) throw error;
    } catch (error) { setError(authErrorMessage(error)); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return (
    <OnboardingFrame title={c.title} subtitle={c.subtitle}>
      <View style={s.card}>
        {conductRules.map((rule, i) => <View key={rule} style={s.rule}><Text style={s.ruleNumber}>{`0${i + 1}`}</Text><Text style={s.ruleBody}>{rule}</Text></View>)}
      </View>
      <View style={s.field}>
        <CheckBox label={c.adult} checked={adult} onChange={() => setAdult(!adult)} disabled={busy} />
        <CheckBox label={c.terms} checked={terms} onChange={() => setTerms(!terms)} disabled={busy} />
      </View>
      <ErrorMessage message={error} />
      <ActionButton label={c.cta} onPress={continueOnboarding} loading={busy} disabled={!adult || !terms} />
      <Text style={s.note}>{c.note}</Text>
      {!busy ? <SignOutButton /> : null}
    </OnboardingFrame>
  );
}
