import { supabase } from './supabase';
import { parseOffers,validateOffer,type Offer,type OfferProfile,type OfferType } from './offer-model';
export async function loadOffers(postId:string,signal:AbortSignal,last?:Offer) {
 if(!supabase)throw new Error('Unavailable');
 const {data,error}=await supabase.rpc('post_offers',{target:postId,before_time:last?.created_at??null,before_id:last?.id??null}).abortSignal(signal);
 if(error)throw error;return parseOffers(data);
}
export async function loadOfferProfile(id:string,signal:AbortSignal):Promise<OfferProfile|null> {
 if(!supabase)throw new Error('Unavailable');
 const {data,error}=await supabase.rpc('offer_profile',{target:id}).abortSignal(signal);
 if(error)throw error;
 const p=data?.[0];if(!p)return null;
 if(!['id','full_name','city'].every(k=>typeof p[k]==='string')||typeof p.verified!=='boolean'||!['headline','bio'].every(k=>p[k]===null||typeof p[k]==='string'))throw new Error('Invalid profile');
 return p as OfferProfile;
}
export async function sendOffer(postId:string,type:OfferType,message:string,signal:AbortSignal) {
 if(!supabase)throw new Error('Unavailable');
 const invalid=validateOffer(type,message);if(invalid)throw new Error(invalid);
 const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('Please sign in again.');
 const {error}=await supabase.from('offers').insert({post_id:postId,offerer_id:data.session.user.id,offer_type:type,message:message.trim()}).abortSignal(signal);
 if(error){
   if(error.code==='23505')throw new Error('You already offered help on this post. Only one offer is allowed, even after withdrawal.');
   if(error.message.includes('Daily limit'))throw new Error('You’ve reached today’s 20 offers. Try again after midnight Pakistan time.');
   if(error.code==='42501')throw new Error('This post is unavailable or your account is not approved.');
   throw new Error('We couldn’t confirm your offer. Refresh before trying again; your message is saved here.');
 }
}
export async function decideOffer(id:string,status:'accepted'|'declined'|'withdrawn',signal:AbortSignal) {
 if(!supabase)throw new Error('Unavailable');
 const {data,error}=await supabase.from('offers').update({status}).eq('id',id).eq('status','pending').select('id').abortSignal(signal);
 if(error||!data?.length)throw new Error('This offer may have changed or become unavailable. Refresh to see its latest status.');
}
