import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMagicLink, completeMagicLink } from '../lib/magic-link.ts';
const fragment = '#access_token=test-access&refresh_token=test-refresh&type=magiclink';

test('reads default template tokens on web, native and Expo Go', () => {
  for (const base of ['http://localhost:8081/auth/callback', 'connectpk://auth/callback', 'exp://192.168.1.2:8081/--/auth/callback']) {
    assert.deepEqual(parseMagicLink(base + fragment), { access_token: 'test-access', refresh_token: 'test-refresh' });
  }
  assert.equal(parseMagicLink('http://localhost:8081/auth/callback' + fragment.replace('magiclink', 'signup')).access_token, 'test-access');
});

test('rejects expired, incomplete, and unrelated callback links', () => {
  for (const suffix of ['', '#access_token=x', '?error=access_denied', '#error_code=otp_expired', fragment + '&error=denied', fragment.replace('magiclink', 'recovery')]) {
    assert.throws(() => parseMagicLink('http://localhost:8081/auth/callback' + suffix));
  }
});

test('establishes a session before reporting successful completion', async () => {
  let received;
  await completeMagicLink('http://localhost:8081/auth/callback' + fragment, async tokens => {
    received = tokens;
    return { data: { session: { user: { id: 'test-user' } } }, error: null };
  });
  assert.equal(received.refresh_token, 'test-refresh');
});

test('does not call auth for invalid links and rejects session failures', async () => {
  let called = false;
  await assert.rejects(completeMagicLink('http://localhost:8081/auth/callback#error=denied', async () => { called = true; }));
  assert.equal(called, false);
  for (const result of [{ data: { session: null }, error: null }, { data: { session: null }, error: { message: 'private detail' } }]) {
    await assert.rejects(completeMagicLink('http://localhost:8081/auth/callback' + fragment, async () => result), /couldn’t finish/);
  }
});
