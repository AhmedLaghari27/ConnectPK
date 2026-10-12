# ConnectPK UI foundations

Import from `components/ui` and read tokens with `useTheme()` inside components. The exported `theme` is a static light fallback; it is not reactive. Existing token names are preserved for older screens. No screen has been migrated to these components yet.

One turquoise brand family uses darker ink on light surfaces and a lighter tone on dark surfaces for contrast. Neutral surfaces, semantic status colors, system fonts, rounded controls and quiet shadows keep content prominent. Core spacing: `xs=4`, `sm=8`, `compact=12`, `md=16`, `lg=24`; larger legacy tokens remain available.

```tsx
import { Button, Input, Avatar, Chip, Card, Divider, Badge,
  EmptyState, LoadingSkeleton, Toast } from './components/ui';

<Card elevated>
  <Avatar name="Ayesha Khan" verified />
  <Badge label="Approved" tone="success" />
  <Input label="Title" value={title} onChangeText={setTitle} hint="Keep it short." />
  <Divider />
  <Chip label="Karachi" selected onPress={onCityPress} />
  <Button label="Continue" onPress={onContinue} loading={saving} />
</Card>
```

- Button: `primary`, `secondary`, `ghost`; caller supplies event handlers, label and loading/disabled state.
- Input: native TextInput props plus visible `label`, `hint`, `error`. Displays errors supplied by callers; performs no validation.
- Avatar: optional image source, initials fallback, size, caller-provided verified status. Never fetches data.
- Chip: caller-controlled selection; Card: optional subtle elevation; Badge: neutral/success/warning/error.
- EmptyState: title, optional description/icon/action. LoadingSkeleton: bounded lines and accessible loading label; static to respect reduced motion.
- Toast: controlled `visible`, message, tone, optional dismissal handler/label. Render inside a safe-area container. No global queue or auto-dismiss timer; callers own visibility and placement so messages remain readable.

Automatic phone appearance requires `userInterfaceStyle: automatic` and Expo's `expo-system-ui` support on Android. Rebuild existing native development/production binaries after this configuration/dependency change; a JavaScript reload alone does not update native configuration. Reference: https://docs.expo.dev/develop/user-interface/color-themes/.

Manual checks when adopting components: toggle device light/dark mode while the app is open; check large text, VoiceOver/TalkBack labels, keyboard focus, empty/error/loading states and failed-avatar fallback. Verify disabled buttons do not fire and loading buttons announce busy. Existing screen layout/behavior is unchanged, although shared theme tokens update its appearance.
