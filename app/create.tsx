import {CreatePostView} from '../components/create-post-view';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { usePreventRemove } from 'expo-router/react-navigation';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { validatePost, type PostDraft, type PostErrors } from '../lib/post-form';
import { loadFeedAccess } from '../lib/feed-service';
import { createPost, loadPostQuota } from '../lib/post-service';
import { getMember, myId } from '../lib/member-service';

export default function CreatePostScreen() {
  const navigation=useNavigation();
  const [viewer,setViewer]=useState<{full_name:string;photoUrl?:string}|null>(null);
  useFocusEffect(useCallback(()=>{
    let active=true; const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),15000);
    setViewer(null);
    void myId().then(id=>getMember(id,controller.signal)).then(member=>{
      if(active&&!controller.signal.aborted) setViewer(member?{full_name:member.full_name,photoUrl:member.photoUrl}:null);
    }).catch(()=>{if(active)setViewer(null);}).finally(()=>clearTimeout(timer));
    return ()=>{active=false;clearTimeout(timer);controller.abort();};
  },[]));
  const [discard,setDiscard]=useState<{leave:()=>void}|null>(null);
  const [touched,setTouched]=useState<Partial<Record<keyof PostDraft,boolean>>>({});
  const [draft,setDraft]=useState<PostDraft>({post_type:'building',title:'',body:'',tags:'',city:''});
  const [errors,setErrors]=useState<PostErrors>({});
  const [remaining,setRemaining]=useState<number|null>(null);
  const [approved,setApproved]=useState(false);
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [error,setError]=useState<string|null>(null); const [reload,setReload]=useState(0);
  const submitting=useRef(false);
  const published=useRef(false);
  useFocusEffect(useCallback(()=>{
    const controller=new AbortController(); let active=true;
    const timer=setTimeout(()=>controller.abort(),15000);
    setLoading(true);setRemaining(null);setError(null);
    (async()=>{
      try {
        const allowed=await loadFeedAccess(controller.signal);
        const quota=allowed?await loadPostQuota(controller.signal):0;
        if(active) {setApproved(allowed);setRemaining(quota);}
      } catch {if(active) setError('Couldn’t load your posting allowance. Check your connection and retry.');}
      finally {clearTimeout(timer);if(active) setLoading(false);}
    })();
    return ()=>{active=false;clearTimeout(timer);controller.abort();};
  },[reload]));
  function change(key:keyof PostDraft,value:string) {
    setDraft(previous=>({...previous,[key]:value}));setErrors(previous=>({...previous,[key]:undefined}));
  }
  async function publish() {
    if(submitting.current || !approved || !remaining) return;
    const found=validatePost(draft);setErrors(found);if(Object.keys(found).length) return;
    submitting.current=true;setSaving(true);setError(null);
    try {await createPost(draft);published.current=true;router.replace('/home');}
    catch(e) {
      if(e instanceof Error && e.message.includes('today’s 3 posts')) setRemaining(0);
      setError(e instanceof Error?e.message:'Couldn’t publish your post.');
    }
    finally {submitting.current=false;setSaving(false);}
  }
  const dirty=Boolean(draft.title||draft.body||draft.tags||draft.city||draft.post_type!=='building');
  const validation=validatePost(draft);
  usePreventRemove(dirty, ({data})=>{
    if(published.current){navigation.dispatch(data.action);return;}
    if(submitting.current)return;
    setDiscard({leave:()=>navigation.dispatch(data.action)});
  });
  useEffect(()=>{
    if(Platform.OS!=='web'||!dirty||saving)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return ()=>window.removeEventListener('beforeunload',warn);
  },[dirty,saving]);
  const fieldError=(key:keyof PostDraft)=>errors[key]??(touched[key]?validation[key]:undefined);
  return <CreatePostView viewer={viewer} saving={saving} loading={loading} approved={approved} remaining={remaining} error={error}
    draft={draft} errors={errors} validation={validation} discard={discard} setDiscard={setDiscard}
    close={()=>router.replace('/home')} publish={publish} retry={()=>setReload(n=>n+1)} change={change}
    touch={key=>setTouched(v=>({...v,[key]:true}))} fieldError={fieldError}/>;
}
