import {useCallback,useState} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {supabase} from '../lib/supabase';

// Events invalidate our authorized query; event payloads never populate the UI directly.
export function useChatUpdates(refresh:()=>void,id?:string){
 const [live,setLive]=useState(false);
 useFocusEffect(useCallback(()=>{
  if(!supabase)return;
  const client=supabase;let active=true;
  const update=()=>{if(active&&AppState.currentState==='active')refresh();};
  const channel=client.channel(`chat-${id??'inbox'}`)
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',...(id?{filter:`conversation_id=eq.${id}`}:{})},update)
   .on('postgres_changes',{event:'*',schema:'public',table:'conversations',...(id?{filter:`id=eq.${id}`}:{})},update)
   .subscribe(status=>{if(active){setLive(status==='SUBSCRIBED');if(status==='SUBSCRIBED')update();}});
  // Covers reconnects and access revocation, which may not produce an authorized event.
  const timer=setInterval(update,15000);const listener=AppState.addEventListener('change',state=>{if(state==='active')update();});
  return ()=>{active=false;setLive(false);clearInterval(timer);listener.remove();void client.removeChannel(channel);};
 },[id,refresh]));
 return live;
}
