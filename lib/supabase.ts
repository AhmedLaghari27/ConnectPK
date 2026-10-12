import 'react-native-url-polyfill/auto';
import { secureSessionStorage } from './secure-session-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Missing configuration is shown as a recoverable sign-in error, not a crash.
export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: secureSessionStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        // The callback screen consumes the default email template's URL fragment.
        flowType: 'implicit',
        detectSessionInUrl: false,
      },
    })
  : null;
