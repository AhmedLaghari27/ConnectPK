import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {AppState} from 'react-native';
import {router} from 'expo-router';
import {supabase} from '../lib/supabase';
import {unreadNotifications} from '../lib/notification-service';
import {observePush} from '../lib/push-notifications';
import {useAuth} from './auth-provider';
const Context=createContext({unread:0,revision:0,refresh:async()=>{}});
export const useNotifications=()=>useContext(Context);
export function NotificationProvider({children}:{children:ReactNode}){
 const {stage}=useAuth();const [user,setUser]=useState<string|null>(null);const [unread,setUnread]=useState(0);const [revision,setRevision]=useState(0);
 const pendingTap=useRef(false);const current=useRef(user);current.current=user;
 useEffect(()=>{if(!supabase)return;let alive=true;let changed=false;
  const {data}=supabase.auth.onAuthStateChange((_event,session)=>{changed=true;if(alive){setUser(session?.user.id??null);}});
  void supabase.auth.getSession().then(({data})=>{if(alive&&!changed)setUser(data.session?.user.id??null);});
  return()=>{alive=false;data.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{setUnread(0);},[user]);
 const refresh=useCallback(async()=>{if(!user||stage!=='home')return;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{const count=await unreadNotifications(controller.signal);if(current.current===user)setUnread(count);}catch{/* Retry on the next event or foreground refresh. */}finally{clearTimeout(timer);}
 },[user,stage]);
 useEffect(()=>{if(!user||stage!=='home'||!supabase)return;
  const update=()=>{void refresh();setRevision(v=>v+1);};update();
  const channel=supabase.channel(`notifications:${user}`).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${user}`},update).subscribe();
  const timer=setInterval(()=>{if(AppState.currentState==='active')update();},15000);
  const foreground=AppState.addEventListener('change',state=>{if(state==='active')update();});
  return()=>{clearInterval(timer);foreground.remove();void supabase?.removeChannel(channel);};
 },[user,stage,refresh]);
 useEffect(()=>{let disposed=false;let stop=()=>{};
  void observePush(()=>{void refresh();setRevision(v=>v+1);},()=>{pendingTap.current=true;if(stage==='home'){pendingTap.current=false;router.push('/notifications');}}).then(cleanup=>{if(disposed)cleanup();else stop=cleanup;}).catch(()=>{});
  if(stage==='home'&&pendingTap.current){pendingTap.current=false;router.push('/notifications');}
  return()=>{disposed=true;stop();};
 },[stage,refresh]);
 return <Context.Provider value={{unread,revision,refresh}}>{children}</Context.Provider>;
}
