export const TERMS_VERSION = 'conduct-2026-10-05';

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function hasAcceptedOnboarding(metadata: Record<string, unknown> = {}) {
  return metadata.age_confirmed_18_plus === true
    && metadata.conduct_terms_version === TERMS_VERSION
    && typeof metadata.conduct_terms_accepted_at === 'string'
    && Number.isFinite(Date.parse(metadata.conduct_terms_accepted_at));
}

export type RequiredProfile = {
  setup_completed_at?: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  city: string | null;
  intention: string | null;
};

export function isProfileComplete(profile: RequiredProfile | null): boolean {
  return Boolean(profile?.setup_completed_at && profile.full_name?.trim() && profile.date_of_birth
    && ['Karachi', 'Lahore', 'Islamabad'].includes(profile.city ?? '')
    && ['exchange_ideas', 'grow_professionally', 'build_together'].includes(profile.intention ?? ''));
}

export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
  if (code === 'otp_expired') return 'That code is invalid or expired. Check it or request a new code.';
  if (code === 'email_address_invalid') return 'Enter a valid email address and try again.';
  if (code === 'email_address_not_authorized') return 'Email delivery is currently limited to approved test addresses. Please contact the app administrator.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') {
    return 'Too many attempts. Please wait a little before trying again.';
  }
  if (code === 'email_send_failed') return 'We could not send your code. Please try again shortly.';
  if (code === 'email_provider_disabled' || code === 'signup_disabled') return 'Email sign-in is currently unavailable. Please try again later.';
  return 'Something went wrong. Check your connection and try again.';
}
