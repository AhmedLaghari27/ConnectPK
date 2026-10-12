# Navigation shell QA — 2026-10-09

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.
Scope: presentation only. No queries, auth, route guards, database, validation or business handlers changed. Existing destinations and unread count provider retained.

## Failures found and corrected

| Area | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Tabs | Animated pressable dropped layout styles on web; columns unequal | High | Native Pressable for shell controls, with pressed opacity |
| Tabs | 10px labels and inconsistent geometry | Medium | 12px caption labels, equal flex columns, 24px icons, 72px minimum bar |
| Tabs | Selected Notifications label wrapped at 360px | Medium | Constant label weight; selected icon/color remain distinct |
| Badge | Surface-colored text on error fill had poor dark-mode contrast | Medium | Semantic error ink on error-surface background |
| Header | 48/64px and ad hoc scrolling headers | Medium | Shared 56px minimum header outside scrolling content |
| Header | Back icons/labels inconsistent | Medium | Shared labeled 44px target, existing destination callbacks |
| Safe areas | Bottom inset belonged to page rather than bar | Medium | Bar owns bottom inset; tab hosts keep top and side insets |
| Accessibility | Selected tab not exposed as aria-selected on web | Medium | Explicit aria-selected alongside native accessibilityState |
| Alignment | Header 16px / content 24px mismatch | Medium | 16px outer content inset on integrated screens |

## Executed checks

The temporary `/_ui-preview` uses the actual shared shell components with local sample callbacks, long titles, both theme palettes and a 120-unread badge (displayed as 99+). No production writes were performed.

| Viewport | Measured tab width | Tab height | Result |
| --- | --- | --- | --- |
| 360×640 | 72px each | 72px | Pass, both palettes, no horizontal tab overflow |
| 390×844 | 78px each | 72px | Pass, selected Search visual state |
| 430×932 | 86px each | 72px | Pass |
| 1280×900 | 120px each inside centered 600px shell | 72px | Pass |

- Back buttons measured 44×44; header long titles truncate without displacing right actions.
- Active Search and Notifications were clicked in the gallery; icon/color changes and aria-selected verified.
- Badge and selected tab inspected in dark mode at 360px.
- Header and bottom bar are non-overlay siblings; scroll areas use flex:1 so shell height is reserved. No speculative duplicate tab-height padding added.
- TypeScript passes; web export succeeds.
- Browser console had existing pointerEvents and shadow-prop deprecation warnings; no captured error-level entries in the checked preview.

## Limits / remaining device checks

These are browser viewport checks, not iOS/Android device certification. Native notch/home-indicator insets, Android navigation bar and keyboard, enlarged system fonts, actual authenticated screens with full/error/empty/loading content, and final-item scrolling must still be checked on devices. Native safe-area ownership was reviewed in code.

The broader component gallery still demonstrates an existing animated-pressable styling problem outside the navigation shell; that shared-control repair is outside this request. No unrelated component redesign was made.

To reproduce: `npm run web`, open `/_ui-preview`, inspect the shell at the widths above and both palettes. Then test existing Home/Search/Notifications/Profile, Messages, Post Detail, Chat, Create and editing screens with your signed-in session.
