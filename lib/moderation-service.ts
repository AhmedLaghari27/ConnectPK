import {supabase} from './supabase';
import {validateReport,type ReportTarget} from './moderation-model';
export async function submitReport(target:ReportTarget,category:string,description:string){
 const invalid=validateReport(category,description);if(invalid)throw new Error(invalid);
 if(!supabase)throw new Error('Unavailable');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{const {error}=await supabase.rpc('submit_report',{kind:target.kind,target:target.id,category_key:category,description:description.trim()}).abortSignal(controller.signal);if(error)throw error;}finally{clearTimeout(timer);}
}
export async function blockMember(id:string){
 if(!supabase)throw new Error('Unavailable');const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Signed out');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{const {error}=await supabase.from('blocks').insert({blocker_id:data.session.user.id,blocked_id:id}).abortSignal(controller.signal);if(error&&error.code!=='23505')throw error;}finally{clearTimeout(timer);}
}
