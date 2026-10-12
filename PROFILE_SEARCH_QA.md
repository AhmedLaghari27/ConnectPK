# Profile and Search UI QA — 2026-10-09

Skills applied: senior-ui-ux-designer (local folder `seniour-ui-ux-deesigner`), senior-app-developer-ui, ui-qa-checklist.

## Changes
- Profile uses a left-aligned header, 80px circular avatar and verified badge, wrapping skills, help section and an own-profile Edit button.
- Own-profile tabs have equal widths and a selected underline; public profiles retain only Posts and About.
- Search has a 48px input, horizontal filters, aligned author rows, People/Posts headings and distinct initial-empty/no-results copy.
- Profile/Search post cards use native pressables to fix stacked author content on web. Existing navigation callbacks are retained.
- No service queries, privacy rules, validation, auth, pagination, or search semantics were changed. People results still come only from authors of existing post results.

## Checks
| Check | Result |
| --- | --- |
| 360 × 640 profile tabs | Pass: three widths approximately 109.33px, each 48px high; selecting About updates the active state |
| 390 × 844 profile/search | Pass: aligned cards, readable text, wrapping skills, long author name truncation; screenshots saved |
| 430 × 932 search | Pass: search container 398px wide with 16px side margins |
| 1280 × 900 search | Pass: centered content maximum 600px, inner search row 568px wide at x=356 |
| Dark search | Pass: readable input, filters and empty state using theme colors |
| Empty/no results | Pass: submitting preview tag changes initial state to no-results guidance; recent search appears |
| Privacy review | Display components use name, professional information, broad city, skills and vision only; no phone, exact location or verification evidence |
| TypeScript | `npm run typecheck` passed |
| Web bundle | `npx expo export --platform web --output-dir /tmp/connectpk-profile-search-check` passed |
| Preview console | No error entries returned in final check |

Screenshots use clearly labeled preview data at `/_profile-search-preview` and `/_profile-search-preview?screen=search`. The temporary preview exercises shared production components without making profile/search service requests. It does not establish live-account query or permission behavior.

Native iOS/Android keyboard, screen-reader and device rendering checks remain manual. This browser check is not a claim of native-device verification.

## Recheck
1. Open My Profile; check Posts, Offers and About, then open Edit Profile.
2. Open another member; verify private Offers and own-profile Edit controls are absent.
3. Search an existing tag and a tag with no matches; clear filters and check grouped results.
4. Check light/dark phone settings and long names/skills on an actual device.

Screenshots: `qa-screenshots/profile.jpg`, `qa-screenshots/search.jpg`.
