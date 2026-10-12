import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePost,parseTags} from '../lib/post-form.ts';
const valid={post_type:'building',title:'A tool for designers',body:'Looking for feedback on our prototype.',tags:'design, #Design, startups',city:'Karachi'};
test('professional draft and normalized tags',()=>{assert.deepEqual(validatePost(valid),{});assert.deepEqual(parseTags(valid.tags),['design','startups']);});
test('invalid required fields, limits and choices',()=>{const e=validatePost({...valid,post_type:'other',title:' ',body:'a'.repeat(5001),city:'other',tags:'a,b,c,d,e,f'});assert.equal(Object.keys(e).length,5);});
test('blocks romance and money requests but allows professional funding discussion',()=>{
 for(const body of ['Looking for a girlfriend','Send me money now','Guaranteed profits','Pay an upfront fee','double your money','se\u200bx']) {
   assert.ok(validatePost({...valid,body}).body,body);
 }
 assert.deepEqual(validatePost({...valid,body:'Seeking advice about funding a prototype.'}),{});
 assert.ok(validatePost({...valid,tags:'design,dating'}).tags);
});
