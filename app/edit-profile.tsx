import {NavigationHeader} from '../components/navigation-shell';
import { OnboardingFrame } from '../components/onboarding-frame';
import {useEffect,useRef,useState} from 'react';
import {Text} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {router} from 'expo-router';
import {ActionButton,CheckBox,ErrorMessage,LoadingSkeleton,useUiStyles} from '../components/onboarding-ui';
import {ProfileChoices,ProfileField,ProfilePhoto} from '../components/profile-fields';
import {getMember,myId,saveMember} from '../lib/member-service';
import {memberDraft,validateMember,type MemberDraft} from '../lib/member-model';
import {uploadProfilePhoto} from '../lib/profile-service';
export default function EditProfile(){
 const s=useUiStyles();const [form,setForm]=useState<MemberDraft|null>(null);const [photo,setPhoto]=useState<string>();const [loading,setLoading]=useState(true);const [attempt,setAttempt]=useState(0);
 const [busy,setBusy]=useState(false);const lock=useRef(false);const [error,setError]=useState<string|null>(null);const [errors,setErrors]=useState<Partial<Record<keyof MemberDraft,string>>>({});
 useEffect(()=>{let active=true;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);setLoading(true);setError(null);
 (async()=>{try{const p=await getMember(await myId(),controller.signal);if(!p)throw new Error();if(active){setForm(memberDraft(p));setPhoto(p.photoUrl);}}catch{if(active)setError('Couldn’t load your profile. Please retry.');}finally{clearTimeout(timer);if(active)setLoading(false);}})();return()=>{active=false;clearTimeout(timer);controller.abort();};},[attempt]);
 function update<K extends keyof MemberDraft>(key:K,value:MemberDraft[K]){setForm(old=>old?{...old,[key]:value}:null);setErrors(old=>({...old,[key]:undefined}));}
 async function pick(){if(lock.current)return;lock.current=true;setBusy(true);setError(null);try{
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:0.7,base64:true,exif:false});
  if(!result.canceled&&result.assets[0]){const path=await uploadProfilePhoto(result.assets[0],true);update('avatar_path',path);setPhoto(result.assets[0].uri);}
 }catch{setError('Couldn’t upload your photo. Choose a JPEG or PNG under 5 MB.');}finally{lock.current=false;setBusy(false);}}
 async function save(){if(!form||lock.current)return;const e=validateMember(form);setErrors(e);if(Object.keys(e).length)return;lock.current=true;setBusy(true);setError(null);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{await saveMember(form,controller.signal);router.replace('./profile');}catch{setError('Couldn’t save your profile. Check your fields and connection, then retry.');}finally{clearTimeout(timer);lock.current=false;setBusy(false);}}
 const field=(key:Exclude<keyof MemberDraft,'independent'>,label:string,max:number,multiline=false)=><ProfileField label={label} value={form?.[key]??''} onChangeText={value=>update(key,value)} maxLength={max} multiline={multiline} editable={!busy} error={errors[key]}/>;
 return <OnboardingFrame header={<NavigationHeader title="Edit profile" disabled={busy} onBack={()=>router.replace('./profile')}/>} title="Edit your profile" subtitle="Share your professional story. Only your city is shown publicly.">
  <ErrorMessage message={error}/>{loading?<LoadingSkeleton/>:!form?<ActionButton label="Retry" onPress={()=>setAttempt(n=>n+1)}/>:<>
   {photo?<ProfilePhoto uri={photo}/>:null}<ActionButton secondary label="Change photo" disabled={busy} onPress={pick}/><ErrorMessage message={errors.avatar_path??null}/>
   {field('full_name','Name',120)}{field('professional_role','Professional role',100)}
   <CheckBox label="I work independently" checked={form.independent} disabled={busy} onChange={()=>update('independent',!form.independent)}/>
   {!form.independent?field('organization','Organization',120):null}
   <ProfileChoices label="City" values={['Karachi','Lahore','Islamabad']} value={form.city} onChange={value=>update('city',value)} error={errors.city} disabled={busy}/>
   {field('skills','Skills (comma-separated)',810)}<Text style={s.note}>Up to 10 skills, 80 characters each.</Text>
   {field('vision','Personal vision',300,true)}{field('can_help','What I can help with',500,true)}
   <ActionButton label="Save profile" loading={busy} onPress={save}/>
  </>}
  <ActionButton secondary label="Cancel" disabled={busy} onPress={()=>router.replace('./profile')}/>
 </OnboardingFrame>;
}
