import {ProfileHeader,ProfileTabs} from './profile-header';
import {DetailButton as ActionButton} from './post-detail-ui';
import {NavigationHeader} from './navigation-shell';
import { Card } from './ui';
import {ReportButton,BlockButton} from './moderation-actions';
import {useCallback,useRef,useState} from 'react';
import {AppState,ScrollView,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,useFocusEffect} from 'expo-router';
import {ErrorMessage,LoadingSkeleton,useUiStyles} from './onboarding-ui';
import {FeedTabs,PostCard} from './feed-ui';
import {SignOutButton} from './sign-out-button';
import {useTheme} from '../constants/theme';
import {deleteOwnPost,getMember,memberPosts,myId,myOffers,type MyOffer} from '../lib/member-service';
import type {MemberProfile} from '../lib/member-model';
import type {FeedPost} from '../lib/feed-model';
import {offerLabels,offerStatusText,offerTypes} from '../lib/offer-model';

export function MemberProfileScreen({memberId}:{memberId?:string}){
 const own=memberId===undefined;const t=useTheme();const s=useUiStyles();
 const [self,setSelf]=useState(own);
 const [profile,setProfile]=useState<MemberProfile|null>(null);const [posts,setPosts]=useState<FeedPost[]>([]);const [offers,setOffers]=useState<MyOffer[]>([]);
 const [about,setAbout]=useState(false);
 const [section,setSection]=useState('posts');const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);
 const [more,setMore]=useState(false);const [busy,setBusy]=useState(false);const [deleting,setDeleting]=useState<string|null>(null);const [photoFailed,setPhotoFailed]=useState(false);
 const pages=useRef(1);const active=useRef(false);const request=useRef<AbortController|null>(null);const writing=useRef(false);
 const load=useCallback(async()=>{
  request.current?.abort();const controller=new AbortController();request.current=controller;const timer=setTimeout(()=>controller.abort(),15000);setLoading(true);
  try{
   const viewer=await myId();const id=memberId??viewer;const p=await getMember(id,controller.signal);let allPosts:FeedPost[]=[];let allOffers:MyOffer[]=[];let hasMore=false;
   if(p)for(let n=0;n<pages.current;n++){
    if(own&&section==='offers'){const page=await myOffers(controller.signal,allOffers.at(-1));allOffers=allOffers.concat(page);hasMore=page.length===20;}
    else{const page=await memberPosts(id,controller.signal,allPosts.at(-1));allPosts=allPosts.concat(page);hasMore=page.length===20;}
    if(!hasMore)break;
   }
   if(active.current&&request.current===controller){setSelf(id===viewer);setProfile(p);setPosts(allPosts);setOffers(allOffers);setMore(hasMore);setError(null);setPhotoFailed(false);}
  }catch{if(active.current&&request.current===controller){setProfile(null);setPosts([]);setOffers([]);setError('Couldn’t load this profile. Check your connection and retry.');}}
  finally{clearTimeout(timer);if(active.current&&request.current===controller)setLoading(false);}
 },[memberId,own,section]);
 useFocusEffect(useCallback(()=>{
  active.current=true;void load();
  const refresh=()=>{if(!writing.current&&AppState.currentState==='active')void load();};
  const timer=setInterval(refresh,15000);const listener=AppState.addEventListener('change',state=>{if(state==='active')refresh();});
  return()=>{active.current=false;clearInterval(timer);listener.remove();request.current?.abort();};
 },[load]));
 async function remove(id:string){
  if(writing.current)return;writing.current=true;setBusy(true);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{await deleteOwnPost(id,controller.signal);if(active.current){setDeleting(null);await load();}}
  catch{if(active.current)setError('Couldn’t delete the post. Please refresh and retry.');}
  finally{clearTimeout(timer);writing.current=false;if(active.current)setBusy(false);}
 }
 return <SafeAreaView edges={own?['top','left','right']:['top','bottom','left','right']} style={{flex:1,backgroundColor:t.colors.background}}>
  <NavigationHeader title={own?'My Profile':'Professional profile'} onBack={own?undefined:()=>{if(router.canGoBack())router.back();else router.replace('/home');}}/>
  <ScrollView style={{flex:1}} contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center'}}>

   <ErrorMessage message={error}/>{error?<ActionButton label="Retry" onPress={()=>void load()}/>:null}
   {loading&&!profile?<LoadingSkeleton/>:!profile&&!error?<Text style={s.body}>This profile is not available to you.</Text>:null}
   {profile?<>
    <ProfileHeader profile={profile} photoFailed={photoFailed} onPhotoError={()=>setPhotoFailed(true)} onEdit={own?()=>router.push('./edit-profile'):undefined}/>
    {!own&&!self?<View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}><ReportButton label="Report profile" target={{kind:'profile',id:profile.id}}/><BlockButton memberId={profile.id}/></View>:null}
    <ProfileTabs own={own} selected={about?'about':section} onSelect={tab=>{setAbout(tab==='about');if(tab!=='about'){pages.current=1;setSection(tab);}}}/>
    {about?<Card><Text style={s.label}>About {own?'you':profile.full_name}</Text><Text style={s.body}>{profile.professional_role||'Professional member'} · {profile.independent?'Independent':profile.organization||'Organization not added'}</Text><Text style={s.note}>{profile.city}</Text><Text style={s.label}>Personal vision</Text><Text style={s.body}>{profile.vision||'No vision added yet.'}</Text>{own?<SignOutButton/>:null}</Card>:<>
    {(own&&section==='offers')?<>
     {!offers.length&&!loading?<Text style={s.body}>You haven’t sent any visible offers yet.</Text>:null}
     {offers.map(offer=><View key={offer.id} style={{backgroundColor:t.colors.surface,borderRadius:t.radius.md,padding:t.spacing.md,gap:t.spacing.sm}}>
      <Text style={s.label}>{offer.post_title}</Text><Text style={s.note}>{offerLabels[offerTypes.indexOf(offer.offer_type)]} · {offer.status}</Text>
      <Text style={s.body}>{offer.message}</Text><Text style={s.note}>{offerStatusText[offer.status]}</Text>
      <ActionButton secondary label="View related post" onPress={()=>router.push({pathname:'./post/[id]',params:{id:offer.post_id}})}/>
     </View>)}
    </>:<>
     {!posts.length&&!loading?<Text style={s.body}>No active posts yet.</Text>:null}
     {posts.map(post=><View key={post.id} style={{gap:t.spacing.sm}}>
      <PostCard post={{...post,photoUrl:profile.photoUrl}}/>
      <ActionButton secondary label="Open post" onPress={()=>router.push({pathname:own?'./post/[id]':'../post/[id]',params:{id:post.id}})}/>
      {own?<><ActionButton secondary label="Edit post" disabled={busy} onPress={()=>router.push({pathname:'./edit-post/[id]',params:{id:post.id}})}/><ActionButton secondary label="Delete post" disabled={busy} onPress={()=>setDeleting(post.id)}/></>:null}
      {deleting===post.id?<><Text style={s.body}>Delete this post? It will no longer appear publicly.</Text><ActionButton label="Confirm deletion" loading={busy} onPress={()=>void remove(post.id)}/><ActionButton secondary label="Cancel" disabled={busy} onPress={()=>setDeleting(null)}/></>:null}
     </View>)}
    </>}
    {more?<ActionButton secondary label="Load more" disabled={loading||busy} onPress={()=>{pages.current++;void load();}}/>:null}
    </>}
   </>:null}
  </ScrollView>
  {own?<FeedTabs active="profile" onFeed={()=>router.replace('/home')}/>:null}
 </SafeAreaView>;
}
