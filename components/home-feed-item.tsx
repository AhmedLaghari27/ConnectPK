import { memo, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HomePostCard } from './home-post-card';
import { Button } from './ui';
import { ReportButton, BlockButton } from './moderation-actions';
import { OfferHelp } from './offer-help';
import { useTheme } from '../constants/theme';
import { actOnPost, detailSnapshot, type Reaction } from '../lib/post-detail-service';
import { myId } from '../lib/member-service';
import type { FeedPost } from '../lib/feed-model';

export const HomeFeedItem = memo(function HomeFeedItem({ post, viewerId, onHidden }: { post: FeedPost; viewerId?: string; onHidden: () => void }) {
  const t = useTheme(); const [shown, setShown] = useState(post); const [reaction, setReaction] = useState<Reaction | null>(null);
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>();
  const [panel, setPanel] = useState<'report' | 'block' | 'hide' | 'offer' | null>(null);
  const working = useRef(false); const active = useRef(true); const request = useRef<AbortController | null>(null);
  useEffect(() => { setShown(post); }, [post]);
  useEffect(() => { active.current = true; return () => { active.current = false; request.current?.abort(); }; }, []);
  const open = useCallback(() => router.push({ pathname: './post/[id]', params: { id: post.id } }), [post.id]);
  const react = useCallback(async (value: Reaction) => {
    if (working.current) return;
    working.current = true; setPending(true); setError(undefined);
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    let previous: Awaited<ReturnType<typeof detailSnapshot>> | undefined;
    try {
      // Resolve the current reaction first; never guess whether a tap inserts or removes.
      previous = await detailSnapshot(post.id, controller.signal);
      if (!active.current) return;
      if (!previous.post) { onHidden(); return; }
      const next = previous.reaction === value ? null : value;
      const optimistic = { ...previous.post };
      if (previous.reaction) optimistic[`${previous.reaction}_count`] = Math.max(0, optimistic[`${previous.reaction}_count`] - 1);
      if (next) optimistic[`${next}_count`]++;
      setShown(optimistic); setReaction(next);
      await actOnPost(post.id, previous.uid, { kind: 'react', value, current: previous.reaction });
      const fresh = await detailSnapshot(post.id, controller.signal);
      if (active.current) { if (fresh.post) { setShown(fresh.post); setReaction(fresh.reaction); } else onHidden(); }
    } catch {
      if (active.current) { if (previous?.post) { setShown(previous.post); setReaction(previous.reaction); } setError('Couldn’t confirm your reaction. Please refresh before trying again.'); }
    } finally { clearTimeout(timer); working.current = false; if (active.current) setPending(false); }
  }, [post.id, onHidden]);
  async function hide() {
    if (working.current) return;
    working.current = true; setPending(true); setError(undefined);
    try { await actOnPost(post.id, await myId(), { kind: 'hide' }); if (active.current) { setPanel(null); onHidden(); } }
    catch { if (active.current) setError('Couldn’t hide this post. Please try again.'); }
    finally { working.current = false; if (active.current) setPending(false); }
  }
  const actions = useMemo(() => ({ onOpen: open,
    onProfile: () => router.push({ pathname: './member/[id]' as const, params: { id: post.author_id } }),
    onReaction: (value: Reaction) => void react(value), onComment: open, onOffer: () => setPanel('offer'),
    onReport: () => setPanel('report'), onHide: () => setPanel('hide'), onBlock: () => setPanel('block') }), [open, post.author_id, react]);
  return <View style={{ gap: t.spacing.sm }}>
    <HomePostCard post={shown} reaction={reaction} pending={pending} own={viewerId === post.author_id} actions={actions} />
    {error ? <Text accessibilityRole="alert" style={[t.typography.caption, { color: t.colors.error }]}>{error}</Text> : null}
    <Modal visible={panel !== null} transparent animationType="none" onRequestClose={() => { if (!pending) setPanel(null); }}>
      <View style={{ flex: 1, backgroundColor: t.colors.scrim, justifyContent: 'flex-end' }}>
        <SafeAreaView edges={['bottom']} style={{ maxHeight: '90%', backgroundColor: t.colors.surface, borderTopStartRadius: t.radius.lg, borderTopEndRadius: t.radius.lg }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
            {panel === 'offer' ? <OfferHelp postId={post.id} owner={viewerId === post.author_id} /> : null}
            {panel === 'report' ? <ReportButton label="Report post" target={{ kind: 'post', id: post.id }} /> : null}
            {panel === 'block' ? <BlockButton memberId={post.author_id} /> : null}
            {panel === 'hide' ? <><Text style={[t.typography.body, { color: t.colors.text }]}>Hide this post from your feed? Other members can still see it.</Text><Button label="Confirm hide" loading={pending} onPress={() => void hide()} /></> : null}
            {error ? <Text accessibilityRole="alert" style={{ color: t.colors.error }}>{error}</Text> : null}
            <Button label="Close" variant="ghost" disabled={pending} onPress={() => setPanel(null)} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
});
