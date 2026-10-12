# Notifications, Messages and Chat UI QA — 2026-10-09

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.

## Issues and fixes
| Screen | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Chat | Bubbles occupied up to 90% of the width | Medium | Shared bubble component capped at 80%, incoming grey/left and outgoing brand/right |
| Chat | Android keyboard avoidance was unset | High | Android height avoidance; retained iOS padding and outer safe area |
| Chat | Send button and input used inconsistent alignment | Medium | Centered row, tokenized input radius/padding and existing send behavior |
| Notifications | Timestamp appeared below notification text | Medium | Right-aligned timestamp and unread dot; left-aligned body beside avatar |
| Notifications | Avatar sizes and badge offsets were arbitrary | Low | Circular 40px avatar placeholder, tokenized icon and badge |
| Messages | Last-message preview wrapped to two lines | Medium | One-line truncation with fixed right-aligned date |
| Messages | Long names could push dates to a second row | Medium | Flexible, truncated name with a non-wrapping date row |

## Verification
- TypeScript passed. Expo production web export passed to `/tmp/connectpk-activity-check` (terminal emitted only color-environment warnings).
- Preview components inspected at 390x844; long message/name truncation and notification row alignment verified.
- Chat checked at 360x640, 430x932 and 1280x900. Desktop inner row is 568px wide, centered within a 600px container.
- Dark chat colors and timestamps inspected. Safety reminder dismissal verified through its existing handler.
- Existing notification grouping function retained: Today, This week, Earlier. Rows use consistent 16px padding and an 80px minimum height, growing for long text/accessibility.
- Existing loading, empty, retry and pagination branches retained. These states were reviewed in source, not triggered through live Supabase failures.
- Chat related-post card remains outside the scrolling message list; composer remains below the list, within keyboard avoidance and safe area.
- No Supabase, realtime, notification service or chat service/model files changed. Existing read, send, report, block, leave and navigation handlers retained.
- Per user approval, Messages unread indicator omitted because existing inbox data has no unread status. Notification unread dots still use existing read_at.

## Limits and manual checks
Screenshots are labeled previews using shared presentation components and sample data, not live accounts. Preview chat illustrates bubbles and controls, not the production list's pinned positioning. Native keyboard, notches, Android navigation bar, text scaling and authenticated realtime flows still require device testing. No physical-device pass is claimed.

Run the app; open Notifications, Messages and a conversation. Check mark-read, existing navigation, send, safety dismissal and keyboard on a phone. Check empty/error states and dark mode with real account data.

Files: app/notifications.tsx, app/messages.tsx, app/chat/[id].tsx, components/activity-ui.tsx, components/conversation-ui.tsx, app/_activity-preview.tsx.
Screenshots: qa-screenshots/notifications.jpg, qa-screenshots/messages.jpg, qa-screenshots/chat.jpg.
