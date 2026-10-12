import {DetailButton as ActionButton, DetailChip as Chip} from './post-detail-ui';
import {NavigationHeader, HeaderIcon} from './navigation-shell';
import {ReportButton,BlockButton} from './moderation-actions';
import { useCallback, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ErrorMessage, LoadingSkeleton, useUiStyles } from './onboarding-ui';
import { Input } from './ui';
import { ProfileChoices, ProfileField } from './profile-fields';
import { useTheme } from '../constants/theme';
import { fundingWarning,offerLabels,offerStatusText,offerTypes,validateOffer,type Offer,type OfferProfile,type OfferType } from '../lib/offer-model';
import { decideOffer,loadOfferProfile,loadOffers,sendOffer } from '../lib/offer-service';

export function OfferSheet({title,close,children,disabled}:{title:string;close:()=>void;disabled:boolean}&PropsWithChildren) {
 const t=useTheme();const s=useUiStyles();
 return <Modal transparent animationType="none" onRequestClose={()=>{if(!disabled)close();}}>
   <KeyboardAvoidingView style={{flex:1,justifyContent:'flex-end',backgroundColor:t.colors.scrim}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
    <SafeAreaView style={{maxHeight:'90%',width:'100%',maxWidth:t.layout.content,alignSelf:'center',backgroundColor:t.colors.background,borderTopStartRadius:t.radius.lg,borderTopEndRadius:t.radius.lg}}>
     <NavigationHeader title={title} leading={<HeaderIcon name="close" label="Close sheet" disabled={disabled} onPress={close}/>}/>
     <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.md}}>
      {children}

     </ScrollView>
    </SafeAreaView>
   </KeyboardAvoidingView>
  </Modal>;
}
export function OfferHelp({postId,owner,typeChips=false}:{postId:string;owner:boolean;typeChips?:boolean}) {
 const t=useTheme();const s=useUiStyles();
 const [rows,setRows]=useState<Offer[]>([]);const [more,setMore]=useState(false);const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);const [error,setError]=useState<string|null>(null);const [actionError,setActionError]=useState<string|null>(null);
 const [sheet,setSheet]=useState(false);const [type,setType]=useState<OfferType>('advice');const [message,setMessage]=useState('');
 const [selected,setSelected]=useState<string|null>(null);const [profile,setProfile]=useState<OfferProfile|null>(null);
 const [confirmation,setConfirmation]=useState<{id:string;status:'accepted'|'declined'|'withdrawn'}|null>(null);
 const active=useRef(false);const reading=useRef(false);const writing=useRef(false);const pages=useRef(1);
 const readController=useRef<AbortController|null>(null);const actionController=useRef<AbortController|null>(null);
 const refresh=useCallback(async()=>{
   if(reading.current||writing.current)return;
   reading.current=true;const controller=new AbortController();readController.current=controller;
   const timer=setTimeout(()=>controller.abort(),15000);
   try {
    let all:Offer[]=[];let nextPage=false;
    for(let i=0;i<pages.current;i++){const page=await loadOffers(postId,controller.signal,all.at(-1));all=all.concat(page);nextPage=page.length===20;if(!nextPage)break;}
    if(active.current&&readController.current===controller){setRows(all);setMore(nextPage);setError(null);setSelected(current=>all.some(o=>o.id===current)?current:null);}
   } catch {if(active.current&&readController.current===controller){setRows([]);setSelected(null);setError('Couldn’t load offers. Please refresh before taking action.');}}
   finally {clearTimeout(timer);if(readController.current===controller){reading.current=false;if(active.current)setLoading(false);}}
 },[postId]);
 useFocusEffect(useCallback(()=>{
   active.current=true;void refresh();
   const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},15000);
   const listener=AppState.addEventListener('change',state=>{if(state==='active')void refresh();});
   return ()=>{active.current=false;clearInterval(timer);listener.remove();readController.current?.abort();readController.current=null;reading.current=false;actionController.current?.abort();};
 },[refresh]));
 async function action(work:(signal:AbortSignal)=>Promise<void>) {
   if(writing.current)return;
   writing.current=true;setBusy(true);setActionError(null);
   readController.current?.abort();readController.current=null;reading.current=false;
   const controller=new AbortController();actionController.current=controller;const timer=setTimeout(()=>controller.abort(),15000);
   try {await work(controller.signal);}catch(e){if(active.current)setActionError(e instanceof Error?e.message:'Couldn’t complete that action.');}
   finally {clearTimeout(timer);writing.current=false;if(active.current){setBusy(false);void refresh();}}
 }
 function openProfile(offer:Offer) {
   setSelected(offer.id);setProfile(null);
   void action(async signal=>{const result=await loadOfferProfile(offer.id,signal);if(active.current)setProfile(result);});
 }
 return <View style={{gap:t.spacing.md}}>
   <Text accessibilityRole="header" style={s.label}>{owner?'Offers':'Your offer'}</Text>
   {loading?<LoadingSkeleton/>:null}
   <ErrorMessage message={error??actionError}/>
   {error?<ActionButton secondary label="Refresh offers" disabled={busy} onPress={()=>void refresh()}/>:null}
   {!loading&&!error&&owner&&!rows.length?<Text style={s.body}>No offers yet. Relevant help will appear here privately.</Text>:null}
   {!loading&&!error&&!owner&&!rows.length?<ActionButton label="Offer Help" disabled={busy} onPress={()=>{setSheet(true);setActionError(null);}}/>:null}
   {rows.map(offer=><View key={offer.id} style={{backgroundColor:t.colors.surface,padding:t.spacing.md,borderRadius:t.radius.md,gap:t.spacing.sm}}>
     <Text style={s.label}>{offer.full_name} · {offerLabels[offerTypes.indexOf(offer.offer_type)]}</Text>
     <Text style={s.body}>{offer.message}</Text>{owner?<><ReportButton label="Report offer" target={{kind:'offer',id:offer.id}}/><BlockButton memberId={offer.offerer_id}/></>:null}
     {offer.offer_type==='funding_interest'?<Text style={s.note}>{fundingWarning}</Text>:null}
     <Text accessibilityLiveRegion="polite" style={s.note}>{owner?`Status: ${offer.status}`:offerStatusText[offer.status]}</Text>
     {owner?<ActionButton secondary label="View offerer’s profile" disabled={busy} onPress={()=>openProfile(offer)}/>:null}
     {offer.status==='pending'?owner?<>
       <ActionButton label="Accept" disabled={busy} onPress={()=>setConfirmation({id:offer.id,status:'accepted'})}/>
       <ActionButton secondary label="Decline" disabled={busy} onPress={()=>setConfirmation({id:offer.id,status:'declined'})}/>
     </>:<ActionButton secondary label="Withdraw offer" disabled={busy} onPress={()=>setConfirmation({id:offer.id,status:'withdrawn'})}/>:null}
     {confirmation?.id===offer.id?<>
       <Text style={s.body}>{confirmation.status==='accepted'?'Accept this offer? This opens a private conversation and notifies the offerer.':confirmation.status==='declined'?'Decline this offer? Only the offerer receives a polite notification.':'Withdraw this offer? You won’t be able to send another on this post.'}</Text>
       <ActionButton label="Confirm" loading={busy} onPress={()=>void action(async signal=>{await decideOffer(confirmation.id,confirmation.status,signal);if(active.current)setConfirmation(null);})}/>
       <ActionButton secondary label="Cancel" disabled={busy} onPress={()=>setConfirmation(null)}/>
     </>:null}
   </View>)}
   {more?<ActionButton secondary label="Load more offers" disabled={busy} onPress={()=>{pages.current++;void refresh();}}/>:null}
   {sheet?<OfferSheet title="Offer Help" disabled={busy} close={()=>setSheet(false)}>
     <Text style={s.body}>Your message is private to the post owner. One offer per post, up to 20 per day.</Text>
     {typeChips?<View style={{gap:t.spacing.sm}}><Text style={s.label}>How can you help?</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>{offerTypes.map((value,index)=><Chip key={value} label={offerLabels[index]} selected={type===value} onPress={()=>setType(value)} disabled={busy}/>)}</View></View>:<ProfileChoices label="How can you help?" values={offerTypes} labels={offerLabels} value={type} onChange={value=>setType(value as OfferType)} disabled={busy}/>}
     <Input style={{minHeight:t.layout.multiline}} label="Short message" multiline maxLength={1000} value={message} onChangeText={setMessage} editable={!busy} placeholder="Explain the specific help you can offer."/>
     <Text style={[s.note,{textAlign:'right'}]}>{message.length}/1,000 characters</Text>
     {type==='funding_interest'?<View accessibilityRole="alert" style={{backgroundColor:t.colors.warningSurface,padding:t.spacing.md,borderRadius:t.radius.control}}><Text style={[s.body,{color:t.colors.warning}]}>{fundingWarning}</Text></View>:null}
     <ErrorMessage message={actionError}/>
     <ActionButton label="Send offer" loading={busy} disabled={!!validateOffer(type,message)||!!error} onPress={()=>void action(async signal=>{await sendOffer(postId,type,message,signal);if(active.current){setSheet(false);setMessage('');}})}/>
   </OfferSheet>:null}
   {selected?<OfferSheet title="Professional profile" disabled={busy} close={()=>setSelected(null)}>
     {busy?<LoadingSkeleton/>:profile?<>
       <Text style={s.label}>{profile.full_name}{profile.verified?' · Verified':''}</Text>
       <Text style={s.body}>{profile.headline||'Professional member'} · {profile.city}</Text>
       <Text style={s.body}>{profile.bio||'No professional summary added yet.'}</Text>
       <ActionButton secondary label="Open public profile" onPress={()=>{setSelected(null);router.push({pathname:'../member/[id]',params:{id:profile.id}});}}/>
     </>:<Text style={s.body}>This profile is unavailable.</Text>}
     <ErrorMessage message={actionError}/>
   </OfferSheet>:null}
 </View>;
}
