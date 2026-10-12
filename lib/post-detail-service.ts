import { supabase } from './supabase';
import { parseFeedPosts } from './feed-model';
export const reactions = ['useful','inspiring','support'] as const;
export type Reaction = typeof reactions[number];
export type Opinion = {id:string;author_id:string;author_name:string;body:string;created_at:string};
export async function detailSnapshot(id:string,signal:AbortSignal) {
  if(!supabase) throw new Error('Unavailable');
  const {data:session}=await supabase.auth.getSession();
  if(!session.session) throw new Error('Signed out');
  const uid=session.session.user.id;
  const result=await supabase.rpc('post_detail',{target:id}).abortSignal(signal);
  if(result.error) throw result.error;
  const post=parseFeedPosts(result.data)[0]??null;
  if(!post) return {post:null,uid,reaction:null};
  const own=await supabase.from('reactions').select('type').eq('post_id',id).eq('user_id',uid).abortSignal(signal).maybeSingle();
  if(own.error) throw own.error;
  if(post.author_photo) {
    const {data}=await withAbort(supabase.storage.from('profile-photos').createSignedUrl(post.author_photo,60),signal);
    post.photoUrl=data?.signedUrl;
  }
  const value=own.data?.type;
  if(value && !reactions.includes(value)) throw new Error('Invalid reaction');
  return {post,uid,reaction:(value as Reaction|undefined)??null};
}
export async function opinions(id:string,signal:AbortSignal,last?:Opinion) {
  if(!supabase) throw new Error('Unavailable');
  const {data,error}=await supabase.rpc('post_opinions',{target:id,after_time:last?.created_at??null,after_id:last?.id??null}).abortSignal(signal);
  if(error) throw error;
  if(!Array.isArray(data) || data.some(row=>!row || ['id','author_id','author_name','body','created_at'].some(k=>typeof row[k]!=='string'))) throw new Error('Unavailable');
  return data as Opinion[];
}
export type DetailAction = {kind:'react';value:Reaction;current:Reaction|null} | {kind:'comment';body:string} | {kind:'deleteComment';id:string} | {kind:'block';author:string} | {kind:'hide'} | {kind:'delete'};
export async function actOnPost(id:string,uid:string,action:DetailAction) {
  if(!supabase) throw new Error('Unavailable');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try {
    let result;
    switch(action.kind) {
      case 'react':
        result=action.current===action.value
          ?await supabase.from('reactions').delete().eq('post_id',id).eq('user_id',uid).abortSignal(controller.signal)
          :action.current
            ?await supabase.from('reactions').update({type:action.value}).eq('post_id',id).eq('user_id',uid).abortSignal(controller.signal)
            :await supabase.from('reactions').insert({post_id:id,user_id:uid,type:action.value}).abortSignal(controller.signal);break;
      case 'comment': result=await supabase.from('comments').insert({post_id:id,author_id:uid,body:action.body.trim()}).abortSignal(controller.signal);break;
      case 'deleteComment': result=await supabase.from('comments').update({status:'removed'}).eq('id',action.id).eq('post_id',id).eq('author_id',uid).select('id').abortSignal(controller.signal);break;
      case 'delete': result=await supabase.from('posts').update({status:'removed'}).eq('id',id).eq('author_id',uid).select('id').abortSignal(controller.signal);break;
      case 'hide': result=await supabase.from('hidden_posts').insert({post_id:id,user_id:uid}).abortSignal(controller.signal);break;
      case 'block': result=await supabase.from('blocks').insert({blocker_id:uid,blocked_id:action.author}).abortSignal(controller.signal);break;
    }
    if(result.error && !(result.error.code==='23505' && (action.kind==='hide'||action.kind==='block'))) throw result.error;
    if((action.kind==='delete'||action.kind==='deleteComment') && !result.data?.length) throw new Error('Unavailable');
  } finally {clearTimeout(timer);}
}

function withAbort<T>(promise:Promise<T>,signal:AbortSignal):Promise<T> {
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(new Error('Request cancelled'));
    if(signal.aborted){abort();return;}
    signal.addEventListener('abort',abort,{once:true});
    promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
  });
}
