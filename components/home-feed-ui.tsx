import { memo, useState, type ComponentProps } from 'react';
import { Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Avatar, Button, Divider, LoadingSkeleton } from './ui';
import { useTheme } from '../constants/theme';
import type { FeedPost, PostType } from '../lib/feed-model';

type Icon = ComponentProps<typeof Ionicons>['name'];
export const homePostLabels: Record<PostType, string> = {
  building: 'Building', career_step: 'Career Step', need_opinion: 'Need Opinion', need_help: 'Need Help', offering_help: 'Offering Help',
};
const typeIcons: Record<PostType, Icon> = { building: 'construct-outline', career_step: 'trending-up-outline', need_opinion: 'chatbubbles-outline', need_help: 'help-buoy-outline', offering_help: 'hand-left-outline' };
function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
export function FeedComposer({ name = 'Your profile', photo, onPress }: { name?: string; photo?: ImageSourcePropType; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Create a post. What are you building or working on?"
    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: t.spacing.compact, backgroundColor: t.colors.surface, padding: t.spacing.md, borderWidth: t.border.thin, borderColor: t.colors.border, borderRadius: t.radius.lg, opacity: pressed ? 0.7 : 1 })}>
    {photo ? <Avatar name={name} source={photo} size={t.avatar.medium} /> : <View accessibilityLabel="Your profile" style={{ width: t.avatar.medium, height: t.avatar.medium, borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="person-outline" size={24} color={t.colors.textSecondary} /></View>}
    <Text style={[t.typography.body, { color: t.colors.textSecondary, flex: 1 }]}>What are you building or working on?</Text>
    <Ionicons name="create-outline" size={t.layout.icon} color={t.colors.primary} />
  </Pressable>;
}
export type FeedCardActions = {
  onOpen: () => void; onProfile: () => void; onReaction: (type: 'useful' | 'inspiring' | 'support') => void;
  onComment: () => void; onOffer: () => void; onReport: () => void; onHide: () => void; onBlock: () => void;
};
export const HomeFeedCard = memo(function HomeFeedCard({ post, actions, actionHint, reaction: selectedReaction, pending = false, own = false, expanded = false, contentOnly = false }: { expanded?: boolean; contentOnly?: boolean; post: FeedPost; actions: FeedCardActions; actionHint?: string; reaction?: string | null; pending?: boolean; own?: boolean }) {
  const t = useTheme(); const [menu, setMenu] = useState(false); const [overflow, setOverflow] = useState(false);
  const palette = post.post_type === 'offering_help' ? { ink: t.colors.success, fill: t.colors.successSurface }
    : post.post_type === 'need_help' ? { ink: t.colors.warning, fill: t.colors.warningSurface }
    : { ink: t.colors.primary, fill: t.colors.primarySoft };
  const reactions: { key: 'useful' | 'inspiring' | 'support'; label: string; icon: Icon; count: number }[] = [
    { key: 'useful', label: 'Useful', icon: 'bulb-outline', count: post.useful_count },
    { key: 'inspiring', label: 'Inspiring', icon: 'sparkles-outline', count: post.inspiring_count },
    { key: 'support', label: 'Support', icon: 'hand-left-outline', count: post.support_count },
  ];
  return <View style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.lg, borderWidth: t.border.thin, borderColor: t.colors.border, padding: t.spacing.md, gap: t.spacing.md }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm }}>
      <Pressable onPress={actions.onProfile} accessibilityRole="button" accessibilityLabel={`View ${post.author_name}'s profile`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: t.spacing.compact, minHeight: 48 }}>
        <Avatar name={post.author_name} source={post.photoUrl ? { uri: post.photoUrl } : undefined} verified={post.author_verified} />
        <View style={{ flex: 1, gap: t.spacing.xs }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing.xs }}>
            <Text style={[t.typography.label, { color: t.colors.text }]}>{post.author_name}</Text>
            {post.author_verified ? <Ionicons name="checkmark-circle" size={16} color={t.colors.primary} accessibilityLabel="Verified member" /> : null}
          </View>
          <Text numberOfLines={2} style={[t.typography.caption, { color: t.colors.textSecondary }]}>{post.author_role || 'ConnectPK member'} · {post.city}</Text>
          <Text accessibilityLabel={new Date(post.created_at).toLocaleString()} style={[t.typography.caption, { color: t.colors.textSecondary }]}>{relativeTime(post.created_at)}</Text>
        </View>
      </Pressable>
      {!contentOnly ? <Pressable accessibilityRole="button" accessibilityLabel={`More options for ${post.title}`} accessibilityState={{expanded:menu}} onPress={() => setMenu(!menu)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="ellipsis-horizontal" size={24} color={t.colors.textSecondary} /></Pressable> : null}
    </View>
    <Pressable onPress={expanded ? undefined : actions.onOpen} accessibilityRole={expanded ? undefined : "button"} accessibilityLabel={expanded ? undefined : `Read post: ${post.title}`} disabled={expanded} style={{ gap: t.spacing.compact }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, alignSelf: 'flex-start', paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs, borderRadius: t.radius.pill, backgroundColor: palette.fill }}>
        <Ionicons name={typeIcons[post.post_type]} size={14} color={palette.ink} /><Text style={[t.typography.caption, { color: palette.ink, fontWeight: '600' }]}>{homePostLabels[post.post_type]}</Text>
      </View>
      <Text style={[t.typography.heading, { color: t.colors.text, fontWeight: '700' }]}>{post.title}</Text>
      <View>
        <Text numberOfLines={expanded ? undefined : 4} style={[t.typography.body, { color: t.colors.text }]}>{post.body}</Text>
        {!expanded ? <Text accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" onTextLayout={event => setOverflow(event.nativeEvent.lines.length > 4)} style={[t.typography.body, { position: 'absolute', width: '100%', opacity: 0 }]}>{post.body}</Text> : null}
      </View>
      {!expanded && (overflow || post.body.length >= 320) ? <Text style={[t.typography.label, { color: t.colors.primary }]}>Read more</Text> : null}
    </Pressable>
    {post.tags.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>{post.tags.map(tag => <View key={tag} style={{ backgroundColor: t.colors.surfaceMuted, borderRadius: t.radius.sm, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs }}><Text style={[t.typography.caption, { color: t.colors.textSecondary }]}>#{tag}</Text></View>)}</View> : null}
    {!contentOnly ? <>
    <Divider />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }}>
      {reactions.map(reaction => <Pressable key={reaction.key} accessibilityRole="button" accessibilityLabel={`${reaction.label}, ${reaction.count}`} accessibilityHint={actionHint} disabled={pending} accessibilityState={{disabled: pending, busy: pending, selected: selectedReaction === reaction.key}} onPress={() => actions.onReaction(reaction.key)}
        style={({ pressed }) => ({ flexGrow: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.xs, borderRadius: t.radius.sm, paddingHorizontal: t.spacing.xs, backgroundColor: pressed || selectedReaction === reaction.key ? t.colors.primarySoft : 'transparent', transform: [{ scale: pressed ? 0.96 : 1 }] })}>
        <Ionicons name={reaction.icon} size={19} color={t.colors.primary} /><Text style={[t.typography.caption, { color: t.colors.textSecondary }]}>{reaction.label} {reaction.count}</Text>
      </Pressable>)}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.sm }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Comment, ${post.comment_count} opinions`} onPress={actions.onComment} style={{ flexDirection: 'row', gap: t.spacing.sm, minHeight: 44, alignItems: 'center' }}>
        <Ionicons name="chatbubble-outline" size={20} color={t.colors.textSecondary} /><Text style={[t.typography.caption, { color: t.colors.textSecondary }]}>Comment · {post.comment_count}</Text>
      </Pressable>
      <Button label={`${own?'Offers':'Offer Help'} · ${post.offer_count}`} onPress={actions.onOffer} icon={<Ionicons name="add" size={18} color={t.colors.onPrimary} />} />
    </View>
    </> : null}
    {menu ? <View style={{ padding: t.spacing.md, gap: t.spacing.sm, backgroundColor: t.colors.surfaceMuted, borderRadius: t.radius.md }}>
      <Text accessibilityRole="header" style={[t.typography.label, { color: t.colors.text }]}>Post options</Text>
      {actionHint ? <Text style={[t.typography.caption, { color: t.colors.textSecondary }]}>{actionHint}</Text> : null}
      {(own ? [{ label: 'Hide post', run: actions.onHide }] : [{ label: 'Report post', run: actions.onReport }, { label: 'Hide post', run: actions.onHide }, { label: 'Block author', run: actions.onBlock }]).map(item => <Button key={item.label} label={item.label} variant="ghost" onPress={() => { setMenu(false); item.run(); }} />)}
      <Button label="Close menu" variant="secondary" onPress={() => setMenu(false)} />
    </View> : null}
  </View>;
});
export function FeedLoadingCard() {
  const t = useTheme();
  return <View accessible accessibilityLabel="Loading post" accessibilityState={{ busy: true }} style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing.md, gap: t.spacing.lg, borderWidth: t.border.thin, borderColor: t.colors.border }}>
    <View style={{ flexDirection: 'row', gap: t.spacing.compact }}><View style={{ width: t.avatar.medium, height: t.avatar.medium, borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceMuted }} /><View style={{ flex: 1 }}><LoadingSkeleton lines={2} /></View></View>
    <LoadingSkeleton lines={4} /><Divider /><LoadingSkeleton lines={1} />
  </View>;
}
