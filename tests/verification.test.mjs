import test from 'node:test';
import assert from 'node:assert/strict';
import { validEvidenceLink, verificationStatus } from '../lib/verification.ts';
test('verification accepts only known status values', () => {
  for (const value of ['unverified','pending','approved','rejected']) assert.equal(verificationStatus(value),value);
  for (const value of [null,undefined,'verified',{},true]) assert.throws(() => verificationStatus(value));
});
test('evidence URLs use HTTPS, reject credentials, and constrain LinkedIn host', () => {
  for (const value of ['', 'https://linkedin.com/in/test', 'https://www.linkedin.com/in/test']) assert.equal(validEvidenceLink(value,true),true);
  for (const value of ['http://linkedin.com/in/test','https://linkedin.com.evil.example/in/test','https://evil.example/linkedin.com','https://user:pass@linkedin.com','javascript:alert(1)']) assert.equal(validEvidenceLink(value,true),false);
  assert.equal(validEvidenceLink('https://portfolio.example/work'),true);
  assert.equal(validEvidenceLink('https://example.com/'+'a'.repeat(501)),false);
});
