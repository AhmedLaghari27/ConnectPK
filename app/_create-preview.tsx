import {ThemeModeContext} from '../constants/theme';
import {useLocalSearchParams} from 'expo-router';
import {useState} from 'react';
import {CreatePostView} from '../components/create-post-view';
import {validatePost, type PostDraft} from '../lib/post-form';
// Temporary visual QA fixture; it never reads or writes member data.
export default function CreatePreview() {
 const {mode}=useLocalSearchParams<{mode?:string}>();
 const [draft,setDraft]=useState<PostDraft>({post_type:'building',title:'',body:'',tags:'',city:''});
 const [discard,setDiscard]=useState<{leave:()=>void}|null>(null);
 return <ThemeModeContext.Provider value={mode==='dark'?'dark':'light'}><CreatePostView viewer={{full_name:'Ayesha Khan · Preview'}} saving={false} loading={false} approved remaining={3} error={null}
 draft={draft} errors={{}} validation={validatePost(draft)} discard={discard} setDiscard={setDiscard}
 close={()=>setDiscard({leave:()=>setDraft({post_type:'building',title:'',body:'',tags:'',city:''})})}
 publish={()=>{}} retry={()=>{}} change={(key,value)=>setDraft(old=>({...old,[key]:value}))} touch={()=>{}} fieldError={()=>undefined}/></ThemeModeContext.Provider>;
}
