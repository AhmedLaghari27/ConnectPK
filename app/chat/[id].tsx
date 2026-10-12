import {ChatBubble} from '../../components/conversation-ui';
import {DetailButton as ActionButton,DetailButton as Button} from '../../components/post-detail-ui';
import {NavigationHeader, HeaderIcon} from '../../components/navigation-shell';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { Avatar } from '../../components/ui';
import { ChatSafetyBanner } from '../../components/activity-ui';
import {useCallback,useRef,useState} from 'react';
import {FlatList,KeyboardAvoidingView,Modal,Platform,ScrollView,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {EmailInput,ErrorMessage,LoadingSkeleton,useUiStyles} from '../../components/onboarding-ui';
import {useChatUpdates} from '../../components/use-chat-updates';
import {useTheme} from '../../constants/theme';
import {chatAction,chatPage,inbox,sendChat} from '../../lib/chat-service';
import {mergeMessages,validateMessage,type ChatMessage,type Conversation} from '../../lib/chat-model';

export default function ChatScreen(){
 const {id:raw}=useLocalSearchParams<{id:string}>();const id=typeof raw==='string'?raw:'';
 const t=useTheme();const s=useUiStyles();const [header,setHeader]=useState<Conversation|null>(null);
 const [rows,setRows]=useState<ChatMessage[]>([]);const rowsRef=useRef<ChatMessage[]>([]);
 const [loading,setLoading]=useState(true);const [reading,setReading]=useState(false);const [older,setOlder]=useState(false);
 const [error,setError]=useState<string|null>(null);const [actionError,setActionError]=useState<string|null>(null);
 const [body,setBody]=useState('');const [busy,setBusy]=useState(false);const [menu,setMenu]=useState(false);
 const [choice,setChoice]=useState<'block'|'leave'|null>(null);
 const pages=useRef(1);
 const active=useRef(false);const request=useRef<AbortController|null>(null);const write=useRef<AbortController|null>(null);
 const sending=useRef(false);const retryMessage=useRef<{body:string;nonce:string}|null>(null);const list=useRef<FlatList<ChatMessage>>(null);
 const load=useCallback(async(more=false)=>{
  if(!active.current)return;
  request.current?.abort();const controller=new AbortController();request.current=controller;setReading(true);
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
   if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id))throw new Error('Invalid conversation');
   const h=(await inbox(controller.signal,id))[0]??null;
   if(more)pages.current++;
   let page:ChatMessage[]=[];let hasOlder=false;
   if(h)for(let index=0;index<pages.current;index++){
    const chunk=await chatPage(id,controller.signal,page.at(-1));page=page.concat(chunk);hasOlder=chunk.length===50;if(!hasOlder)break;
   }
   if(active.current&&request.current===controller){
    setHeader(h);const next=h?mergeMessages([],page):[];
    setOlder(hasOlder);
    rowsRef.current=next;setRows(next);setError(null);
   }
  }catch{if(active.current&&request.current===controller){setHeader(null);rowsRef.current=[];setRows([]);setError('Couldn’t refresh this conversation. Check your connection and retry.');}}
  finally{clearTimeout(timer);if(active.current&&request.current===controller){setLoading(false);setReading(false);}}
 },[id]);
 const refresh=useCallback(()=>{void load();},[load]);
 useFocusEffect(useCallback(()=>{active.current=true;refresh();return()=>{active.current=false;request.current?.abort();write.current?.abort();};},[refresh]));
 const live=useChatUpdates(refresh,id);
 async function run(work:(signal:AbortSignal)=>Promise<void>){
  if(sending.current)return;
  sending.current=true;setBusy(true);setActionError(null);
  const controller=new AbortController();write.current=controller;const timer=setTimeout(()=>controller.abort(),15000);
  try{await work(controller.signal);}catch{if(active.current)setActionError('Couldn’t confirm that action. Your text is still here. Retry sending safely, or refresh the conversation.');}
  finally{clearTimeout(timer);sending.current=false;if(active.current){setBusy(false);refresh();}}
 }
 async function send(){
  if(!header||!validateMessage(body))return;
  const text=body.trim();
  if(retryMessage.current?.body!==text)retryMessage.current={body:text,nonce:`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`};
  const pending=retryMessage.current;
  await run(async signal=>{await sendChat(id,pending.body,pending.nonce,signal);if(active.current){setBody('');retryMessage.current=null;list.current?.scrollToOffset({offset:0,animated:true});}});
 }
 return <SafeAreaView style={{flex:1,backgroundColor:t.colors.background}}>
  <KeyboardAvoidingView style={{flex:1,maxWidth:t.layout.content,width:'100%',alignSelf:'center'}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
   <NavigationHeader title={header?.other_name??'Messages'} backLabel="Back to Messages" disabled={busy} onBack={()=>router.replace('../messages')}
    leading={header?<Avatar name={header.other_name} size={t.avatar.medium}/>:undefined}
    actions={header?<HeaderIcon name="ellipsis-horizontal" label="Conversation menu" disabled={busy} onPress={()=>{setMenu(true);setChoice(null);}}/>:undefined}/>
   <View style={{padding:t.spacing.md,gap:t.spacing.sm}}>
    {header?<View style={{padding:t.spacing.md,gap:t.spacing.xs,borderWidth:t.border.thin,borderColor:t.colors.border,borderRadius:t.radius.md,backgroundColor:t.colors.surface}}><Text style={[t.typography.caption,{color:t.colors.primary}]}>RELATED POST</Text><Text numberOfLines={2} style={s.label}>{header.post_title}</Text></View>:null}
    <ChatSafetyBanner/>
    <Text style={s.note}>{live?'Live updates connected':'Reconnecting · periodic refresh remains active'}</Text>
    <ErrorMessage message={error??actionError}/>{error?<ActionButton label="Retry" onPress={refresh}/>:null}
   </View>
   {loading?<LoadingSkeleton/>:!header&&!error?<Text style={[s.body,{padding:t.spacing.md}]}>This conversation has ended or is no longer available.</Text>:null}
   <Animated.FlatList itemLayoutAnimation={LinearTransition.duration(180).reduceMotion(ReduceMotion.System)} style={{flex:1}} keyboardShouldPersistTaps="handled" ref={list} inverted data={rows} keyExtractor={item=>item.id} contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.sm}}
    ListEmptyComponent={<View>{header&&!loading?<Text style={s.note}>Say hello and discuss how you can help.</Text>:null}</View>}
    ListFooterComponent={older&&header?<ActionButton secondary label="Load older messages" disabled={reading} onPress={()=>void load(true)}/>:null}
    renderItem={({item})=><ChatBubble item={item} incoming={item.sender_id===header?.other_id}/>} />
   {header?<View style={{padding:t.spacing.md,gap:t.spacing.sm,borderTopWidth:1,borderColor:t.colors.border}}>
    <View style={{flexDirection:'row',gap:t.spacing.sm,alignItems:'center'}}><EmailInput accessibilityLabel="Message" placeholder="Write a professional message…" multiline maxLength={4000} value={body} onChangeText={setBody} editable={!busy} style={{maxHeight:t.layout.multiline,minHeight:t.layout.control,paddingVertical:t.spacing.sm,minWidth:0,flex:1,borderRadius:t.radius.control,textAlignVertical:'top'}}/><Button label="Send" loading={busy} disabled={!validateMessage(body)} onPress={()=>void send()}/></View>
    <Text style={s.note}>{body.length}/4,000 · Text only</Text>
   </View>:null}
   {menu?<Modal transparent animationType="none" onRequestClose={()=>{if(!busy)setMenu(false);}}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined} style={{flex:1,justifyContent:'flex-end',backgroundColor:t.colors.scrim}}>
     <SafeAreaView style={{maxHeight:'90%',backgroundColor:t.colors.background}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:t.spacing.lg,gap:t.spacing.md}}>
      <Text style={s.label}>Conversation menu</Text><ErrorMessage message={actionError}/>
      {!choice?<>{(['block','leave'] as const).map(value=><ActionButton key={value} secondary label={value==='block'?'Block this person':'Leave conversation'} onPress={()=>setChoice(value)}/>)}</>:<>
       <Text style={s.body}>{choice==='block'?'Block this person? You won’t see each other or be able to chat.':'Leave this conversation? It ends for both people. Messages are retained for moderation.'}</Text>
       <ActionButton label="Confirm" loading={busy} onPress={()=>void run(async signal=>{
        await chatAction(id,choice,signal,header?.other_id);
        if(!active.current)return;
        setMenu(false);router.replace('../messages');
       })}/>
      </>}
      <ActionButton secondary label="Cancel" disabled={busy} onPress={()=>setMenu(false)}/>
     </ScrollView></SafeAreaView>
    </KeyboardAvoidingView>
   </Modal>:null}
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
