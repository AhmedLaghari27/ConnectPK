import test from 'node:test';
import assert from 'node:assert/strict';
import {reportCategories,validateReport} from '../lib/moderation-model.ts';
test('all prohibited categories are available, including scams',()=>{
 assert.equal(Object.keys(reportCategories).length,8);assert.equal(reportCategories.scam_fraud,'Scam or fraud');
 for(const key of Object.keys(reportCategories))assert.equal(validateReport(key,'Please review this content.'),null);
});
test('report requires a real category and a bounded description',()=>{
 assert.ok(validateReport('','Description'));assert.ok(validateReport('other','Description'));assert.ok(validateReport('harassment','  '));assert.ok(validateReport('harassment','x'.repeat(2001)));assert.equal(validateReport('scam_fraud','x'.repeat(2000)),null);
});
