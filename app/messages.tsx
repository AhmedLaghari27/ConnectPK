import {ConversationRow} from '../components/conversation-ui';
import {DetailButton as ActionButton} from '../components/post-detail-ui';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { EmptyState } from '../components/ui';
import {useCallback,useRef,useState} from 'react';
import {Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,useFocusEffect} from 'expo-router';
import {ErrorMessage,LoadingSkeleton,useUiStyles} from '../components/onboarding-ui';
import {BackNavigation} from '../components/navigation-shell';
import {useChatUpdates} from '../components/use-chat-updates';
import {useTheme} from '../constants/theme';
import {inbox} from '../lib/chat-service';
import type {Conversation} from '../lib/chat-model';

export default function MessagesScreen(){
 const t=useTheme();const s=useUiStyles();
 const [rows,setRows]=useState<Conversation[]>([]);const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);
 const [more,setMore]=useState(false);const [error,setError]=useState<string|null>(null);
 const pages=useRef(1);const request=useRef<AbortController|null>(null);const active=useRef(false);
 const load=useCallback(async()=>{
  if(!active.current)return;
  request.current?.abort();const controller=new AbortController();request.current=controller;setRefreshing(true);
  const timer=setTimeout(()=>controller.abort(),15000);
  try {
   let all:Conversation[]=[];let hasMore=false;
   for(let i=0;i<pages.current;i++){const page=await inbox(controller.signal,undefined,all.at(-1));all=all.concat(page);hasMore=page.length===20;if(!hasMore)break;}
   if(active.current&&request.current===controller){setRows([...new Map(all.map(c=>[c.id,c])).values()]);setMore(hasMore);setError(null);}
  }catch{if(active.current&&request.current===controller){setRows([]);setError('Couldn’t load conversations. Check your connection and retry.');}}
  finally{clearTimeout(timer);if(active.current&&request.current===controller){setLoading(false);setRefreshing(false);}}
 },[]);
 useFocusEffect(useCallback(()=>{active.current=true;void load();return()=>{active.current=false;request.current?.abort();};},[load]));
 const live=useChatUpdates(load);
 return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}>
  <BackNavigation label="Back to Home" title="Messages"/>
  <Animated.FlatList style={{flex:1}} itemLayoutAnimation={LinearTransition.duration(180).reduceMotion(ReduceMotion.System)} data={rows} keyExtractor={item=>item.id} refreshing={refreshing} onRefresh={()=>void load()}
   contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center',flexGrow:1}}
   ListHeaderComponent={<View style={{gap:t.spacing.md}}><Text style={s.body}>Conversations opened through accepted offers.</Text><Text style={s.note}>{live?'Live updates connected':'Reconnecting · also refreshes every 15 seconds'}</Text><ErrorMessage message={error}/>{error?<ActionButton label="Retry" onPress={()=>void load()}/>:null}</View>}
   ListEmptyComponent={<View>{loading?<LoadingSkeleton/>:!error?<EmptyState title="Good conversations start with help" description="Accept an offer—or have yours accepted—to start chatting."/>:null}</View>}
   renderItem={({item})=><ConversationRow item={item} onPress={()=>router.push({pathname:'./chat/[id]',params:{id:item.id}})}/>}

   ListFooterComponent={more&&!error?<ActionButton secondary label="Load more conversations" disabled={refreshing} onPress={()=>{pages.current++;void load();}}/>:null}/>
 </SafeAreaView>;
}
