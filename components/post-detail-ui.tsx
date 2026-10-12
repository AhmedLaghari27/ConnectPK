import {useState, type PropsWithChildren, type Ref} from 'react';
import {ActivityIndicator, Pressable, Text, TextInput, View} from 'react-native';
import {Avatar} from './ui';
import {HeaderIcon} from './navigation-shell';
import {useTheme} from '../constants/theme';
export function DetailButton({label,onPress,secondary=false,disabled=false,loading=false}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;loading?:boolean}) {
 const t=useTheme();return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled||loading} onPress={onPress} style={({pressed})=>({minHeight:t.layout.control,paddingHorizontal:t.spacing.md,paddingVertical:t.spacing.sm,borderRadius:t.radius.control,backgroundColor:secondary?t.colors.surfaceMuted:t.colors.primary,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:t.spacing.sm,opacity:disabled||loading?t.opacity.disabled:pressed?t.opacity.pressed:1})}>{loading?<ActivityIndicator color={secondary?t.colors.primary:t.colors.onPrimary}/>:null}<Text style={[t.typography.label,{color:secondary?t.colors.primary:t.colors.onPrimary,flexShrink:1,textAlign:'center'}]}>{label}</Text></Pressable>;
}
export function DetailChip({label,onPress,selected,disabled}:{label:string;onPress:()=>void;selected?:boolean;disabled?:boolean}) {
 const t=useTheme();return <Pressable accessibilityRole="button" accessibilityLabel={label} aria-pressed={!!selected} accessibilityState={{selected,disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>({minHeight:t.layout.touch,maxWidth:'100%',justifyContent:'center',opacity:disabled?t.opacity.disabled:pressed?t.opacity.pressed:1})}><View style={{minHeight:t.layout.chip,paddingHorizontal:t.spacing.compact,paddingVertical:t.spacing.xs,borderRadius:t.radius.md,borderWidth:t.border.thin,borderColor:selected?t.colors.primary:t.colors.border,backgroundColor:selected?t.colors.primarySoft:t.colors.surface}}><Text style={[t.typography.small,{color:selected?t.colors.primary:t.colors.text}]}>{label}</Text></View></Pressable>;
}
export function DetailSegments({section,onChange,comments,offers}:{section:'opinions'|'offers';onChange:(value:'opinions'|'offers')=>void;comments:number;offers:number}) {
 const t=useTheme();return <View accessibilityRole="tablist" style={{flexDirection:'row',padding:t.spacing.xs,gap:t.spacing.xs,backgroundColor:t.colors.surfaceMuted,borderRadius:t.radius.md}}>{(['opinions','offers'] as const).map(value=><Pressable key={value} accessibilityRole="tab" aria-selected={section===value} accessibilityState={{selected:section===value}} onPress={()=>onChange(value)} style={({pressed})=>({flex:1,flexBasis:0,minWidth:0,minHeight:t.layout.control,padding:t.spacing.sm,alignItems:'center',justifyContent:'center',borderRadius:t.radius.control,backgroundColor:section===value?t.colors.surface:'transparent',opacity:pressed?t.opacity.pressed:1})}><Text style={[t.typography.small,{fontWeight:'600',textAlign:'center',color:section===value?t.colors.primary:t.colors.textSecondary}]}>{value==='opinions'?`Opinions · ${comments}`:`Offers · ${offers}`}</Text></Pressable>)}</View>;
}
export function OpinionRow({name,time,body,children}:PropsWithChildren<{name:string;time:string;body:string}>) {
 const t=useTheme();const [open,setOpen]=useState(false);
 return <View style={{padding:t.spacing.md,gap:t.spacing.sm,backgroundColor:t.colors.surface,borderRadius:t.radius.md}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm}}><Avatar name={name} size={t.avatar.small}/><View style={{flex:1,minWidth:0}}><Text numberOfLines={1} style={[t.typography.label,{color:t.colors.text}]}>{name}</Text><Text style={[t.typography.caption,{color:t.colors.textSecondary}]}>{new Date(time).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</Text></View><HeaderIcon name="ellipsis-horizontal" label={`Options for ${name}'s opinion`} onPress={()=>setOpen(!open)}/></View>
  <Text style={[t.typography.body,{color:t.colors.text}]}>{body}</Text>
  {open?<View style={{gap:t.spacing.sm}}>{children}</View>:null}
 </View>;
}

export function OpinionComposer({body,onChange,onSend,busy,syncing,error,inputRef}:{body:string;onChange:(text:string)=>void;onSend:()=>void;busy:boolean;syncing:boolean;error:string|null;inputRef?:Ref<TextInput>}) {
 const t=useTheme();return <View style={{borderTopWidth:t.border.thin,borderColor:t.colors.border,backgroundColor:t.colors.surface,flexShrink:0}}><View style={{padding:t.spacing.md,gap:t.spacing.sm,width:'100%',maxWidth:t.layout.content,alignSelf:'center'}}>
 <Text style={[t.typography.label,{color:t.colors.text}]}>Add your opinion</Text>
 <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm}}><TextInput ref={inputRef} accessibilityLabel="Add your opinion" multiline value={body} onChangeText={onChange} maxLength={2000} editable={!busy} placeholder="Share a helpful perspective…" placeholderTextColor={t.colors.textSecondary} selectionColor={t.colors.primary} style={[t.typography.body,{flex:1,minHeight:t.layout.control,maxHeight:t.layout.multiline,padding:t.spacing.compact,borderWidth:t.border.thin,borderColor:t.colors.border,borderRadius:t.radius.control,color:t.colors.text,backgroundColor:t.colors.surfaceMuted,textAlignVertical:'top'}]}/><DetailButton label="Send" disabled={busy||syncing||!body.trim()} loading={busy} onPress={onSend}/></View>
 <Text style={[t.typography.caption,{color:t.colors.textSecondary,textAlign:'right'}]}>{body.length}/2,000 characters</Text>{error?<Text accessibilityRole="alert" style={[t.typography.small,{color:t.colors.error}]}>{error}</Text>:null}
 </View></View>;
}
