import { FeedbackPressable as Pressable } from './feedback-pressable';
import { useId, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Text, TextInput, View, type ImageSourcePropType, type PressableProps, type StyleProp, type TextInputProps, type ViewProps, type ViewStyle } from 'react-native';
import { theme, useTheme } from '../../constants/theme';

type Tone = 'neutral' | 'success' | 'warning' | 'error';
function useTone(tone: Tone) {
  const { colors: c } = useTheme();
  return tone === 'neutral' ? { ink: c.textSecondary, fill: c.surfaceMuted } : { ink: c[tone], fill: c[`${tone}Surface`] };
}
export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string; variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean; icon?: ReactNode;
};
export function Button({ label, variant = 'primary', loading = false, disabled, icon, style, accessibilityState, ...props }: ButtonProps) {
  const t = useTheme(); const [focused, setFocused] = useState(false); const inactive = disabled || loading;
  const color = variant === 'primary' ? t.colors.onPrimary : t.colors.primary;
  return <Pressable {...props} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel ?? label}
    accessibilityState={{ ...accessibilityState, disabled: !!inactive, busy: loading }} disabled={inactive}
    onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    style={state => [{ minHeight: t.layout.control, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm,
      borderRadius: t.radius.control, borderWidth: t.border.thin, borderColor: focused ? t.colors.focus : variant === 'secondary' ? t.colors.border : 'transparent',
      backgroundColor: variant === 'primary' ? t.colors.primary : variant === 'secondary' ? t.colors.surface : 'transparent',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm, opacity: inactive ? t.opacity.disabled : state.pressed ? t.opacity.pressed : 1 },
      typeof style === 'function' ? style(state) : style]}>
    {loading ? <ActivityIndicator color={color} /> : icon}
    <Text style={[t.typography.label, { color, textAlign: 'center', flexShrink: 1 }]}>{label}</Text>
  </Pressable>;
}
export type InputProps = TextInputProps & { label: string; hint?: string; error?: string };
export function Input({ label, hint, error, style, onFocus, onBlur, ...props }: InputProps) {
  const t = useTheme(); const [focused, setFocused] = useState(false); const id = useId();
  return <View style={{ gap: t.spacing.sm }}>
    <Text nativeID={`${id}-label`} style={[t.typography.label, { color: t.colors.text }]}>{label}</Text>
    <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label} accessibilityHint={error ?? hint}
      placeholderTextColor={t.colors.textSecondary} selectionColor={t.colors.primary}
      onFocus={e => { setFocused(true); onFocus?.(e); }} onBlur={e => { setFocused(false); onBlur?.(e); }}
      style={[t.typography.body, { minHeight: t.layout.control, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, color: t.colors.text,
        backgroundColor: t.colors.surface, borderRadius: t.radius.control, borderWidth: t.border.thin,
        borderColor: error ? t.colors.error : focused ? t.colors.focus : t.colors.border,
        opacity: props.editable === false ? t.opacity.disabled : 1, textAlignVertical: props.multiline ? 'top' : 'center' }, style]} />
    {error || hint ? <Text accessibilityLiveRegion="polite" style={[t.typography.caption, { color: error ? t.colors.error : t.colors.textSecondary }]}>{error ?? hint}</Text> : null}
  </View>;
}
export function Avatar({ name, source, size = theme.avatar.large, verified = false }: { name: string; source?: ImageSourcePropType; size?: number; verified?: boolean }) {
  const t = useTheme(); const [failedSource, setFailedSource] = useState<ImageSourcePropType>();
  const sourceKey = JSON.stringify(source);
  const failedKey = JSON.stringify(failedSource);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '?';
  return <View accessible accessibilityLabel={`${name}${verified ? ', verified' : ''}`} style={{ width: size, height: size }}>
    {source && failedKey !== sourceKey ? <Image source={source} onError={() => setFailedSource(source)} style={{ width: size, height: size, borderRadius: t.radius.pill }} /> :
      <View style={{ width: size, height: size, borderRadius: t.radius.pill, backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[t.typography.label, { color: t.colors.primary }]}>{initials}</Text>
      </View>}
    {verified ? <View style={{ position: 'absolute', bottom: -t.border.focus, end: -t.border.focus, borderWidth: t.border.focus, borderColor: t.colors.surface, borderRadius: t.radius.pill, backgroundColor: t.colors.primary, minWidth: t.layout.badge, minHeight: t.layout.badge, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[t.typography.caption, { color: t.colors.onPrimary, fontWeight: '700' }]}>✓</Text>
    </View> : null}
  </View>;
}
export function Chip({ label, selected = false, disabled, style, ...props }: Omit<PressableProps, 'children'> & { label: string; selected?: boolean }) {
  const t = useTheme(); const [focused, setFocused] = useState(false);
  return <Pressable {...props} accessibilityRole="button" accessibilityState={{ selected, disabled: !!disabled }} disabled={disabled}
    onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    style={state => [{ minHeight: t.layout.touch, minWidth: t.layout.touch, justifyContent: 'center',
      opacity: disabled ? t.opacity.disabled : state.pressed ? t.opacity.pressed : 1 }, typeof style === 'function' ? style(state) : style]}>
    <View style={{ minHeight: t.layout.chip, paddingHorizontal: t.spacing.compact, paddingVertical: t.spacing.xs,
      justifyContent: 'center', borderRadius: t.radius.md, borderWidth: t.border.thin,
      borderColor: focused || selected ? t.colors.primary : t.colors.border,
      backgroundColor: selected ? t.colors.primarySoft : t.colors.surface }}>
      <Text style={[t.typography.small, { color: selected ? t.colors.primary : t.colors.text, fontWeight: selected ? '600' : '400' }]}>{label}</Text>
    </View>
  </Pressable>;
}
export function Card({ children, style, elevated = false, ...props }: ViewProps & { elevated?: boolean }) {
  const t = useTheme();
  return <View {...props} style={[{ backgroundColor: t.colors.surface, borderWidth: elevated ? 0 : t.border.thin, borderColor: t.colors.border, borderRadius: t.radius.md, padding: t.spacing.md, gap: t.spacing.compact }, elevated && t.shadows.subtle, style]}>{children}</View>;
}
export function Divider({ style, ...props }: ViewProps) {
  const t = useTheme(); return <View {...props} style={[{ height: t.border.thin, backgroundColor: t.colors.border, alignSelf: 'stretch' }, style]} />;
}
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = useTheme(); const colors = useTone(tone);
  return <View style={{ alignSelf: 'flex-start', backgroundColor: colors.fill, paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xs, borderRadius: t.radius.pill }}>
    <Text style={[t.typography.caption, { color: colors.ink, fontWeight: '600' }]}>{label}</Text>
  </View>;
}
export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: Pick<ButtonProps, 'label' | 'onPress' | 'disabled'> }) {
  const t = useTheme();
  return <View style={{ alignItems: 'center', padding: t.spacing.md, gap: t.spacing.compact }}>
    {icon}<Text accessibilityRole="header" style={[t.typography.heading, { color: t.colors.text, textAlign: 'center' }]}>{title}</Text>
    {description ? <Text style={[t.typography.body, { color: t.colors.textSecondary, textAlign: 'left' }]}>{description}</Text> : null}
    {action ? <Button {...action} variant="secondary" /> : null}
  </View>;
}
export function LoadingSkeleton({ lines = 3, label = 'Loading', style }: { lines?: number; label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  // Static placeholders avoid motion and keep reduced-motion users comfortable.
  return <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={[{ gap: t.spacing.compact }, style]}>
    {Array.from({ length: Math.max(1, Math.min(10, lines)) }, (_, i) => <View key={i} style={{ height: t.spacing.md, width: i === lines - 1 ? '60%' : '100%', borderRadius: t.radius.sm, backgroundColor: t.colors.surfaceMuted }} />)}
  </View>;
}
export function Toast({ visible, message, tone = 'neutral', onDismiss, dismissLabel = 'Dismiss' }: { visible: boolean; message: string; tone?: Tone; onDismiss?: () => void; dismissLabel?: string }) {
  const t = useTheme(); const colors = useTone(tone);
  if (!visible) return null;
  return <View accessibilityLiveRegion="polite" style={{ padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: colors.fill, borderWidth: t.border.thin, borderColor: colors.ink, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing.sm }}>
    <Text style={[t.typography.body, { color: colors.ink, flex: 1 }]}>{message}</Text>
    {onDismiss ? <Button label={dismissLabel} onPress={onDismiss} variant="ghost" /> : null}
  </View>;
}

export const Skeleton = LoadingSkeleton;
export function ErrorState({ title = 'Something went wrong', description, onRetry, retryLabel = 'Try again' }: {
  title?: string; description?: string; onRetry?: () => void; retryLabel?: string;
}) {
  const t = useTheme();
  return <View accessibilityLiveRegion="polite" style={{ padding: t.spacing.md, gap: t.spacing.sm, borderRadius: t.radius.md, backgroundColor: t.colors.errorSurface }}>
    <Text accessibilityRole="header" style={[t.typography.subtitle, { color: t.colors.error }]}>{title}</Text>
    {description ? <Text style={[t.typography.body, { color: t.colors.error }]}>{description}</Text> : null}
    {onRetry ? <Button label={retryLabel} variant="secondary" onPress={onRetry} /> : null}
  </View>;
}
