import { supabase } from './supabase';
import { parseFeedPosts, normalizeTag, type FeedCursor, type FeedFilters, type FeedPost } from './feed-model';
export async function loadFeed(filters: FeedFilters, cursor: FeedCursor | null, signal: AbortSignal): Promise<FeedPost[]> {
  if (!supabase) throw new Error('Unavailable');
  const { data, error } = await supabase.rpc('feed_page', {
    filter_type: filters.type, filter_city: filters.city, filter_tag: normalizeTag(filters.tag) || null,
    before_time: cursor?.time ?? null, before_id: cursor?.id ?? null,
  }).abortSignal(signal);
  if (error) throw error;
  const posts = parseFeedPosts(data);
  const paths = [...new Set(posts.map(p => p.author_photo).filter((p): p is string => Boolean(p)))];
  if (!paths.length || signal.aborted) return posts;
  // Profile photos only; verification evidence is never requested. Short URL lifetime limits stale access.
  const { data: photos } = await abortable(supabase.storage.from('profile-photos').createSignedUrls(paths,60),signal);
  const urls = new Map(photos?.map(p => [p.path,p.signedUrl]));
  return posts.map(p => ({ ...p, photoUrl: p.author_photo ? urls.get(p.author_photo) ?? undefined : undefined }));
}
export async function loadFeedAccess(signal: AbortSignal): Promise<boolean> {
  if (!supabase) throw new Error('Unavailable');
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Signed out');
  const [profile, verification] = await Promise.all([
    supabase.from('profiles').select('status').eq('id',sessionData.session.user.id).abortSignal(signal).single(),
    supabase.rpc('my_verification_status').abortSignal(signal),
  ]);
  if (profile.error || verification.error) throw new Error('Unavailable');
  return profile.data.status === 'approved' && verification.data === 'approved';
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve,reject)=>{
    const abort=()=>reject(new Error('Request timed out'));
    if(signal.aborted) { abort(); return; }
    signal.addEventListener('abort',abort,{once:true});
    promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));
  });
}

export async function visibleFeedIds(ids:string[],signal:AbortSignal):Promise<Set<string>>{
 if(!supabase)throw new Error('Unavailable');const visible=new Set<string>();
 for(let offset=0;offset<ids.length;offset+=100){
  const {data,error}=await supabase.from('posts').select('id').in('id',ids.slice(offset,offset+100)).eq('status','active').abortSignal(signal);
  if(error)throw error;for(const row of data??[])visible.add(row.id);
 }
 return visible;
}
