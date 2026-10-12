import { supabase } from './supabase';
import { parseTags, validatePost, professionalWarning, moneyWarning, type PostDraft } from './post-form';
export async function loadPostQuota(signal: AbortSignal) {
  if(!supabase) throw new Error('Unavailable');
  const {data,error}=await supabase.rpc('my_post_quota').abortSignal(signal);
  if(error || !Number.isInteger(data) || data<0 || data>3) throw new Error('Unavailable');
  return data as number;
}
export async function createPost(draft: PostDraft) {
  if(!supabase || Object.keys(validatePost(draft)).length) throw new Error('Please check the fields above.');
  const {data}=await supabase.auth.getSession();
  if(!data.session) throw new Error('Please sign in again.');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try {
  const {error}=await supabase.from('posts').insert({author_id:data.session.user.id,post_type:draft.post_type,
    title:draft.title.trim(),body:draft.body.trim(),tags:parseTags(draft.tags),city:draft.city}).abortSignal(controller.signal);
  if(error) {
    if(error.message.includes('Daily limit reached')) throw new Error('You’ve used today’s 3 posts. Try again after midnight Pakistan time.');
    if(error.message.includes('Professional wording')) throw new Error(professionalWarning);
    if(error.message.includes('Money request')) throw new Error(moneyWarning);
    if(error.code==='42501') throw new Error('Your account must be approved before you can post.');
    throw new Error('We couldn’t confirm your post. Check the Feed before trying again to avoid a duplicate. Your draft is still here.');
  }
  } finally {clearTimeout(timeout);}
}
