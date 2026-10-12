import Constants from 'expo-constants';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {supabase} from './supabase';
const storageKey='connectpk.push-registration';
export const canUsePush=Platform.OS!=='web'&&Constants.executionEnvironment!=='storeClient';
async function native(){return import('expo-notifications');}
async function registration():Promise<{token:string;userId:string}|null>{
 if(!canUsePush)return null;try{const raw=await SecureStore.getItemAsync(storageKey);if(!raw)return null;const data=JSON.parse(raw);return typeof data.token==='string'&&typeof data.userId==='string'?data:null;}catch{return null;}
}
async function setting(token:string,enabled:boolean){
 if(!supabase)throw new Error('Supabase is unavailable.');const c=new AbortController();const timer=setTimeout(()=>c.abort(),15000);
 try{const {error}=await supabase.rpc('set_device_push',{device_token:token,enable_push:enabled}).abortSignal(c.signal);if(error)throw new Error('Couldn’t update push settings. Check your connection and account approval.');}finally{clearTimeout(timer);}
}
export async function pushEnabled(){
 const stored=await registration();if(!stored||!supabase)return false;
 const {data:session}=await supabase.auth.getSession();if(session.session?.user.id!==stored.userId)return false;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 let enabled=false;try{const {data,error}=await supabase.rpc('my_device_push',{device_token:stored.token}).abortSignal(controller.signal);if(error)throw error;enabled=data===true;}finally{clearTimeout(timer);}
 const notifications=await native();const permission=await notifications.getPermissionsAsync();if(enabled&&!permission.granted)await setting(stored.token,false);return enabled&&permission.granted;
}
export async function setPushEnabled(enabled:boolean){
 if(!canUsePush)throw new Error('Push notifications need a development build on your phone. The in-app inbox works here.');
 if(!enabled){await unregisterPush();return;}
 if(!supabase)throw new Error('Supabase is unavailable.');
 const {data:session}=await supabase.auth.getSession();if(!session.session)throw new Error('Please sign in again.');
 const projectId=Constants.expoConfig?.extra?.eas?.projectId??Constants.easConfig?.projectId;
 if(!projectId)throw new Error('Link this app to EAS and rebuild before enabling push notifications.');
 const notifications=await native();
 if(Platform.OS==='android')await notifications.setNotificationChannelAsync('connectpk',{name:'ConnectPK',importance:notifications.AndroidImportance.DEFAULT});
 let permission=await notifications.getPermissionsAsync();if(!permission.granted)permission=await notifications.requestPermissionsAsync();
 if(!permission.granted)throw new Error('Allow notifications in your phone settings, then try again.');
 const token=(await notifications.getExpoPushTokenAsync({projectId})).data;
 // Persist before registering so sign-out can always remove this device association.
 await SecureStore.setItemAsync(storageKey,JSON.stringify({token,userId:session.session.user.id}));
 await setting(token,true);
}
export async function unregisterPush(){
 const stored=await registration();if(!stored)return;
 await setting(stored.token,false);await SecureStore.deleteItemAsync(storageKey);
 const notifications=await native();await notifications.dismissAllNotificationsAsync();
}
export async function observePush(onReceived:()=>void,onTap:()=>void){
 if(!canUsePush)return ()=>{};
 const notifications=await native();
 notifications.setNotificationHandler({handleNotification:async()=>({shouldPlaySound:false,shouldSetBadge:false,shouldShowBanner:false,shouldShowList:false})});
 const received=notifications.addNotificationReceivedListener(onReceived);
 const tapped=notifications.addNotificationResponseReceivedListener(()=>{onTap();void notifications.clearLastNotificationResponseAsync();});
 if(notifications.getLastNotificationResponse()){onTap();await notifications.clearLastNotificationResponseAsync();}
 return ()=>{received.remove();tapped.remove();};
}
