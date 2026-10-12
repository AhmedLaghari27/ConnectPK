import type { SupabaseClient } from '@supabase/supabase-js';

type PasswordAuth = Pick<SupabaseClient['auth'], 'signUp' | 'signInWithPassword'>;
export function passwordValidation(password: string, confirmation: string, signup: boolean): string | null {
  if (!password) return 'Enter your password.';
  if (signup && (password.length < 8 || password.length > 128)) return 'Choose a password between 8 and 128 characters.';
  if (signup && password !== confirmation) return 'The passwords don’t match. Please try again.';
  return null;
}
export async function authenticateWithPassword(auth: PasswordAuth, email: string, password: string, signup: boolean) {
  const { data, error } = signup ? await auth.signUp({ email, password }) : await auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw { code: 'confirmation_required' };
}
export function passwordErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
  if (code === 'invalid_credentials') return 'The email or password is incorrect. Please try again.';
  if (code === 'user_already_exists' || code === 'email_exists') return 'Unable to create this account. If you already have an account, sign in instead.';
  if (code === 'weak_password') return 'Choose a stronger password that meets the account password requirements.';
  if (code === 'confirmation_required' || code === 'email_not_confirmed') return 'Email confirmation is still required. Contact the app administrator to finish setting up this development account.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'Too many attempts. Please wait a little before trying again.';
  if (code === 'signup_disabled' || code === 'email_provider_disabled') return 'Account signup or sign-in is currently unavailable. Please try again later.';
  return 'Something went wrong. Check your connection and try again.';
}
