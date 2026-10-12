import {DetailButton as ActionButton, DetailChip as Chip, DetailSegments, OpinionRow, OpinionComposer} from '../../components/post-detail-ui';
import {NavigationHeader} from '../../components/navigation-shell';
import {ReportButton,BlockButton} from '../../components/moderation-actions';
import { OfferHelp } from '../../components/offer-help';
import { useCallback, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ErrorMessage, LoadingSkeleton, useUiStyles } from '../../components/onboarding-ui';
import { Divider } from '../../components/ui';
import { HomePostCard } from '../../components/home-post-card';
import { useTheme } from '../../constants/theme';
import type { FeedPost } from '../../lib/feed-model';
import { actOnPost, detailSnapshot, opinions, reactions, type DetailAction, type Opinion, type Reaction } from '../../lib/post-detail-service';

export default function PostDetailScreen() {
  const {id:raw}=useLocalSearchParams<{id:string}>(); const id=typeof raw==='string'?raw:'';
  const t=useTheme();const s=useUiStyles();
  const [post,setPost]=useState<FeedPost|null>(null);const [uid,setUid]=useState('');
  const [reaction,setReaction]=useState<Reaction|null>(null);const [comments,setComments]=useState<Opinion[]>([]);
  const [loading,setLoading]=useState(true);const [more,setMore]=useState(false);
  const [syncing,setSyncing]=useState(false);const [actionError,setActionError]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);const [error,setError]=useState<string|null>(null);
  const [body,setBody]=useState('');const [menu,setMenu]=useState(false);
  const [confirm,setConfirm]=useState<DetailAction|null>(null);
  const scroll=useRef<ScrollView>(null);
  const opinionInput=useRef<TextInput>(null);
  const [section,setSection]=useState<'opinions'|'offers'>('opinions');
  const mounted=useRef(false);const reading=useRef(false);const writing=useRef(false);const pages=useRef(1);const controller=useRef<AbortController|null>(null);
  const refresh=useCallback(async()=>{
    if(reading.current || writing.current) return;
    reading.current=true;setSyncing(true);const abort=new AbortController();controller.current=abort;
    const timer=setTimeout(()=>abort.abort(),15000);
    try {
      if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {setPost(null);return;}
      const snapshot=await detailSnapshot(id,abort.signal);
      let rows:Opinion[]=[];let hasMore=false;
      if(snapshot.post) for(let page=0;page<pages.current;page++) {
        const next=await opinions(id,abort.signal,rows.at(-1));rows=rows.concat(next);hasMore=next.length===50;if(!hasMore) break;
      }
      if(mounted.current&&controller.current===abort&&!abort.signal.aborted) {setPost(snapshot.post);setUid(snapshot.uid);setReaction(snapshot.reaction);setComments(rows);setMore(hasMore);setError(null);}
    } catch (failure) {if(mounted.current&&controller.current===abort) {
      setPost(null);setComments([]);
      const missing=typeof failure==='object'&&failure!==null&&'code' in failure&&failure.code==='PGRST202';
      setError(missing?'Post Detail setup is missing in Supabase. Apply the 20261006160000_post_detail.sql migration, then retry.':'Couldn’t refresh this post. Check your connection and retry.');
    }}
    finally {clearTimeout(timer);if(controller.current===abort){reading.current=false;if(mounted.current){setLoading(false);setSyncing(false);}}}
  },[id]);
  useFocusEffect(useCallback(()=>{
    mounted.current=true;void refresh();
    const interval=setInterval(()=>{if(AppState.currentState==='active')void refresh();},15000);
    const listener=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});
    return ()=>{mounted.current=false;controller.current?.abort();controller.current=null;reading.current=false;clearInterval(interval);listener.remove();};
  },[refresh]));
  async function perform(action:DetailAction) {
    if(writing.current||reading.current||!post) return;
    writing.current=true;setBusy(true);setActionError(null);
    try {
      await actOnPost(id,uid,action);
      if(!mounted.current)return;
      setConfirm(null);
      if(['block','hide','delete'].includes(action.kind)) {router.replace('/home');return;}
      if(action.kind==='comment')setBody('');
    } catch {if(mounted.current)setActionError('We couldn’t confirm that action. Refresh before retrying; your text is still here.');}
    finally {writing.current=false;if(mounted.current){setBusy(false);void refresh();}}
  }
  return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
      <NavigationHeader title="Post" backLabel="Back to Feed" disabled={busy||syncing} onBack={()=>router.replace('/home')}/>
      <ScrollView style={{flex:1}} ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center'}}>
        <ErrorMessage message={error??actionError}/>{error?<ActionButton label="Retry refresh" onPress={()=>void refresh()}/>:null}
        {loading?<LoadingSkeleton/>:!post&&!error?<Text style={s.body}>This post is no longer available to you.</Text>:null}
        {post?<>
          <HomePostCard post={post} expanded contentOnly actions={{
            onOpen:()=>{},onProfile:()=>router.push({pathname:'../member/[id]',params:{id:post.author_id}}),
            onReaction:value=>void perform({kind:'react',value,current:reaction}),
            onComment:()=>opinionInput.current?.focus(),onOffer:()=>setSection('offers'),
            onReport:()=>setMenu(true),onHide:()=>setConfirm({kind:'hide'}),onBlock:()=>setConfirm({kind:'block',author:post.author_id}),
          }}/>
          <ActionButton secondary label={menu?'Close post menu':'Post menu'} onPress={()=>setMenu(!menu)} disabled={busy||syncing}/>
          {menu?<View style={{gap:t.spacing.sm}}>
            {post.author_id!==uid?<ReportButton label="Report post" target={{kind:'post',id}} onReported={()=>void refresh()}/>:null}
            <ActionButton secondary label="Hide post for me" disabled={busy||syncing} onPress={()=>setConfirm({kind:'hide'})}/>
            {post.author_id===uid?<ActionButton secondary label="Delete my post" disabled={busy||syncing} onPress={()=>setConfirm({kind:'delete'})}/>:<ActionButton secondary label="Block author" disabled={busy||syncing} onPress={()=>setConfirm({kind:'block',author:post.author_id})}/>}
          </View>:null}
          {confirm?<View style={{gap:t.spacing.sm}}>
            <Text style={s.body}>{confirm.kind==='block'?'Block this author? You won’t see each other’s content.':confirm.kind==='hide'?'Hide this post from your Feed? Other members can still see it.':'Delete this content? It will no longer appear in the conversation.'}</Text>
            <ActionButton label="Confirm" loading={busy} onPress={()=>void perform(confirm)}/>
            <ActionButton secondary label="Cancel" disabled={busy||syncing} onPress={()=>setConfirm(null)}/>
          </View>:null}
          <Text style={s.label}>Your reaction · tap again to remove</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>
            {reactions.map(value=><Chip key={value} selected={reaction===value} disabled={busy||syncing} label={`${reaction===value?'✓ ':''}${value[0].toUpperCase()+value.slice(1)} ${post[`${value}_count`]}`} onPress={()=>void perform({kind:'react',value,current:reaction})}/>)}
          </View>
          <Divider/>
          <DetailSegments section={section} onChange={setSection} comments={post.comment_count} offers={post.offer_count}/>
          <View style={{display:section==='offers'?'flex':'none'}}><OfferHelp postId={id} owner={post.author_id===uid} typeChips/></View>
          <View style={{display:section==='opinions'?'flex':'none',gap:t.spacing.md}}>
          {!comments.length?<Text style={s.body}>No opinions yet. Start a useful conversation.</Text>:null}
          {comments.map(comment=><OpinionRow key={comment.id} name={comment.author_name} time={comment.created_at} body={comment.body}>
            {comment.author_id!==uid?<><ReportButton label="Report opinion" target={{kind:'comment',id:comment.id}}/><BlockButton memberId={comment.author_id}/></>:null}
            {comment.author_id===uid?<ActionButton secondary label="Delete my opinion" disabled={busy||syncing} onPress={()=>{setConfirm({kind:'deleteComment',id:comment.id});scroll.current?.scrollTo({y:0,animated:true});}}/>:null}
          </OpinionRow>)}
          {more?<ActionButton secondary label="Load more opinions" disabled={busy||syncing} onPress={()=>{pages.current++;void refresh();}}/>:null}
          </View>
          <Text style={s.note}>Updates every 15 seconds while this screen is active.</Text>
        </>:null}
      </ScrollView>
      {post&&section==='opinions'?<OpinionComposer body={body} onChange={setBody} busy={busy} syncing={syncing} error={actionError} inputRef={opinionInput} onSend={()=>void perform({kind:'comment',body})}/>:null}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
