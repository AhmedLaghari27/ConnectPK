import test from 'node:test';
import assert from 'node:assert/strict';
import { feedCursor,mergeFeedPosts,normalizeTag,parseFeedPosts } from '../lib/feed-model.ts';
test('feed cursor preserves the database timestamp and stable ID tie-breaker',()=>{
 assert.equal(feedCursor([]),null);
 assert.deepEqual(feedCursor([{id:'first',created_at:'2026-10-06T00:00:00.123456Z'},{id:'last',created_at:'2026-10-06T00:00:00.123456Z'}]),{id:'last',time:'2026-10-06T00:00:00.123456Z'});
});
test('pagination does not duplicate existing cards and normalizes exact tag search',()=>{
 assert.deepEqual(mergeFeedPosts([{id:'1'}],[{id:'1'},{id:'2'}]),[{id:'1'},{id:'2'}]);
 assert.equal(normalizeTag(' #Design '),'design');
 assert.equal(normalizeTag('a'.repeat(100)).length,80);
});
test('malformed feed responses fail into the error state',()=>{
 assert.deepEqual(parseFeedPosts([]),[]);
 for(const data of [null,{},[{}],[{post_type:'dating'}]]) assert.throws(()=>parseFeedPosts(data));
});
