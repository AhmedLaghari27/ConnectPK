import {NavigationHeader} from '../../components/navigation-shell';
import { OnboardingFrame } from '../../components/onboarding-frame';
import {useEffect,useRef,useState} from 'react';
import {Text} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {ActionButton,ErrorMessage,LoadingSkeleton,useUiStyles} from '../../components/onboarding-ui';
import {ProfileChoices,ProfileField} from '../../components/profile-fields';
import {feedCopy} from '../../constants/feed-copy';
import {loadOwnPost,editOwnPost} from '../../lib/member-service';
import {parseTags,postCities,postKinds,postPrompts,validatePost,type PostDraft,type PostErrors} from '../../lib/post-form';
export default function EditPost(){
 const {id}=useLocalSearchParams<{id:string}>();const s=useUiStyles();const [form,setForm]=useState<PostDraft|null>(null);const [attempt,setAttempt]=useState(0);
 const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const lock=useRef(false);const [error,setError]=useState<string|null>(null);const [errors,setErrors]=useState<PostErrors>({});
 useEffect(()=>{let active=true;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);setLoading(true);setError(null);
 loadOwnPost(id,controller.signal).then(p=>{if(active)setForm(p);}).catch(()=>{if(active)setError('This post is unavailable or could not be loaded.');}).finally(()=>{clearTimeout(timer);if(active)setLoading(false);});return()=>{active=false;clearTimeout(timer);controller.abort();};},[id,attempt]);
 function change(key:keyof PostDraft,value:string){setForm(old=>old?{...old,[key]:value}:null);setErrors(old=>({...old,[key]:undefined}));}
 async function save(){if(!form||lock.current)return;const e=validatePost(form);setErrors(e);if(Object.keys(e).length)return;lock.current=true;setBusy(true);setError(null);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
 try{await editOwnPost(id,form,controller.signal);router.replace('../profile');}catch{setError('Couldn’t save this post. It may have been removed, or your connection changed.');}finally{clearTimeout(timer);lock.current=false;setBusy(false);}}
 return <OnboardingFrame header={<NavigationHeader title="Edit post" disabled={busy} onBack={()=>router.replace('../profile')}/>} title="Edit your post" subtitle="Updates keep the original post and its conversation history.">
  <ErrorMessage message={error}/>{loading?<LoadingSkeleton/>:!form?<ActionButton label="Retry" onPress={()=>setAttempt(n=>n+1)}/>:<>
   <ProfileChoices label="Post type" values={postKinds} labels={postKinds.map(k=>feedCopy.types[k])} value={form.post_type} onChange={value=>change('post_type',value)} disabled={busy} error={errors.post_type}/>
   <ProfileField label="Title" value={form.title} onChangeText={value=>change('title',value)} maxLength={160} error={errors.title} editable={!busy}/>
   <ProfileField label={postPrompts[form.post_type as keyof typeof postPrompts]} value={form.body} onChangeText={value=>change('body',value)} maxLength={5000} multiline error={errors.body} editable={!busy}/><Text style={s.note}>{form.body.length}/5,000 characters</Text>
   <ProfileField label="Tags" value={form.tags} onChangeText={value=>change('tags',value)} maxLength={250} error={errors.tags} editable={!busy}/><Text style={s.note}>{parseTags(form.tags).length}/5 tags</Text>
   <ProfileChoices label="City" values={postCities} value={form.city} onChange={value=>change('city',value)} error={errors.city} disabled={busy}/>
   <ActionButton label="Save changes" loading={busy} onPress={save}/>
  </>}
  <ActionButton secondary label="Cancel" disabled={busy} onPress={()=>router.replace('../profile')}/>
 </OnboardingFrame>;
}
