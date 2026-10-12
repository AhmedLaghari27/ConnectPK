import {HeaderIcon} from './navigation-shell';
import {ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Avatar, Badge, Input} from './ui';
import {useTheme} from '../constants/theme';
import {ErrorMessage, LoadingSkeleton, useUiStyles} from './onboarding-ui';
import {feedCopy} from '../constants/feed-copy';
import {postKinds, postCities, postPrompts, parseTags, type PostDraft, type PostErrors} from '../lib/post-form';

type Props = {
 viewer: {full_name:string;photoUrl?:string}|null; saving:boolean; loading:boolean; approved:boolean;
 remaining:number|null; error:string|null; draft:PostDraft; errors:PostErrors; validation:PostErrors;
 discard:{leave:()=>void}|null; setDiscard:(value:{leave:()=>void}|null)=>void;
 close:()=>void; publish:()=>void; retry:()=>void; change:(key:keyof PostDraft,value:string)=>void;
 touch:(key:keyof PostDraft)=>void; fieldError:(key:keyof PostDraft)=>string|undefined;
};
function Button({label,onPress,disabled=false,loading=false,variant,compact=false}:{label:string;onPress:()=>void;disabled?:boolean;loading?:boolean;variant?:'ghost';compact?:boolean}) {
 const t=useTheme();const inactive=disabled||loading;
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:inactive,busy:loading}} disabled={inactive} onPress={onPress} hitSlop={compact?t.spacing.xs:undefined} style={({pressed})=>({minWidth:t.layout.touch,minHeight:compact?t.avatar.medium:t.layout.control,height:compact?t.avatar.medium:undefined,paddingHorizontal:t.spacing.md,paddingVertical:compact?0:t.spacing.sm,borderRadius:compact?t.layout.badge:t.radius.control,flexDirection:'row',gap:t.spacing.sm,alignItems:'center',justifyContent:'center',backgroundColor:variant==='ghost'?t.colors.surfaceMuted:t.colors.primary,opacity:inactive?t.opacity.disabled:pressed?t.opacity.pressed:1})}>
  {loading?<ActivityIndicator color={t.colors.onPrimary}/>:null}<Text style={[t.typography.label,{color:variant==='ghost'?t.colors.primary:t.colors.onPrimary,textAlign:'center',flexShrink:1}]}>{label}</Text>
 </Pressable>;
}
function Chip({label,selected,disabled,onPress}:{label:string;selected:boolean;disabled:boolean;onPress:()=>void}) {
 const t=useTheme();return <Pressable accessibilityRole="button" accessibilityLabel={label} aria-pressed={selected} accessibilityState={{selected,disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>({minHeight:t.layout.touch,justifyContent:'center',opacity:disabled?t.opacity.disabled:pressed?t.opacity.pressed:1})}><View style={{minHeight:t.layout.chip,justifyContent:'center',paddingHorizontal:t.spacing.compact,paddingVertical:t.spacing.xs,borderRadius:t.radius.md,borderWidth:t.border.thin,borderColor:selected?t.colors.primary:t.colors.border,backgroundColor:selected?t.colors.primarySoft:t.colors.surface}}><Text style={[t.typography.small,{color:selected?t.colors.primary:t.colors.text}]}>{label}</Text></View></Pressable>;
}
export function CreatePostView({viewer,saving,loading,approved,remaining,error,draft,errors,validation,discard,setDiscard,close,publish,retry,change,touch,fieldError}:Props) {
 const s=useUiStyles();const t=useTheme();const insets=useSafeAreaInsets();
  return <View style={{flex:1,backgroundColor:t.colors.surface,paddingLeft:insets.left,paddingRight:insets.right,paddingBottom:insets.bottom}}>
    <View style={{paddingTop:insets.top,backgroundColor:t.colors.surface,zIndex:1,elevation:1,borderBottomWidth:t.border.thin,borderColor:t.colors.border}}>
      <View style={{height:t.layout.header,width:'100%',maxWidth:t.layout.content,alignSelf:'center',paddingHorizontal:t.spacing.md,flexDirection:'row',alignItems:'center',gap:t.spacing.sm}}>
        <HeaderIcon name="close" label="Close create post" disabled={saving} onPress={close}/>
        <Text accessibilityRole="header" numberOfLines={1} style={[t.typography.subtitle,{flex:1,minWidth:0,color:t.colors.text}]}>Create post</Text>
        <Button compact label="Post" loading={saving} disabled={loading||saving||!approved||!remaining||Object.keys(validation).length>0} onPress={publish}/>
      </View>
    </View>
    <KeyboardAvoidingView style={{flex:1}} keyboardVerticalOffset={insets.top+t.layout.header+t.border.thin} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{padding:t.spacing.md,gap:t.spacing.lg,width:'100%',maxWidth:t.layout.content,alignSelf:'center',paddingBottom:t.spacing.xxl}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.compact}}>
          <Avatar name={viewer?.full_name||'You'} size={t.avatar.medium} source={viewer?.photoUrl?{uri:viewer.photoUrl}:undefined}/><View style={{flex:1,gap:t.spacing.xs}}><Text numberOfLines={1} style={s.label}>{viewer?.full_name||'You'}</Text><Text style={[s.note,{textAlign:'left'}]}>Share with the ConnectPK community</Text></View>
        </View>
        {loading?<LoadingSkeleton/>:<>
          {remaining!==null?<Text accessibilityLiveRegion="polite" style={s.note}>{approved?`${remaining} of 3 posts remaining today. Resets at midnight Pakistan time.`:'Your account must be approved before you can post.'}</Text>:null}
          <ErrorMessage message={error}/>
          {remaining===null?<Button label="Retry" onPress={retry}/>:null}
          {approved&&remaining!==null?<>
            <View style={{gap:t.spacing.sm}}><Text style={s.label}>Post type</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{gap:t.spacing.sm,paddingVertical:t.spacing.xs}}>
              {postKinds.map(type=><Chip key={type} label={feedCopy.types[type]} selected={draft.post_type===type} disabled={saving} onPress={()=>change('post_type',type)}/>)}
            </ScrollView><ErrorMessage message={errors.post_type??null}/></View>
            <Input label="Title" placeholder={postPrompts[draft.post_type as keyof typeof postPrompts]} value={draft.title} onChangeText={v=>change('title',v)} onBlur={()=>touch('title')} maxLength={160} error={fieldError('title')} editable={!saving}/>
            <Text style={[s.note,{textAlign:'right',marginTop:-t.spacing.md}]}>{draft.title.length}/160 characters</Text>
            <Input label="Your story" placeholder={postPrompts[draft.post_type as keyof typeof postPrompts]+' Share useful context and what you hope happens next.'} multiline value={draft.body} onChangeText={v=>change('body',v)} onBlur={()=>touch('body')} maxLength={5000} error={fieldError('body')} editable={!saving} style={{minHeight:t.layout.multiline}}/>
            <Text style={[s.note,{textAlign:'right',marginTop:-t.spacing.md}]}>{draft.body.length}/5,000 characters</Text>
            <Input label="Tags (optional)" placeholder="design, startups, mentoring" value={draft.tags} onChangeText={v=>change('tags',v)} onBlur={()=>touch('tags')} maxLength={250} autoCapitalize="none" error={fieldError('tags')} editable={!saving} hint={`${parseTags(draft.tags).length}/5 tags · Separate tags with commas.`}/>
            {parseTags(draft.tags).length?<View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>{parseTags(draft.tags).map((tag,index)=><Badge key={`${tag}-${index}`} label={`#${tag}`}/>)}</View>:null}
            <View style={{gap:t.spacing.sm}}><Text style={s.label}>City</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>{postCities.map(city=><Chip key={city} label={city} selected={draft.city===city} disabled={saving} onPress={()=>change('city',city)}/>)}</View><ErrorMessage message={errors.city??null}/></View>
            {remaining===0?<Text style={s.note}>Daily limit reached. You can post again after midnight Pakistan time.</Text>:null}
          </>:null}
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
    <Modal transparent visible={discard!==null} animationType="none" onRequestClose={()=>setDiscard(null)}>
      <KeyboardAvoidingView style={{flex:1,backgroundColor:t.colors.scrim}} behavior={Platform.OS==='ios'?'padding':Platform.OS==='android'?'height':undefined}>
       <SafeAreaView style={{flex:1}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:t.spacing.md}}>
        <View accessibilityViewIsModal role="dialog" aria-label="Discard this draft?" style={{width:'100%',maxWidth:t.layout.content,alignSelf:'center',padding:t.spacing.md,gap:t.spacing.md,borderRadius:t.radius.md,backgroundColor:t.colors.surface}}>
          <Text accessibilityRole="header" style={s.label}>Discard this draft?</Text><Text style={s.body}>Your changes haven’t been posted. Leaving will discard them.</Text>
          <Button label="Keep writing" onPress={()=>setDiscard(null)}/><Button label="Discard draft" variant="ghost" onPress={()=>{const leave=discard?.leave;setDiscard(null);leave?.();}}/>
        </View>
       </ScrollView></SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}
