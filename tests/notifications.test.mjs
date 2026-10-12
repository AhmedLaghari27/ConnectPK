import test from 'node:test';
import assert from 'node:assert/strict';
import {deliver} from '../supabase/functions/push-notifications/worker.ts';
import {notificationDestination,parseNotices} from '../lib/notification-model.ts';
const job={job_id:'job',job_lease:'lease',device_token:'ExpoPushToken[test]',notification_id:'notice',event_type:'new_message',ticket_id:null};
const response=(data,status=200)=>async()=>new Response(JSON.stringify(data),{status});
test('push contains generic copy and only a notification ID',async()=>{
 let body;const result=await deliver(job,async(_url,init)=>{body=JSON.parse(init.body);return new Response(JSON.stringify({data:{status:'ok',id:'ticket'}}));});
 assert.deepEqual(result,{outcome:'ticket',expo_ticket:'ticket'});assert.equal(body.body,'You have a new message.');assert.deepEqual(body.data,{notification_id:'notice'});
});
test('receipts, invalid devices, and retryable failures',async()=>{
 assert.equal((await deliver({...job,ticket_id:'ticket'},response({data:{ticket:{status:'ok'}}}))).outcome,'delivered');
 assert.deepEqual(await deliver(job,response({data:{status:'error',details:{error:'DeviceNotRegistered'}}})),{outcome:'dead',failure:'DeviceNotRegistered'});
 assert.equal((await deliver(job,response({},429))).outcome,'pending');
 assert.equal((await deliver({...job,ticket_id:'ticket'},response({data:{}}))).outcome,'ticket');
 assert.equal((await deliver(job,async()=>{throw new Error('offline');})).outcome,'pending');
});
test('unknown events never send and routes never accept arbitrary URLs',async()=>{
 assert.equal((await deliver({...job,event_type:'unknown'},()=>{throw new Error('must not call');})).outcome,'skipped');
 const notice={id:'n',type:'new_message',read_at:null,created_at:new Date().toISOString(),data:{conversation_id:'https://evil.example'}};
 assert.equal(notificationDestination(notice),null);
 notice.data.conversation_id='00000000-0000-0000-0000-000000000001';
 assert.equal(notificationDestination(notice).pathname,'/chat/[id]');
 assert.throws(()=>parseNotices([{...notice,type:'unexpected'}]));assert.equal(parseNotices([notice]).length,1);
});
