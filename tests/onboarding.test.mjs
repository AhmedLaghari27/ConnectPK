import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, hasAcceptedOnboarding, isProfileComplete, authErrorMessage, TERMS_VERSION } from '../lib/onboarding.ts';

test('normalizes email addresses and rejects invalid input', () => {
  assert.equal(normalizeEmail('  Member@Example.com  '), 'member@example.com');
  assert.equal(normalizeEmail('member+test@example.co.uk'), 'member+test@example.co.uk');
  for (const value of ['', 'member', 'member@', '@example.com', 'a@@example.com', 'a b@example.com', 'a@example', 'a'.repeat(250) + '@example.com']) {
    assert.equal(normalizeEmail(value), null);
  }
});

test('both confirmations and the current conduct version are required', () => {
  const accepted = { age_confirmed_18_plus: true, conduct_terms_version: TERMS_VERSION, conduct_terms_accepted_at: '2026-10-05T09:00:00Z' };
  assert.equal(hasAcceptedOnboarding(accepted), true);
  assert.equal(hasAcceptedOnboarding(), false);
  assert.equal(hasAcceptedOnboarding({ ...accepted, age_confirmed_18_plus: false }), false);
  assert.equal(hasAcceptedOnboarding({ ...accepted, age_confirmed_18_plus: 'true' }), false);
  assert.equal(hasAcceptedOnboarding({ ...accepted, conduct_terms_version: 'old' }), false);
  assert.equal(hasAcceptedOnboarding({ ...accepted, conduct_terms_accepted_at: 'invalid' }), false);
});

test('profile completion requires final server save and required fields', () => {
  const complete = { setup_completed_at: '2026-10-05T12:00:00Z', full_name: 'A Member', date_of_birth: '1990-01-01', city: 'Karachi', intention: 'exchange_ideas' };
  assert.equal(isProfileComplete(complete), true);
  assert.equal(isProfileComplete(null), false);
  for (const field of Object.keys(complete)) assert.equal(isProfileComplete({ ...complete, [field]: null }), false);
  assert.equal(isProfileComplete({ ...complete, full_name: '  ' }), false);
  assert.equal(isProfileComplete({ ...complete, city: 'Multan' }), false);
  assert.equal(isProfileComplete({ ...complete, intention: 'dating' }), false);
});

test('auth failures provide usable feedback without exposing raw details', () => {
  assert.match(authErrorMessage({ code: 'otp_expired' }), /invalid or expired/);
  assert.match(authErrorMessage({ code: 'over_email_send_rate_limit' }), /wait/);
  assert.match(authErrorMessage(new Error('secret server detail')), /connection/);
  assert.doesNotMatch(authErrorMessage(new Error('secret server detail')), /secret/);
});
