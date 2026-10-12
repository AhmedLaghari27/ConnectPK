import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Avatar, Divider } from './ui';
import { useTheme } from '../constants/theme';
import type { FeedPost } from '../lib/feed-model';
import { homePostLabels, type FeedCardActions } from './home-feed-ui';

export function FeedButton({ label, onPress, primary = false, disabled = false }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: t.layout.touch, paddingHorizontal: t.spacing.compact, paddingVertical: t.spacing.sm, borderRadius: t.radius.control, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? t.colors.primary : t.colors.surfaceMuted, opacity: disabled ? t.opacity.disabled : pressed ? t.opacity.pressed : 1 })}>
    <Text style={[t.typography.small, { color: primary ? t.colors.onPrimary : t.colors.primary, textAlign: 'center', fontWeight: '600' }]}>{label}</Text>
  </Pressable>;
}
function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  return minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : minutes < 10080 ? `${Math.floor(minutes / 1440)}d` : new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
export const HomePostCard = memo(function HomePostCard({ post, actions, reaction, pending = false, own = false, expanded = false, contentOnly = false }: {
  post: FeedPost; actions: FeedCardActions; reaction?: string | null; pending?: boolean; own?: boolean; expanded?: boolean; contentOnly?: boolean;
}) {
  const t = useTheme(); const [menu, setMenu] = useState(false); const [fullHeight, setFullHeight] = useState(0); const [visibleHeight, setVisibleHeight] = useState(0);
  const overflow = fullHeight > visibleHeight + t.border.thin;
  const s = useMemo(() => StyleSheet.create({
    card: { padding: t.spacing.md, gap: t.spacing.compact, borderRadius: t.radius.md, borderWidth: t.border.thin, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
    profile: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, minHeight: t.layout.touch },
    author: { flex: 1, minWidth: 0, gap: t.spacing.xs },
    name: { ...t.typography.label, color: t.colors.text, flexShrink: 1 },
    meta: { ...t.typography.caption, color: t.colors.textSecondary },
    title: { ...t.typography.subtitle, color: t.colors.text },
    body: { ...t.typography.body, color: t.colors.text },
    content: { gap: t.spacing.compact },
    measure: { position: 'absolute', width: '100%', opacity: 0, pointerEvents: 'none' },
    iconButton: { minWidth: t.layout.touch, minHeight: t.layout.touch, alignItems: 'center', justifyContent: 'center' },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
    tag: { maxWidth: '100%', backgroundColor: t.colors.surfaceMuted, borderRadius: t.radius.sm, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs },
    reaction: { flex: 1, minWidth: 0, minHeight: t.layout.touch, alignItems: 'center', justifyContent: 'center', gap: t.spacing.xs, paddingVertical: t.spacing.xs, borderRadius: t.radius.control },
    reactionText: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
    lowerAction: { flex: 1, minWidth: 0 },
    menu: { gap: t.spacing.sm, padding: t.spacing.md, borderRadius: t.radius.control, backgroundColor: t.colors.surfaceMuted },
  }), [t]);
  const tone = post.post_type === 'offering_help' ? 'success' : post.post_type === 'need_help' ? 'warning' : 'primary';
  const fill = tone === 'primary' ? t.colors.primarySoft : t.colors[`${tone}Surface`];
  const items = [
    { key: 'useful', label: 'Useful', icon: 'bulb-outline', count: post.useful_count },
    { key: 'inspiring', label: 'Inspiring', icon: 'sparkles-outline', count: post.inspiring_count },
    { key: 'support', label: 'Support', icon: 'hand-left-outline', count: post.support_count },
  ] as const;
  return <View style={s.card}>
    <View style={s.row}>
      <Pressable onPress={actions.onProfile} accessibilityRole="button" accessibilityLabel={`View ${post.author_name}'s profile`} style={({ pressed }) => [s.profile, pressed && { opacity: t.opacity.pressed }]}>
        <Avatar name={post.author_name} size={t.avatar.medium} source={post.photoUrl ? { uri: post.photoUrl } : undefined}/>
        <View style={s.author}><View style={s.row}><Text numberOfLines={1} style={s.name}>{post.author_name}</Text>{post.author_verified ? <Ionicons name="checkmark-circle" size={t.layout.badge} color={t.colors.primary} accessibilityLabel="Verified member"/> : null}</View>
          <Text numberOfLines={1} style={s.meta}>{post.author_role || 'ConnectPK member'} · {post.city}</Text>
        </View>
      </Pressable>
      <Text accessibilityLabel={new Date(post.created_at).toLocaleString()} style={s.meta}>{timeAgo(post.created_at)}</Text>
    </View>
    <View style={s.row}><View style={{ flex: 1, minWidth: 0 }}><Text style={[s.meta, { alignSelf: 'flex-start', color: t.colors[tone], backgroundColor: fill, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs, borderRadius: t.radius.sm, fontWeight: '600' }]}>{homePostLabels[post.post_type]}</Text></View>
      {!contentOnly?<Pressable accessibilityRole="button" accessibilityLabel={`More options for ${post.title}`} accessibilityState={{ expanded: menu }} onPress={() => setMenu(!menu)} style={({ pressed }) => [s.iconButton, pressed && { opacity: t.opacity.pressed }]}><Ionicons name="ellipsis-horizontal" size={t.layout.icon} color={t.colors.textSecondary}/></Pressable>:null}
    </View>
    <Pressable accessibilityRole={expanded?undefined:"button"} accessibilityLabel={expanded?undefined:`Read post: ${post.title}`} onPress={expanded?undefined:actions.onOpen} disabled={expanded} style={({ pressed }) => [s.content, pressed && { opacity: t.opacity.pressed }]}>
      <Text style={s.title}>{post.title}</Text>
      <View><Text numberOfLines={expanded?undefined:4} onLayout={event=>setVisibleHeight(event.nativeEvent.layout.height)} style={s.body}>{post.body}</Text>{!expanded?<Text aria-hidden={true} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLayout={event => setFullHeight(event.nativeEvent.layout.height)} style={[s.body, s.measure]}>{post.body}</Text>:null}</View>
      {!expanded && overflow ? <Text style={[t.typography.small, { color: t.colors.primary, fontWeight: '600' }]}>Read more</Text> : null}
    </Pressable>
    {post.tags.length ? <View style={s.tags}>{post.tags.map(tag => <View key={tag} style={s.tag}><Text style={s.meta}>#{tag}</Text></View>)}</View> : null}
    {!contentOnly?<>
    <Divider/>
    <View style={s.row}>{items.map(item => <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`${item.label}, ${item.count}`} disabled={pending} accessibilityState={{ disabled: pending, busy: pending, selected: reaction === item.key }} onPress={() => actions.onReaction(item.key)} style={({ pressed }) => [s.reaction, { backgroundColor: pressed || reaction === item.key ? t.colors.primarySoft : 'transparent', opacity: pending ? t.opacity.disabled : 1 }]}>
      <Ionicons name={item.icon} size={t.layout.icon} color={t.colors.primary}/><Text style={s.reactionText}>{item.label} {item.count}</Text>
    </Pressable>)}</View>
    <View style={s.row}><View style={s.lowerAction}><FeedButton label={`Comment · ${post.comment_count}`} onPress={actions.onComment}/></View><View style={s.lowerAction}><FeedButton primary label={`${own ? 'Offers' : 'Offer Help'} · ${post.offer_count}`} onPress={actions.onOffer}/></View></View>
    </>:null}
    {menu ? <View style={s.menu}><Text style={s.name}>Post options</Text>{(own ? [{ label: 'Hide post', run: actions.onHide }] : [{ label: 'Report post', run: actions.onReport }, { label: 'Hide post', run: actions.onHide }, { label: 'Block author', run: actions.onBlock }]).map(item => <FeedButton key={item.label} label={item.label} onPress={() => { setMenu(false); item.run(); }}/>) }<FeedButton label="Close menu" onPress={() => setMenu(false)}/></View> : null}
  </View>;
});
