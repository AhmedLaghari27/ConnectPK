# Home feed QA — 2026-10-09

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.
Scope: Home presentation, memoization and temporary preview. Existing fetching, filtering, reaction mutations, offer behavior, pagination and routing callbacks retained. Post Detail retains its existing HomeFeedCard; Home now uses a separate HomePostCard.

## Findings and fixes

| Screen | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Home | Composer avatars had different dimensions with/without a photo | Medium | Uniform 40px avatar, 16px padding and centered row |
| Home | Filters occupied multiple rows with inconsistent controls | Medium | One horizontal scrolling row for post type and city, 32px chip visuals and 44px targets |
| Home | Duplicate verified badges and time below author | Medium | Single name badge, bounded name/role, timestamp on right |
| Home | Card typography, spacing and action widths inconsistent | Medium | 16px card inset, 12px gaps, shared content edge, equal reaction columns and equal comment/offer columns |
| Home | Shared animated buttons lost web styling | High | Feed-local native Pressable presentation with unchanged callbacks |
| Home | Web onTextLayout did not reveal Read more | High | Compare measured full/clamped body heights; hidden measurement excluded from accessibility tree |
| Home | Inline list callbacks defeated memoization | Medium | Memoized list render/key/refresh/end/scroll callbacks and HomeFeedItem/actions/card |

## Executed checks

Actual Home components rendered through `/_ui-preview`, using local fixture data and no network mutations. Long names, long body, short body, tags, large counts, missing photo, skeleton, empty and error examples included.

- 360×640: screenshot inspected; equal reaction widths ~92.67px, equal comment/offer widths 143px; 56px/44px minimum action heights; no action overflow.
- 390×844: screenshot inspected in dark mode; equal reaction widths ~102.67px and comment/offer widths 158px; no action overflow.
- 430×932: widths 116px and 178px respectively; no action overflow.
- 1280×900: post content stays within centered 600px container; long-body containers measured 534px, no horizontal overflow.
- Long bodies clamp to four lines and show Read more; short bodies do not. Read more invokes the existing post-opening handler.
- Composer, avatar, title and body alignment inspected; tags wrap; one verified badge; timestamp remains right-aligned.
- Example Offer Help action clicked successfully without touching production offers.
- Browser error log contained no captured error-level entries during checks.
- TypeScript and web export checked.

## Remaining checks / scope limits

Native device notch/keyboard/font scaling and authenticated full-feed pagination were not executed. The tab bar remains a non-overlay sibling of the list; 16px list bottom padding clears it without adding duplicate bar-height whitespace. Last-card reachability was reviewed structurally, not certified on every device.

The existing refresh handler clears its data before reloading; it was deliberately not modified. Eliminating that refresh-related content reset would require a separate data-state change outside this UI-only request. Search/Post Detail card redesign and the broader shared animated-pressable issue remain out of scope.

Reproduce with `npm run web`, then `/_ui-preview` for light/dark fixtures and Home with your existing approved session for real-data scrolling, refresh, reactions and offers.
