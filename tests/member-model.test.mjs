import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateMember,parseMember} from '../lib/member-model.ts';
const draft={full_name:'Ayesha Khan',avatar_path:'user/profile.jpg',professional_role:'Designer',organization:'Studio',independent:false,city:'Karachi',skills:'design, research',vision:'Make useful tools for local professionals.',can_help:'I can help teams improve their product design.'};
test('valid professional edits need no birth date or future availability',()=>assert.deepEqual(validateMember(draft),{}));
test('limits, city, skills and professional wording are checked',()=>{
 assert.ok(validateMember({...draft,city:'Exact address'}).city);
 assert.ok(validateMember({...draft,skills:'a,b,c,d,e,f,g,h,i,j,k'}).skills);
 assert.ok(validateMember({...draft,vision:'Looking for a romantic relationship.'}).vision);
 assert.deepEqual(validateMember({...draft,independent:true,organization:''}),{});
});
test('profile response validation rejects malformed fields',()=>{assert.equal(parseMember([]),null);assert.throws(()=>parseMember([{id:'x'}]));});
