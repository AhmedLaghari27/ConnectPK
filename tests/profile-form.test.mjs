import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyProfile, validateProfileStep, isAdult, listItems, restrictedPattern } from '../lib/profile-form.ts';
const now = new Date('2026-10-05T12:00:00Z');
const valid = { ...emptyProfile, full_name: 'Test Member', date_of_birth: '2000-01-01', avatar_path: 'owner/profile.jpg', city: 'Karachi', broad_area: 'Gulshan', professional_role: 'Designer', independent: true, industry: 'Technology', experience: '1–3 years', skills: 'Design, Strategy', interests: 'Education', languages: 'Urdu, English', can_help: 'I can help design accessible products.', wants_to_meet: 'I want to meet people building useful tools.', vision: 'Build more accessible professional tools.', intention: 'build_together', meeting_preference: 'online', slots: [{ date: '2026-10-10', start: '14:00', end: '15:00' }] };
test('each step accepts a complete professional profile and rejects empty fields', () => {
  for (let step = 1; step <= 5; step++) {
    assert.deepEqual(validateProfileStep(valid, step, now), {});
    assert.ok(Object.keys(validateProfileStep(emptyProfile, step, now)).length);
  }
});
test('age uses calendar birthdays and rejects impossible dates', () => {
  assert.equal(isAdult('2008-10-05', now), true);
  assert.equal(isAdult('2008-10-06', now), false);
  assert.equal(isAdult('2000-02-30', now), false);
  assert.equal(isAdult('2090-01-01', now), false);
});
test('romantic wording is blocked without matching innocent substrings', () => {
  for (const text of ['DATING', 'romantic partner', 'hook-up', 'sexual']) {
    assert.ok(restrictedPattern.test(text));
  }
  assert.ok(validateProfileStep({ ...valid, can_help: 'Looking for a romantic partner here.' }, 4, now).can_help);
  assert.ok(validateProfileStep({ ...valid, interests: 'ＤＡＴＩＮＧ' }, 3, now).interests);
  for (const text of ['Sussex University', 'candidate research', 'updating products']) assert.equal(restrictedPattern.test(text), false);
});
test('organization required unless independent; lists have bounds and normalize duplicates', () => {
  assert.ok(validateProfileStep({ ...valid, independent: false }, 2, now).organization);
  assert.deepEqual(listItems(' Design, design, Strategy, '), ['design', 'strategy']);
  assert.ok(validateProfileStep({ ...valid, skills: Array.from({ length: 11 }, (_, i) => `skill${i}`).join(',') }, 3, now).skills);
});
test('availability rejects past, short, overlapping and impossible windows', () => {
  for (const slots of [[], [{date:'2026-10-01',start:'14:00',end:'15:00'}], [{date:'2026-10-10',start:'14:00',end:'14:15'}], [{date:'2026-10-10',start:'25:00',end:'26:00'}], [valid.slots[0],valid.slots[0]]]) {
    assert.ok(validateProfileStep({ ...valid, slots }, 5, now).slots);
  }
  assert.deepEqual(validateProfileStep({ ...valid, slots: [valid.slots[0], {date:'2026-10-10',start:'15:00',end:'15:30'}] }, 5, now), {});
});
