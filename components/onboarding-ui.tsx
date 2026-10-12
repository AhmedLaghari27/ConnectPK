import { FeedbackPressable as Pressable } from './ui/feedback-pressable';
import { useMemo, type PropsWithChildren } from 'react';
import { Pressable as NativePressable, ActivityIndicator, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { OnboardingFrame } from './onboarding-frame';
import { theme, useTheme } from '../constants/theme';
import { copy } from '../constants/copy';

export function OnboardingScreen({title,subtitle,eyebrow,step,children}:PropsWithChildren<{title:string;subtitle?:string;eyebrow?:string;step?:number}>){
 const s=useUiStyles();
 return <OnboardingFrame title={title} subtitle={subtitle} progress={step?<Stepper step={step}/>:undefined}>
  {eyebrow?<Text style={s.overline}>{eyebrow}</Text>:null}{children}
 </OnboardingFrame>;
}

function Stepper({ step }: { step: number }) {
  const t = useTheme(); const s = useUiStyles();
  return <View style={s.steps} accessibilityLabel={`${step} / 3: ${copy.steps[step - 1]}`}>
    {copy.steps.map((label, i) => <View key={label} style={s.step}>
      <View style={[s.stepLine, { backgroundColor: i < step ? t.colors.primary : t.colors.border }]} />
      <Text style={[s.stepLabel, i === step - 1 && { color: t.colors.text }]}>{`0${i + 1}  ${label}`}</Text>
    </View>)}
  </View>;
}

export function ActionButton({ label, onPress, loading = false, disabled = false, secondary = false }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean; secondary?: boolean;
}) {
  const s = useUiStyles(); const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, (disabled || loading) && s.disabled, pressed && s.pressed]}>
    {loading ? <ActivityIndicator color={secondary ? t.colors.primary : t.colors.onPrimary} /> : null}
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
    {!secondary && !loading ? <Text accessibilityElementsHidden style={s.buttonArrow}>↗</Text> : null}
  </Pressable>;
}

export function EmailInput(props: TextInputProps) {
  const s = useUiStyles(); const t = useTheme();
  return <TextInput {...props} style={[s.input, props.style]} placeholderTextColor={t.colors.textSecondary}
    selectionColor={t.colors.focus} />;
}

export function ErrorMessage({ message }: { message: string | null }) {
  const s = useUiStyles();
  return message ? <View style={s.errorBox}><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{message}</Text></View> : null;
}

export function CheckBox({ label, checked, onChange, disabled }: {
  label: string; checked: boolean; onChange: () => void; disabled?: boolean;
}) {
  const s = useUiStyles();
  return <NativePressable accessibilityRole="checkbox" accessibilityLabel={label}
    accessibilityState={{ checked, disabled }} onPress={onChange} disabled={disabled}
    style={({ pressed }) => [s.checkRow, checked && s.checkSelected, pressed && s.pressed]}>
    <View style={[s.checkbox, checked && s.checked]}><Text style={s.checkmark}>{checked ? '✓' : ''}</Text></View>
    <Text style={[s.body, s.checkLabel]}>{label}</Text>
  </NativePressable>;
}

export function StatusCard({ symbol, label, title, body }: { symbol: string; label: string; title: string; body: string }) {
  const s = useUiStyles();
  return <View style={s.statusCard}>
    <View style={s.statusSymbol}><Text style={s.symbolText}>{symbol}</Text></View>
    <Text style={s.overline}>{label}</Text><Text style={s.cardTitle}>{title}</Text><Text style={s.body}>{body}</Text>
  </View>;
}

export function LoadingSkeleton() {
  const s = useUiStyles();
  return <View accessibilityRole="progressbar" accessibilityLabel={copy.loading.label} style={s.card}>
    <View style={[s.skeleton, { width: '60%' }]} /><View style={s.skeleton} /><View style={[s.skeleton, { width: '80%' }]} />
  </View>;
}

export function useUiStyles() {
  const { colors: c } = useTheme();
  return useMemo(() => makeStyles(c), [c]);
}
const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  scroll: { flexGrow: 1 },
  shell: { flex: 1, width: '100%', maxWidth: theme.layout.page, alignSelf: 'center' },
  wideShell: { flexDirection: 'row', padding: theme.spacing.lg, gap: theme.spacing.section },
  main: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center' },
  content: { width: '100%', maxWidth: theme.layout.content, alignSelf: 'center', gap: theme.spacing.lg },
  heading: { gap: theme.spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  brand: { color: c.text, fontWeight: '700', fontSize: 22, letterSpacing: -0.6 },
  brandMark: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandSymbol: { fontFamily: theme.fonts.display, fontSize: 30, lineHeight: 32 },
  cityLine: { color: c.textSecondary, fontSize: theme.fontSizes.caption, letterSpacing: 0.4 },
  title: { ...theme.typography.title, color: c.text },
  body: { ...theme.typography.body, color: c.textSecondary },
  overline: { color: c.textSecondary, fontSize: theme.fontSizes.caption, letterSpacing: 1, fontWeight: '700' },
  label: { ...theme.typography.label, color: c.text },
  input: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: theme.radius.sm, padding: theme.spacing.md, fontSize: theme.fontSizes.body, color: c.text, minHeight: theme.layout.control },
  field: { gap: theme.spacing.sm },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.md, padding: theme.spacing.lg, gap: theme.spacing.md },
  cardTitle: { color: c.text, fontSize: theme.fontSizes.subtitle, fontWeight: '600' },
  button: { minHeight: theme.layout.control, borderRadius: theme.radius.pill, backgroundColor: c.primary, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  secondary: { backgroundColor: c.primarySoft, borderColor: c.border, borderWidth: 1 },
  buttonText: { color: c.onPrimary, fontSize: theme.fontSizes.small, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  buttonArrow: { color: c.onPrimary, fontSize: theme.fontSizes.subtitle, marginStart: theme.spacing.sm },
  secondaryText: { color: c.primary },
  disabled: { opacity: 0.55 }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  errorBox: { padding: theme.spacing.md, backgroundColor: c.errorSurface, borderRadius: theme.radius.sm, borderStartWidth: 3, borderColor: c.error },
  error: { color: c.error, fontSize: theme.fontSizes.small, lineHeight: 22 },
  checkRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center', minHeight: theme.layout.control, padding: theme.spacing.md, borderWidth: 1, borderColor: c.border, borderRadius: theme.radius.sm },
  checkSelected: { backgroundColor: c.primarySoft, borderColor: c.primary },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: c.primary, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: c.primary }, checkmark: { color: c.onPrimary, fontWeight: '700' }, checkLabel: { flex: 1, fontSize: theme.fontSizes.small, lineHeight: 22 },
  footer: { color: c.textSecondary, fontSize: theme.fontSizes.caption, textAlign: 'center', paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md },
  note: { color: c.textSecondary, fontSize: theme.fontSizes.caption, lineHeight: 19, textAlign: 'center' },
  rule: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' },
  ruleNumber: { color: c.primary, fontSize: theme.fontSizes.caption, fontWeight: '700', paddingTop: theme.spacing.xs },
  ruleBody: { flex: 1, color: c.textSecondary, fontSize: theme.fontSizes.small, lineHeight: 22 },
  featureRow: { flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' },
  feature: { flex: 1, minWidth: 140, backgroundColor: c.primarySoft, padding: theme.spacing.md, borderRadius: theme.radius.md, gap: theme.spacing.sm },
  featureTitle: { color: c.text, fontSize: theme.fontSizes.small, fontWeight: '600' },
  featureBody: { color: c.textSecondary, fontSize: theme.fontSizes.caption, lineHeight: 19 },
  steps: { flexDirection: 'row', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  step: { flex: 1, gap: theme.spacing.sm }, stepLine: { height: 3, borderRadius: theme.radius.pill },
  stepLabel: { fontSize: theme.fontSizes.caption, color: c.textSecondary, lineHeight: 16 },
  statusCard: { backgroundColor: c.primarySoft, padding: theme.spacing.lg, borderRadius: theme.radius.md, gap: theme.spacing.md },
  statusSymbol: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  symbolText: { fontSize: 28, color: c.primary },
  emailAddress: { color: c.text, fontSize: theme.fontSizes.subtitle, fontWeight: '500', flexShrink: 1 },
  skeleton: { height: 16, backgroundColor: c.surfaceMuted, borderRadius: theme.radius.sm },
  editorial: { width: '43%', backgroundColor: c.panel, borderRadius: theme.radius.lg, padding: theme.spacing.xl, minHeight: 660, overflow: 'hidden' },
  editorialBody: { gap: theme.spacing.lg, paddingVertical: theme.spacing.xxl },
  editorialTitle: { color: c.onPanel, fontFamily: theme.fonts.display, fontSize: 46, lineHeight: 54, letterSpacing: -1 },
  editorialCopy: { color: c.panelMuted, fontSize: theme.fontSizes.small, lineHeight: 23 },
  panelFooter: { gap: theme.spacing.md, marginTop: 'auto' }, panelCaption: { color: c.onPanel, fontSize: theme.fontSizes.caption, letterSpacing: 0.4 },
  conversation: { height: 220, alignItems: 'center', justifyContent: 'center' },
  orbit: { width: 210, height: 210, borderRadius: 105, borderWidth: 1, borderColor: c.orbit, position: 'absolute' },
  orbitInner: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: c.orbit, position: 'absolute' },
  bubble: { position: 'absolute', width: 100, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  bubbleOne: { backgroundColor: c.accent, transform: [{ translateX: -35 }, { translateY: -25 }, { rotate: '-8deg' }], borderBottomEndRadius: 4 },
  bubbleTwo: { backgroundColor: c.bubble, transform: [{ translateX: 45 }, { translateY: 30 }, { rotate: '8deg' }], borderBottomStartRadius: 4 },
  dotRow: { flexDirection: 'row', gap: 8 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.panel }, spark: { color: c.panel, fontSize: 40 },
});
