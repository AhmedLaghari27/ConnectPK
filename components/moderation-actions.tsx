import {useRef,useState} from 'react';
import {KeyboardAvoidingView,Modal,Platform,ScrollView,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from 'expo-router';
import {ActionButton,ErrorMessage,useUiStyles} from './onboarding-ui';
import {ProfileChoices,ProfileField} from './profile-fields';
import {useTheme} from '../constants/theme';
import {reportCategories,validateReport,type ReportTarget} from '../lib/moderation-model';
import {blockMember,submitReport} from '../lib/moderation-service';
export function ReportButton({target,label,onReported}:{target:ReportTarget;label:string;onReported?:()=>void}){
 const t=useTheme();const s=useUiStyles();const [open,setOpen]=useState(false);const [category,setCategory]=useState('');const [description,setDescription]=useState('');
 const [busy,setBusy]=useState(false);const working=useRef(false);const [error,setError]=useState<string|null>(null);const [sent,setSent]=useState(false);
 async function send(){if(working.current)return;const invalid=validateReport(category,description);if(invalid){setError(invalid);return;}working.current=true;setBusy(true);setError(null);
  try{await submitReport(target,category,description);setOpen(false);setSent(true);setDescription('');onReported?.();}
  catch{setError('Couldn’t send the report. Check your connection; the content may no longer be available. Your description is still here.');}
  finally{working.current=false;setBusy(false);}
 }
 return <View style={{gap:t.spacing.sm}}><ActionButton secondary label={label} onPress={()=>{setSent(false);setError(null);setOpen(true);}}/>
  {sent?<Text accessibilityLiveRegion="polite" style={s.note}>Report received privately for moderator review. Thank you.</Text>:null}
  {open?<Modal transparent animationType="none" onRequestClose={()=>{if(!busy)setOpen(false);}}>
   <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,justifyContent:'flex-end',backgroundColor:t.colors.scrim}}>
    <SafeAreaView style={{maxHeight:'90%',width:'100%',maxWidth:t.layout.content,alignSelf:'center',backgroundColor:t.colors.background}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:t.spacing.lg,gap:t.spacing.md}}>
     <Text accessibilityRole="header" style={s.title}>{label}</Text><Text style={s.body}>Choose a category and describe what happened. Reports are visible only to moderators.</Text>
     <ProfileChoices label="Category" values={Object.keys(reportCategories)} labels={Object.values(reportCategories)} value={category} onChange={setCategory} disabled={busy}/>
     {category==='scam_fraud'?<Text style={s.note}>Scam or fraud reports are flagged as high severity for review.</Text>:null}
     <ProfileField label="Description" multiline maxLength={2000} value={description} onChangeText={setDescription} editable={!busy} placeholder="Tell us what concerns you about this content."/>
     <Text style={s.note}>{description.length}/2,000 characters</Text><ErrorMessage message={error}/>
     <ActionButton label="Send private report" loading={busy} disabled={!!validateReport(category,description)} onPress={()=>void send()}/>
     <ActionButton secondary label="Cancel" disabled={busy} onPress={()=>setOpen(false)}/>
    </ScrollView></SafeAreaView>
   </KeyboardAvoidingView>
  </Modal>:null}
 </View>;
}
export function BlockButton({memberId}:{memberId:string}){
 const s=useUiStyles();const [confirm,setConfirm]=useState(false);const [busy,setBusy]=useState(false);const working=useRef(false);const [error,setError]=useState<string|null>(null);
 async function block(){if(working.current)return;working.current=true;setBusy(true);setError(null);try{await blockMember(memberId);router.replace('/home');}catch{setError('Couldn’t block this person. Check your connection and try again.');}finally{working.current=false;setBusy(false);}}
 return <View><ActionButton secondary label="Block person" onPress={()=>setConfirm(true)}/>{confirm?<><Text style={s.body}>Block this person? You will no longer see each other’s profiles, posts, opinions, offers, or chats.</Text><ErrorMessage message={error}/><ActionButton label="Confirm block" loading={busy} onPress={()=>void block()}/><ActionButton secondary label="Cancel" disabled={busy} onPress={()=>setConfirm(false)}/></>:null}</View>;
}
