import {ReportButton} from './moderation-actions';
import type {ChatMessage} from '../lib/chat-model';
import {memo} from 'react';
import {Pressable,Text,View} from 'react-native';
import {Avatar} from './ui';
import {NoticeAvatar} from './activity-ui';
import {useTheme} from '../constants/theme';
import {notificationText,warningMessage,type Notice} from '../lib/notification-model';
import type {Conversation} from '../lib/chat-model';

export const NotificationRow=memo(function NotificationRow({item,disabled,onPress}:{item:Notice;disabled:boolean;onPress:()=>void}){
 const t=useTheme();return <Pressable accessibilityRole="button" disabled={disabled} accessibilityLabel={`${item.read_at?'Read':'Unread'}: ${notificationText[item.type]}`} onPress={onPress} style={({pressed})=>({padding:t.spacing.md,minHeight:t.avatar.hero,flexDirection:'row',gap:t.spacing.compact,alignItems:'center',backgroundColor:item.read_at?t.colors.surface:t.colors.primarySoft,borderRadius:t.radius.control,opacity:pressed?t.opacity.pressed:1})}>
  <NoticeAvatar type={item.type}/><View style={{flex:1,minWidth:0,gap:t.spacing.xs}}><Text style={[t.typography.body,{color:t.colors.text,fontWeight:item.read_at?'400':'600'}]}>{notificationText[item.type]}</Text>{warningMessage(item)?<Text style={[t.typography.small,{color:t.colors.textSecondary}]}>{warningMessage(item)}</Text>:null}</View>
  <View style={{alignItems:'flex-end',gap:t.spacing.sm}}><Text accessibilityLabel={new Date(item.created_at).toLocaleString()} style={[t.typography.caption,{color:t.colors.textSecondary}]}>{new Date(item.created_at).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</Text>{!item.read_at?<View accessibilityLabel="Unread" style={{width:t.spacing.sm,height:t.spacing.sm,borderRadius:t.radius.pill,backgroundColor:t.colors.primary}}/>:null}</View>
 </Pressable>;
});
export const ConversationRow=memo(function ConversationRow({item,onPress}:{item:Conversation;onPress:()=>void}){
 const t=useTheme();return <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${item.other_name} about ${item.post_title}`} onPress={onPress} style={({pressed})=>({padding:t.spacing.md,gap:t.spacing.compact,flexDirection:'row',alignItems:'center',backgroundColor:t.colors.surface,borderRadius:t.radius.control,opacity:pressed?t.opacity.pressed:1})}>
 <Avatar name={item.other_name} size={t.avatar.medium}/><View style={{flex:1,minWidth:0,gap:t.spacing.xs}}><View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm}}><Text numberOfLines={1} style={[t.typography.label,{flex:1,color:t.colors.text}]}>{item.other_name}</Text><Text style={[t.typography.caption,{color:t.colors.textSecondary}]}>{new Date(item.activity_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</Text></View><Text numberOfLines={1} style={[t.typography.body,{color:t.colors.textSecondary}]}>{item.last_message??'Start a useful conversation.'}</Text><Text numberOfLines={1} style={[t.typography.caption,{color:t.colors.primary}]}>{item.post_title}</Text></View>
 </Pressable>;
});

export function ChatBubble({item,incoming}:{item:ChatMessage;incoming:boolean}){const t=useTheme();return <View style={{alignSelf:incoming?'flex-start':'flex-end',maxWidth:'80%',backgroundColor:incoming?t.colors.surfaceMuted:t.colors.primary,padding:t.spacing.md,borderRadius:t.radius.md,gap:t.spacing.xs}}>
<Text selectable style={[t.typography.body,{color:incoming?t.colors.text:t.colors.onPrimary}]}>{item.body}</Text><Text accessibilityLabel={new Date(item.created_at).toLocaleString()} style={[t.typography.caption,{color:incoming?t.colors.textSecondary:t.colors.onPrimary,alignSelf:'flex-end'}]}>{new Date(item.created_at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</Text>{incoming?<ReportButton label="Report message" target={{kind:'message',id:item.id}}/>:null}</View>;}
