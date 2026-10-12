import { useRef, type ComponentProps, type ReactNode } from 'react';
import { Image, Pressable, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../constants/theme';
import { useNotifications } from './notification-provider';

type Tab = 'feed' | 'search' | 'create' | 'notifications' | 'profile' | 'messages';
type Icon = ComponentProps<typeof Ionicons>['name'];
const tabs: { key: Tab; label: string; outline: Icon; filled: Icon; path: '/home' | './search' | '/create' | '/notifications' | '/profile' }[] = [
  { key: 'feed', label: 'Home', outline: 'home-outline', filled: 'home', path: '/home' },
  { key: 'search', label: 'Search', outline: 'search-outline', filled: 'search', path: './search' },
  { key: 'create', label: 'Create', outline: 'add', filled: 'add', path: '/create' },
  { key: 'notifications', label: 'Notifications', outline: 'notifications-outline', filled: 'notifications', path: '/notifications' },
  { key: 'profile', label: 'Profile', outline: 'person-outline', filled: 'person', path: '/profile' },
];
// The bar owns its bottom inset; tab screen hosts reserve top/side insets only.
export function BottomNavigation({ active = 'feed', onFeed }: { active?: Tab; onFeed: () => void }) {
  const { unread } = useNotifications();
  return <NavigationTabs active={active} unread={unread} onSelect={tab => {
    const selected = active === tab.key;
    if (tab.key === 'feed') onFeed();
    else if (!selected) { if (tab.key === 'create') router.push(tab.path); else router.replace(tab.path); }
  }} />;
}
export function NavigationTabs({ active, unread, onSelect }: { active: Tab; unread: number; onSelect: (tab: typeof tabs[number]) => void }) {
  const t = useTheme(); const insets = useSafeAreaInsets();
  return <View style={{ flexShrink: 0, backgroundColor: t.colors.surface, borderTopWidth: t.border.thin, borderColor: t.colors.border, paddingBottom: insets.bottom }}>
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', alignItems: 'stretch', alignSelf: 'center', width: '100%', maxWidth: t.layout.content, minHeight: t.layout.tabBar }}>
      {tabs.map(tab => {
        const selected = active === tab.key; const create = tab.key === 'create';
        return <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.key === 'notifications' ? `${tab.label}, ${unread} unread` : tab.label}
          accessibilityState={{ selected }} aria-selected={selected} onPress={() => onSelect(tab)}
          style={({ pressed }) => ({ flex: 1, flexBasis: 0, minWidth: 0, minHeight: t.layout.tabBar, paddingVertical: t.spacing.sm, alignItems: 'center', justifyContent: 'flex-start', gap: t.spacing.xs, opacity: pressed ? t.opacity.pressed : 1 })}>
          <View style={{ minHeight: t.layout.chip, width: t.layout.touch, justifyContent: 'center', alignItems: 'center', borderRadius: t.radius.control, backgroundColor: create ? t.colors.primary : 'transparent' }}>
            <Ionicons name={selected ? tab.filled : tab.outline} size={t.layout.icon} color={create ? t.colors.onPrimary : selected ? t.colors.primary : t.colors.textSecondary} />
            {tab.key === 'notifications' && unread > 0 ? <View style={{ position: 'absolute', top: 0, end: 0, minWidth: t.layout.badge, paddingHorizontal: t.spacing.xs, borderRadius: t.radius.pill, backgroundColor: t.colors.errorSurface, borderWidth: t.border.thin, borderColor: t.colors.error, alignItems: 'center' }}>
              <Text style={[t.typography.caption, { color: t.colors.error, fontWeight: '600' }]}>{unread > 99 ? '99+' : unread}</Text>
            </View> : null}
          </View>
          <Text style={[t.typography.caption, { maxWidth: '100%', textAlign: 'center', color: selected ? t.colors.primary : t.colors.textSecondary, fontWeight: '400' }]}>{tab.label}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
export function HeaderIcon({ name, label, onPress, disabled = false }: { name: Icon; label: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minWidth: t.layout.touch, minHeight: t.layout.touch, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.control, opacity: disabled ? t.opacity.disabled : pressed ? t.opacity.pressed : 1 })}>
    <Ionicons name={name} size={t.layout.icon} color={t.colors.text} />
  </Pressable>;
}
export function NavigationHeader({ title, onBack, backLabel = 'Back', disabled = false, actions, leading }: { title: string; onBack?: () => void; backLabel?: string; disabled?: boolean; actions?: ReactNode; leading?: ReactNode }) {
  const t = useTheme();
  return <View style={{ flexShrink: 0, backgroundColor: t.colors.surface, borderBottomWidth: t.border.thin, borderColor: t.colors.border }}>
    <View style={{ minHeight: t.layout.header, width: '100%', maxWidth: t.layout.content, alignSelf: 'center', paddingHorizontal: t.spacing.md, gap: t.spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
      {onBack ? <HeaderIcon name="chevron-back" label={backLabel} onPress={onBack} disabled={disabled} /> : null}{leading}
      <Text accessibilityRole="header" numberOfLines={1} style={[t.typography.title, { color: t.colors.text, flex: 1, minWidth: 0 }]}>{title}</Text>
      {actions ? <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>{actions}</View> : null}
    </View>
  </View>;
}
export function useCollapsingHeader() {
  const last = useRef(0); const hidden = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: 1 - hidden.value * 0.25 }));
  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = Math.max(0, event.nativeEvent.contentOffset.y);
    if (y < 20 || Math.abs(y - last.current) > 6) {
      hidden.value = withTiming(y > last.current && y > 60 ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.System });
      last.current = y;
    }
  }
  return { style, onScroll };
}
export function HomeNavigationHeader({ animation }: { animation: ReturnType<typeof useCollapsingHeader>['style'] }) {
  const t = useTheme();
  return <Animated.View style={[{flexShrink:0},animation]}>
    <NavigationHeader title="ConnectPK" leading={<Image source={require('../assets/logo.png')} accessibilityLabel="ConnectPK logo" style={{ width: t.avatar.small, height: t.avatar.small, borderRadius: t.radius.sm }} />}
      actions={<HeaderIcon name="chatbubble-ellipses-outline" label="Open messages" onPress={() => router.push('/messages')} />} />
  </Animated.View>;
}
export function BackNavigation({ label = 'Back', title = label }: { label?: string; title?: string }) {
  return <NavigationHeader title={title} backLabel={label} onBack={() => router.canGoBack() ? router.back() : router.replace('/home')} />;
}
