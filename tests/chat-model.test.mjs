import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateMessage,mergeMessages,parseConversations,parseMessages} from '../lib/chat-model.ts';
test('message validation rejects blank and overlong text',()=>{
 assert.equal(validateMessage('  '),false);assert.equal(validateMessage('a'.repeat(4001)),false);assert.equal(validateMessage(' Hello '),true);
});
test('overlapping history is deduplicated and sorted newest first',()=>{
 const a={id:'a',sender_id:'u',body:'First',created_at:'2026-10-06T00:00:00Z'};
 const b={...a,id:'b',body:'Second',created_at:'2026-10-06T00:01:00Z'};
 assert.deepEqual(mergeMessages([a],[b,a]),[b,a]);
});
test('invalid database responses fail safely',()=>{
 assert.throws(()=>parseMessages([{body:'hello'}]));assert.throws(()=>parseConversations(null));
 assert.deepEqual(parseMessages([]),[]);
});
