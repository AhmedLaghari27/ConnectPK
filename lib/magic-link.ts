export type MagicLinkTokens = { access_token: string; refresh_token: string };

export function parseMagicLink(url: string): MagicLinkTokens {
  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.slice(1));
  if (query.has('error') || query.has('error_code') || fragment.has('error') || fragment.has('error_code')) {
    throw new Error('This sign-in link is invalid or expired. Please request a new one.');
  }
  const type = fragment.get('type') ?? query.get('type');
  if (type && type !== 'magiclink' && type !== 'signup') {
    throw new Error('This link is not a sign-in link. Please request a new one.');
  }
  const access_token = fragment.get('access_token');
  const refresh_token = fragment.get('refresh_token');
  if (!access_token || !refresh_token) {
    throw new Error('This sign-in link is incomplete. Open the latest link from your email.');
  }
  return { access_token, refresh_token };
}

// Inject the auth operation so callback behavior can be tested without real tokens.
export async function completeMagicLink(
  url: string,
  setSession: (tokens: MagicLinkTokens) => Promise<{ data: { session: unknown }; error: unknown }>,
): Promise<void> {
  const tokens = parseMagicLink(url);
  const { data, error } = await setSession(tokens);
  if (error || !data.session) {
    throw new Error('We couldn’t finish signing you in. Check your connection or request a new link.');
  }
}
