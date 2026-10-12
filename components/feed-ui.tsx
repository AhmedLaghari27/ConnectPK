import { FeedbackPressable as Pressable } from './ui/feedback-pressable';
import { router, usePathname } from 'expo-router';
import { memo, useState } from 'react';
import { Image, Pressable as NativePressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../constants/theme';
import { feedCopy as c } from '../constants/feed-copy';
import type { FeedPost } from '../lib/feed-model';

export function FilterChips({ options, selected, onSelect, label }: {
  options: { value: string; label: string }[]; selected: string; onSelect: (value: string) => void; label: string;
}) {
  const t = useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={label} contentContainerStyle={{ gap:t.spacing.sm,paddingVertical:t.spacing.xs }}>
    {options.map(option => <Pressable key={option.value} onPress={() => onSelect(option.value)} accessibilityRole="button"
      accessibilityLabel={option.label} accessibilityState={{ selected: selected === option.value }}
      style={({ pressed }) => ({ paddingHorizontal:t.spacing.md,minHeight:44,justifyContent:'center',borderRadius:t.radius.pill,
        borderWidth:1,borderColor:selected===option.value?t.colors.primary:t.colors.border,
        backgroundColor:selected===option.value?t.colors.primary:t.colors.surface,opacity:pressed?0.7:1 })}>
      <Text style={{ fontSize:t.fontSizes.small,color:selected===option.value?t.colors.onPrimary:t.colors.text }}>{option.label}</Text>
    </Pressable>)}
  </ScrollView>;
}
export const PostCard = memo(function PostCard({ post, detail = false, onOpen }: { post: FeedPost; detail?: boolean; onOpen?: () => void }) {
  const pathname=usePathname();
  const Content = onOpen ? NativePressable : View;
  const t = useTheme(); const [failedPhoto,setFailedPhoto]=useState(false);
  const meta = { fontSize:t.fontSizes.caption,color:t.colors.textSecondary,lineHeight:20 };
  return <View style={{ backgroundColor:t.colors.surface,borderWidth:1,borderColor:t.colors.border,borderRadius:t.radius.md,padding:t.spacing.md,gap:t.spacing.md }}>
    <NativePressable accessibilityRole="button" accessibilityLabel={`View ${post.author_name}’s profile`} onPress={event=>{event.stopPropagation();router.push({pathname:pathname.split('/').filter(Boolean).length>1?'../member/[id]':'./member/[id]',params:{id:post.author_id}});}} style={{ flexDirection:'row',gap:t.spacing.compact,alignItems:'center',minHeight:t.layout.control }}>
      {post.photoUrl && !failedPhoto ? <Image source={{uri:post.photoUrl}} onError={()=>setFailedPhoto(true)} accessibilityLabel={`${post.author_name} profile photo`}
        style={{width:t.avatar.medium,height:t.avatar.medium,borderRadius:t.radius.pill}} />
      : <View accessibilityLabel={`${post.author_name} profile photo unavailable`} style={{width:t.avatar.medium,height:t.avatar.medium,borderRadius:t.radius.pill,backgroundColor:t.colors.primarySoft,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:t.fontSizes.subtitle,color:t.colors.primary}}>{post.author_name.trim().slice(0,1).toUpperCase()}</Text>
      </View>}
      <View style={{flex:1,gap:t.spacing.xs}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:t.spacing.sm,flexWrap:'wrap'}}>
          <Text numberOfLines={1} style={{flexShrink:1,fontSize:t.fontSizes.body,fontWeight:'700',color:t.colors.text}}>{post.author_name}</Text>
          {post.author_verified ? <Text accessibilityLabel={c.verified} style={{color:t.colors.primary,fontWeight:'700'}}>✓</Text> : null}
        </View>
        <Text style={meta}>{post.author_role || c.roleFallback} · {post.city}</Text>
      </View>
    </NativePressable>
    <Content onPress={onOpen} accessibilityRole={onOpen ? 'button' : undefined} accessibilityLabel={onOpen ? `Open post: ${post.title}` : undefined} style={{gap:t.spacing.md}}>
    <View style={{alignSelf:'flex-start',paddingHorizontal:t.spacing.sm,paddingVertical:t.spacing.xs,backgroundColor:t.colors.primarySoft,borderRadius:t.radius.sm}}>
      <Text style={{fontSize:t.fontSizes.caption,color:t.colors.primary,fontWeight:'600'}}>{c.types[post.post_type]}</Text>
    </View>
    <Text accessibilityRole="header" style={{fontSize:t.fontSizes.subtitle,lineHeight:28,fontWeight:'600',color:t.colors.text}}>{post.title}</Text>
    <Text numberOfLines={detail ? undefined : 4} style={{fontSize:t.fontSizes.body,lineHeight:25,color:t.colors.textSecondary}}>{post.body}</Text>
    {post.tags.length ? <View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm}}>
      {post.tags.map((tag,i)=><Text key={`${tag}-${i}`} style={{...meta,color:t.colors.primary}}>#{tag}</Text>)}
    </View> : null}
    <View style={{borderTopWidth:StyleSheet.hairlineWidth,borderColor:t.colors.border,paddingTop:t.spacing.md,gap:t.spacing.sm}}>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:t.spacing.md}}>
        <Text style={meta}>{c.useful} {post.useful_count}</Text><Text style={meta}>{c.inspiring} {post.inspiring_count}</Text><Text style={meta}>{c.support} {post.support_count}</Text>
      </View>
      <Text style={meta}>{post.comment_count} {c.comments} · {post.offer_count} {c.offers}</Text>
    </View>
    </Content>
  </View>;
});
export { BottomNavigation as FeedTabs } from './navigation-shell';
