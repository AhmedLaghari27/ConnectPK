import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateOffer,parseOffers,offerTypes,fundingWarning} from '../lib/offer-model.ts';
test('six types accept a short message; unknown, empty and oversized values fail',()=>{
 for(const type of offerTypes)assert.equal(validateOffer(type,'I can review your prototype.'),null);
 assert.ok(validateOffer('payment','Hello'));assert.ok(validateOffer('advice','  '));assert.ok(validateOffer('advice','a'.repeat(1001)));
});
test('malformed status cannot enter decision UI; funding warning contains requested guidance',()=>{
 assert.throws(()=>parseOffers([{id:'x',status:'anything'}]));
 assert.match(fundingWarning,/Never send money to unverified people, meet in public, verify the person/);
});
