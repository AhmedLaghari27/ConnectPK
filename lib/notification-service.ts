import {supabase} from './supabase';
import {parseNotices,type Notice} from './notification-model';
export async function notificationPage(signal:AbortSignal,last?:Notice){
 if(!supabase)throw new Error('Unavailable');
 let query=supabase.from('notifications').select('id,type,data,read_at,created_at').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(20);
 if(last){if(!/^[0-9a-f-]{36}$/i.test(last.id)||!/^\d{4}-\d\d-\d\dT[\d:.+Z-]+$/.test(last.created_at))throw new Error('Invalid cursor');query=query.or(`created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`);}
 const {data,error}=await query.abortSignal(signal);if(error)throw error;return parseNotices(data);
}
export async function unreadNotifications(signal:AbortSignal){
 if(!supabase)throw new Error('Unavailable');const {count,error}=await supabase.from('notifications').select('id',{count:'exact',head:true}).is('read_at',null).abortSignal(signal);
 if(error)throw error;return count??0;
}
export async function markRead(target?:string){
 if(!supabase)throw new Error('Unavailable');const c=new AbortController();const timer=setTimeout(()=>c.abort(),15000);
 try{const {error}=await supabase.rpc('mark_notifications_read',{target:target??null}).abortSignal(c.signal);if(error)throw error;}finally{clearTimeout(timer);}
}
