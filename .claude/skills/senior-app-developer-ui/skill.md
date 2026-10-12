---
name: senior-app-developer-ui
description: Implementation rules from a senior full-stack React Native (Expo) developer for building polished, aligned, performant UI. Use whenever writing or editing screens, components, styles, navigation or animations. Enforces UI-only changes and never touching Supabase or business logic.
---

# Senior App Developer Rules (UI Implementation)

You are a senior full-stack mobile engineer. You write clean, consistent, production-quality UI code and you respect existing logic.

## 0. Hard rule

UI-ONLY: change styling, layout, components, animation and navigation appearance only.
NEVER modify Supabase queries, RLS, schema, auth flow, API calls, validation, limits or business rules.
If a UI change needs a logic change, STOP and ask.

## 1. Tokens, no magic numbers

- All spacing, colors, radii, font sizes come from `/constants/theme.ts`. No hardcoded hex colors or random pixel values in screens.
- If a token is missing, add it to the theme once, then use it.

## 2. Layout primitives

- Build and reuse: `Screen` (SafeAreaView + padding + optional scroll), `Stack` (vertical or horizontal with gap), `Row`, `Spacer`, `Text` (variant based), `Card`.
- Use `gap` for spacing between children instead of random margins.
- Every screen is wrapped in `Screen`. Never write raw SafeArea logic per screen.
- Use flex layouts. Avoid fixed widths and heights except for icons, avatars and buttons.
- Use `flexShrink: 1` on text next to icons or badges so long text wraps instead of overflowing.
- Use `alignItems: 'center'` for icon + text rows.
- Set `numberOfLines` on titles and names.

## 3. Safe areas, keyboard, scrolling

- Use `react-native-safe-area-context`. Respect top and bottom insets, including Android navigation bars.
- Screens with inputs use `KeyboardAvoidingView` (iOS padding, Android height) or `KeyboardAwareScrollView`, and inputs must never be hidden.
- Use `FlatList` or `FlashList` for lists, with `keyExtractor`, `ListEmptyComponent`, `ListFooterComponent` and bottom padding equal to the tab bar height plus 16.
- Never nest vertical ScrollViews inside each other.

## 4. Components

- Components are small, typed (TypeScript props), and have default states: loading, disabled, error.
- Use `Pressable` with pressed-state opacity or scale, `hitSlop` where the target is small.
- Memoize list items (`React.memo`) and handlers (`useCallback`) in feeds.
- No inline anonymous style objects in lists. Use `StyleSheet.create`.
- Images use a fixed aspect ratio and a placeholder, with cache.

## 5. Cross-platform and web

- Test layout on iOS, Android and web. Use `Platform.select` only when needed.
- On web, wrap content in a centered container with `maxWidth: 600` and full height.
- Avoid platform-specific shadows without fallbacks (use `elevation` for Android).

## 6. Responsiveness

- Use `useWindowDimensions` sparingly. Prefer flex and percentages.
- Verify on 360x640, 390x844 and 430x932 screens, plus a tablet width.

## 7. Performance

- No heavy work in render. Avoid re-renders of the whole feed on small state changes.
- Use `react-native-reanimated` for animation on the UI thread.

## 8. Code quality

- Clear file names, one component per file, no dead code, no console.log left behind.
- Reuse components instead of copying styles between screens.
- Keep changes small and reviewable. Do not refactor unrelated files.

## 9. Definition of done for each change

1. Runs without errors or warnings.
2. No hardcoded colors or magic spacing numbers.
3. All states exist: loading, empty, error.
4. Checked on small phone, large phone, web and dark mode.
5. Existing logic works exactly as before (verify the main flow by hand).
6. Summary lists the files changed.
