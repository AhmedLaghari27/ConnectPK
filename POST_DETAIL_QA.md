# Post Detail QA — 2026-10-09

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.

| Screen | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Post | Older card differed from Home | Medium | Reuse HomePostCard with expanded/content-only presentation |
| Post | Segments had loose pill styling | Medium | Equal flex-basis columns in one segmented surface, accessible selected states |
| Opinions | Large moderation controls cluttered every row; timestamp absent | Medium | Avatar/name/time header, right menu, existing controls revealed on demand |
| Composer | Send bottom-aligned; Android avoidance missing | High | Centered send, bounded multiline field, normal-flow sticky footer, Android height/iOS padding avoidance |
| Offer sheet | Bottom-only close, inconsistent controls and generic funding tint | Medium | Persistent top close, wrapping 44px chip targets, aligned input/counter, warning palette and full-width primary button |

## Verification

- TypeScript and web export pass.
- `/_post-preview` renders shared production visual components with clearly labeled sample author data. Preview offer actions are no-ops; no live comments, reactions, offers or reports were submitted.
- 390×844: expanded card, opinion row/menu and sticky footer inspected. Segment widths both 173px; heights both 48px.
- 360×640: offer sheet inspected with funding interest selected. Warning readable, chips wrap, content scrolls to Send offer while Close remains available. Send measured 328×48px.
- 430×932: dark palette inspected; segment widths both 193px, heights 48px.
- 1280×900: composer constrained to centered 600px column, textbox has no horizontal overflow.
- Browser captured no error-level entries during these checks.
- Screenshots: `qa-screenshots/post-detail.jpg`, `qa-screenshots/post-offer-sheet.jpg`. These show component preview data rather than authenticated production content; the fixture omits service-driven moderation/reaction controls.

## Logic safety and remaining checks

Existing queries, refresh timers, comment/reaction perform handler, offer decisions/sending, validation and limits retained. Opinion options only change visibility of the existing controls. Shared offer presentation also appears wherever OfferHelp is reused.

Native keyboard/notch/Android navigation-bar behavior, large system text, live service error/loading states and authenticated end-to-end actions were not executed. Keyboard and safe-area handling were reviewed structurally; do not treat browser viewport checks as device certification.

Reproduce via `npm run web` and `/_post-preview` (append `?mode=dark`), then check your actual Post Detail route on an approved account and a native device.
