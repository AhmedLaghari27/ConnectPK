import {supabase} from './supabase';
import {parseMember,validateMember,type MemberDraft} from './member-model';
import {parseFeedPosts,type FeedPost} from './feed-model';
import {parseTags,validatePost,type PostDraft} from './post-form';
import type {OfferStatus,OfferType} from './offer-model';
export type MyOffer={id:string;post_id:string;post_title:string;offer_type:OfferType;message:string;status:OfferStatus;created_at:string};
export async function myId(){if(!supabase)throw new Error('Unavailable');const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Signed out');return data.session.user.id;}
export async function getMember(id:string,signal:AbortSignal){
 if(!supabase)throw new Error('Unavailable');const {data,error}=await supabase.rpc('member_profile',{target:id}).abortSignal(signal);if(error)throw error;const p=parseMember(data);
 if(p?.avatar_path){const result=await abortable(supabase.storage.from('profile-photos').createSignedUrl(p.avatar_path,60),signal);p.photoUrl=result.data?.signedUrl;}
 return p;
}
export async function memberPosts(id:string,signal:AbortSignal,last?:FeedPost){
 if(!supabase)throw new Error('Unavailable');const {data,error}=await supabase.rpc('member_posts',{target:id,before_time:last?.created_at??null,before_id:last?.id??null}).abortSignal(signal);if(error)throw error;return parseFeedPosts(data);
}
export async function myOffers(signal:AbortSignal,last?:MyOffer){
 if(!supabase)throw new Error('Unavailable');const {data,error}=await supabase.rpc('my_offers',{before_time:last?.created_at??null,before_id:last?.id??null}).abortSignal(signal);
 if(error||!Array.isArray(data)||data.some(o=>!o||!['id','post_id','post_title','offer_type','message','status','created_at'].every(k=>typeof o[k]==='string')))throw new Error('Unavailable');return data as MyOffer[];
}
export async function saveMember(draft:MemberDraft,signal:AbortSignal){
 if(!supabase||Object.keys(validateMember(draft)).length)throw new Error('Invalid profile');
 const {error}=await supabase.rpc('save_member_profile',{payload:draft}).abortSignal(signal);if(error)throw error;
}
export async function loadOwnPost(id:string,signal:AbortSignal){
 if(!supabase)throw new Error('Unavailable');const uid=await myId();const {data,error}=await supabase.from('posts').select('post_type,title,body,tags,city').eq('id',id).eq('author_id',uid).eq('status','active').abortSignal(signal).single();if(error)throw error;
 return {...data,tags:data.tags.join(', ')} as PostDraft;
}
export async function editOwnPost(id:string,draft:PostDraft,signal:AbortSignal){
 if(!supabase||Object.keys(validatePost(draft)).length)throw new Error('Invalid post');const uid=await myId();
 const {data,error}=await supabase.from('posts').update({...draft,title:draft.title.trim(),body:draft.body.trim(),tags:parseTags(draft.tags)}).eq('id',id).eq('author_id',uid).eq('status','active').select('id').abortSignal(signal);
 if(error||!data?.length)throw new Error('Could not update');
}
export async function deleteOwnPost(id:string,signal:AbortSignal){
 if(!supabase)throw new Error('Unavailable');const uid=await myId();const {data,error}=await supabase.from('posts').update({status:'removed'}).eq('id',id).eq('author_id',uid).select('id').abortSignal(signal);if(error||!data?.length)throw new Error('Could not delete');
}

function abortable<T>(promise:Promise<T>,signal:AbortSignal):Promise<T>{
 return new Promise((resolve,reject)=>{
  const abort=()=>reject(new Error('Cancelled'));
  if(signal.aborted){abort();return;}
  signal.addEventListener('abort',abort,{once:true});
  promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
 });
}
