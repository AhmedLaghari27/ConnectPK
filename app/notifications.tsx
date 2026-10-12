import {DetailButton as ActionButton} from '../components/post-detail-ui';
import {NotificationRow} from '../components/conversation-ui';
import {NavigationHeader} from '../components/navigation-shell';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { notificationGroup } from '../components/activity-ui';
import { EmptyState } from '../components/ui';
import {useCallback,useRef,useState} from 'react';
import {Switch,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,useFocusEffect} from 'expo-router';
import {FeedTabs} from '../components/feed-ui';
import {ErrorMessage,LoadingSkeleton,useUiStyles} from '../components/onboarding-ui';
import {useNotifications} from '../components/notification-provider';
import {useTheme} from '../constants/theme';
import {notificationDestination,type Notice} from '../lib/notification-model';
import {markRead,notificationPage} from '../lib/notification-service';
import {canUsePush,pushEnabled,setPushEnabled} from '../lib/push-notifications';
export default function NotificationsScreen(){
 const t=useTheme();const s=useUiStyles();const {revision,refresh,unread}=useNotifications();
 const [rows,setRows]=useState<Notice[]>([]);const [loading,setLoading]=useState(true);const [refreshing,setRefreshing]=useState(false);const [more,setMore]=useState(false);
 const [error,setError]=useState<string|null>(null);const [busy,setBusy]=useState(false);const [push,setPush]=useState(false);const [pushBusy,setPushBusy]=useState(true);const [pushError,setPushError]=useState<string|null>(null);
 const pages=useRef(1);const active=useRef(false);const request=useRef<AbortController|null>(null);
 const load=useCallback(async()=>{if(!active.current)return;request.current?.abort();const controller=new AbortController();request.current=controller;setRefreshing(true);const timer=setTimeout(()=>controller.abort(),15000);
  try{let all:Notice[]=[];let hasMore=false;for(let i=0;i<pages.current;i++){const page=await notificationPage(controller.signal,all.at(-1));all=all.concat(page);hasMore=page.length===20;if(!hasMore)break;}
   if(active.current&&request.current===controller){setRows([...new Map(all.map(n=>[n.id,n])).values()]);setMore(hasMore);setError(null);}}
  catch{if(active.current&&request.current===controller){setRows([]);setError('Couldn’t load notifications. Check your connection and retry.');}}
  finally{clearTimeout(timer);if(active.current&&request.current===controller){setLoading(false);setRefreshing(false);}}
 },[]);
 useFocusEffect(useCallback(()=>{active.current=true;void load();return()=>{active.current=false;request.current?.abort();};},[load,revision]));
 useFocusEffect(useCallback(()=>{let alive=true;setPushBusy(true);void pushEnabled().then(enabled=>{if(alive)setPush(enabled);}).catch(()=>{if(alive)setPushError('Couldn’t load push settings. Try again.');}).finally(()=>{if(alive)setPushBusy(false);});return()=>{alive=false;};},[]));
 async function read(item?:Notice,open=false){if(busy)return;setBusy(true);setError(null);try{await markRead(item?.id);setRows(old=>old.map(n=>!item||n.id===item.id?{...n,read_at:new Date().toISOString()}:n));await refresh();if(open&&item){const destination=notificationDestination(item);if(destination)router.push(destination);}}
  catch{setError('Couldn’t mark this as read. Please try again.');}finally{setBusy(false);}}
 async function toggle(value:boolean){if(pushBusy)return;setPushBusy(true);setPushError(null);try{await setPushEnabled(value);setPush(value);}catch(e){setPushError(e instanceof Error?e.message:'Couldn’t update push settings.');}finally{setPushBusy(false);}}
 return <SafeAreaView edges={['top','left','right']} style={{flex:1,backgroundColor:t.colors.background}}><NavigationHeader title="Notifications"/><Animated.FlatList style={{flex:1}} itemLayoutAnimation={LinearTransition.duration(180).reduceMotion(ReduceMotion.System)} data={rows} keyExtractor={n=>n.id} refreshing={refreshing} onRefresh={()=>{void load();void refresh();}}
  contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center',flexGrow:1}}
  ListHeaderComponent={<View style={{gap:t.spacing.md}}><Text style={s.body}>Opinions, offers, and conversations that involve you.</Text>
   <View style={{padding:t.spacing.md,borderRadius:t.radius.md,backgroundColor:t.colors.surface,gap:t.spacing.sm}}><View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.md}}><Text style={[s.label,{flex:1}]}>Push notifications on this device</Text><Switch hitSlop={8} accessibilityLabel="Push notifications on this device" value={push} disabled={!canUsePush||pushBusy} onValueChange={value=>void toggle(value)} trackColor={{true:t.colors.primary}}/></View>
    <Text style={s.note}>{canUsePush?'Receive private alerts even when ConnectPK is closed. Previews never include message text.':'Push needs an installed development build on your phone. Your in-app notifications work here.'}</Text><ErrorMessage message={pushError}/></View>
   <ErrorMessage message={error}/>{error?<ActionButton label="Retry" onPress={()=>void load()}/>:null}<ActionButton label="Mark all as read" secondary disabled={busy||unread===0} onPress={()=>void read()}/>
  </View>}
  ListEmptyComponent={<View>{loading?<LoadingSkeleton/>:!error?<EmptyState title="You’re all caught up" description="New opinions, offers, and messages will appear here."/>:null}</View>}
  renderItem={({item,index})=><View style={{gap:t.spacing.sm}}>
   {index===0||notificationGroup(rows[index-1].created_at)!==notificationGroup(item.created_at)?<Text accessibilityRole="header" style={[t.typography.subtitle,{color:t.colors.text,paddingTop:t.spacing.md,paddingBottom:t.spacing.sm}]}>{notificationGroup(item.created_at)}</Text>:null}
   <View style={{gap:t.spacing.sm}}><NotificationRow item={item} disabled={busy} onPress={()=>void read(item,true)}/>
   {!item.read_at?<ActionButton secondary label="Mark as read" disabled={busy} onPress={()=>void read(item)}/>:null}
  </View></View>}
  ListFooterComponent={more&&!error?<ActionButton secondary label="Load more notifications" disabled={refreshing} onPress={()=>{pages.current++;void load();}}/>:null}/><FeedTabs active="notifications" onFeed={()=>router.replace('/home')}/></SafeAreaView>;
}
