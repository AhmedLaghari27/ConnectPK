import { useState, type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../constants/theme';
import { chatSafety } from '../lib/chat-model';
import type { Notice } from '../lib/notification-model';

type Icon = ComponentProps<typeof Ionicons>['name'];
const noticeIcons:Record<Notice['type'],Icon>={new_comment:'chatbubble-outline',new_offer:'hand-left-outline',offer_accepted:'checkmark',offer_declined:'close',new_message:'mail-outline',moderation_warning:'shield-outline'};
export function NoticeAvatar({type}:{type:Notice['type']}) {
 const t=useTheme();
 return <View accessible={false} style={{width:t.avatar.medium,height:t.avatar.medium,borderRadius:t.radius.pill,backgroundColor:t.colors.surfaceMuted,justifyContent:'center',alignItems:'center'}}>
  <Ionicons name={type==='moderation_warning'?'shield-outline':'person-outline'} size={t.layout.icon} color={t.colors.textSecondary}/>
  <View style={{position:'absolute',bottom:0,end:0,padding:t.spacing.xs,backgroundColor:t.colors.primary,borderRadius:t.radius.pill,borderWidth:t.border.focus,borderColor:t.colors.surface}}><Ionicons name={noticeIcons[type]} size={t.spacing.compact} color={t.colors.onPrimary}/></View>
 </View>;
}
export function notificationGroup(value:string,now=new Date()) {
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const week=new Date(today);week.setDate(today.getDate()-((today.getDay()+6)%7));
 const date=new Date(value);
 return date>=today?'Today':date>=week?'This week':'Earlier';
}
// UI dismissal lasts for the current app session, across conversations.
let safetyDismissed=false;
export function ChatSafetyBanner(){
 const t=useTheme();const [visible,setVisible]=useState(!safetyDismissed);
 if(!visible)return null;
 return <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm,paddingStart:t.spacing.compact,backgroundColor:t.colors.warningSurface,borderRadius:t.radius.md}}>
  <Ionicons name="shield-checkmark-outline" size={t.layout.badge} color={t.colors.warning}/>
  <Text style={[t.typography.caption,{flex:1,color:t.colors.warning,paddingVertical:t.spacing.sm}]}>{chatSafety}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel="Dismiss safety reminder" onPress={()=>{safetyDismissed=true;setVisible(false);}} style={({pressed})=>({minWidth:t.layout.touch,minHeight:t.layout.touch,alignItems:'center',justifyContent:'center',opacity:pressed?0.6:1})}><Ionicons name="close" size={t.layout.badge} color={t.colors.warning}/></Pressable>
 </View>;
}
