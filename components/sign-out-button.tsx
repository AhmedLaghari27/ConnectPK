import { unregisterPush } from '../lib/push-notifications';
import { copy } from '../constants/copy';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { authErrorMessage } from '../lib/onboarding';
import { ActionButton, ErrorMessage } from './onboarding-ui';

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signOut() {
    if (!supabase || busy) return;
    setBusy(true); setError(null);
    try {
      await unregisterPush();
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch (error) { setError(authErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return <><ErrorMessage message={error} /><ActionButton label={copy.signOut} onPress={signOut} secondary loading={busy} /></>;
}
