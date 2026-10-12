import {useTheme} from '../constants/theme';
import {DetailButton as ActionButton} from '../components/post-detail-ui';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { CheckBox, ErrorMessage, EmailInput, useUiStyles } from '../components/onboarding-ui';
import { normalizeEmail } from '../lib/onboarding';
import { authenticateWithPassword, passwordErrorMessage, passwordValidation } from '../lib/password-auth';
import { copy } from '../constants/copy';
import { supabase } from '../lib/supabase';

export default function EmailScreen() {
  const t=useTheme(); const s = useUiStyles(); const c = copy.email;
  const [signup, setSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function submit() {
    if (inFlight.current) return;
    const normalized = normalizeEmail(email);
    if (!normalized) { setError(c.invalid); return; }
    const validation = passwordValidation(password, confirmation, signup);
    if (validation) { setError(validation); return; }
    if (!supabase) { setError(c.unavailable); return; }
    inFlight.current = true; setBusy(true); setError(null);
    try {
      await authenticateWithPassword(supabase.auth, normalized, password, signup);
      setPassword(''); setConfirmation('');
      // AuthProvider routes the new session through the existing onboarding checks.
    } catch (e) { setError(passwordErrorMessage(e)); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <OnboardingFrame title={signup ? c.title : c.loginTitle} subtitle={signup ? c.subtitle : c.loginSubtitle}>
    <View style={s.field}>
      <Text style={s.label}>{c.label}</Text>
      <EmailInput style={{minHeight:t.layout.control,paddingVertical:t.spacing.sm,borderRadius:t.radius.control}} accessibilityLabel={c.label} value={email} onChangeText={value => { setEmail(value); setError(null); }}
        keyboardType="email-address" autoComplete="email" textContentType="emailAddress" autoCapitalize="none"
        autoCorrect={false} editable={!busy} maxLength={254} placeholder={c.placeholder} />
    </View>
    <View style={s.field}>
      <Text style={s.label}>{c.password}</Text>
      <EmailInput style={{minHeight:t.layout.control,paddingVertical:t.spacing.sm,borderRadius:t.radius.control}} accessibilityLabel={c.password} value={password} onChangeText={value => { setPassword(value); setError(null); }}
        secureTextEntry={!visible} autoComplete={signup ? 'new-password' : 'current-password'} textContentType={signup ? 'newPassword' : 'password'}
        autoCapitalize="none" autoCorrect={false} editable={!busy} onSubmitEditing={signup ? undefined : submit} />
      {signup ? <Text style={s.note}>{c.passwordHint}</Text> : null}
    </View>
    {signup ? <View style={s.field}>
      <Text style={s.label}>{c.confirmPassword}</Text>
      <EmailInput style={{minHeight:t.layout.control,paddingVertical:t.spacing.sm,borderRadius:t.radius.control}} accessibilityLabel={c.confirmPassword} value={confirmation} onChangeText={value => { setConfirmation(value); setError(null); }}
        secureTextEntry={!visible} autoComplete="new-password" textContentType="newPassword" autoCapitalize="none"
        autoCorrect={false} editable={!busy} onSubmitEditing={submit} />
    </View> : null}
    <CheckBox label={c.showPassword} checked={visible} onChange={() => setVisible(v => !v)} disabled={busy} />
    <ErrorMessage message={error} />
    <ActionButton label={signup ? c.cta : c.login} onPress={submit} loading={busy} />
    <ActionButton label={signup ? c.switchLogin : c.switchSignup} secondary disabled={busy} onPress={() => {
      setSignup(v => !v); setPassword(''); setConfirmation(''); setVisible(false); setError(null);
    }} />
    {!signup ? <Text style={s.note}>{c.recovery}</Text> : null}
    <Text style={s.note}>{c.privacy}</Text>
    <ActionButton label={c.back} secondary disabled={busy} onPress={() => router.replace('/')} />
  </OnboardingFrame>;
}
