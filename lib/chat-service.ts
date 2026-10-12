import { supabase } from './supabase';
import {parseConversations,parseMessages,validateMessage,type Conversation,type ChatMessage} from './chat-model';
export async function inbox(signal:AbortSignal,target?:string,last?:Conversation){
 if(!supabase)throw new Error('Unavailable');
 const {data,error}=await supabase.rpc('chat_inbox',{target:target??null,before_time:last?.activity_at??null,before_id:last?.id??null}).abortSignal(signal);
 if(error)throw error;return parseConversations(data);
}
export async function chatPage(id:string,signal:AbortSignal,last?:ChatMessage){
 if(!supabase)throw new Error('Unavailable');
 let query=supabase.from('chat_messages').select('id,sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(50);
 // Cursor values come only from validated database rows, never text inputs.
 if(last) {
  if(!/^[0-9a-f-]{36}$/i.test(last.id)||!/^\d{4}-\d\d-\d\dT[\d:.+Z-]+$/.test(last.created_at))throw new Error('Invalid cursor');
  query=query.or(`created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`);
 }
 const {data,error}=await query.abortSignal(signal);if(error)throw error;return parseMessages(data);
}
export async function sendChat(id:string,body:string,nonce:string,signal:AbortSignal){
 if(!supabase||!validateMessage(body))throw new Error('Write a message of 1–4,000 characters.');
 const {error}=await supabase.rpc('send_chat_message',{target:id,content:body,nonce}).abortSignal(signal);if(error)throw error;
}
export async function chatAction(id:string,action:'leave'|'block',signal:AbortSignal,otherId?:string){
 if(!supabase)throw new Error('Unavailable');
 if(action==='block'){
  const {data}=await supabase.auth.getSession();if(!data.session||!otherId)throw new Error('Unavailable');
  const {error}=await supabase.from('blocks').insert({blocker_id:data.session.user.id,blocked_id:otherId}).abortSignal(signal);
  if(error&&error.code!=='23505')throw error;
 }else{
  const {error}=await supabase.rpc('leave_chat',{target:id}).abortSignal(signal);if(error)throw error;
 }
}
