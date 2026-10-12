# Create Post QA — 2026-10-09

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.

## Changes

| Screen | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Create | Header Post control inherited broken animated web styling | High | Local native pressable presentation; original disabled expression and publish handler retained |
| Create | Type chips wrapped across rows | Medium | Horizontal scroll row, common chip geometry and 44px touch region |
| Create | Oversized title input, centered counters, no rendered tag chips | Medium | 48px single-line inputs, 120px multiline minimum, right-aligned counters, parsed tag badges |
| Create | Author/helper alignment inconsistent | Medium | 40px avatar, bounded name, left-aligned helper |
| Discard | Dialog lacked keyboard/safe-area/scroll handling | High | Keyboard-aware safe-area scroll container with existing Keep/Discard callbacks |
| Create | Android keyboard behavior unspecified | Medium | Height avoidance on Android, padding on iOS; scrolling and bottom clearance retained |

## Executed verification

- TypeScript passes and web export succeeds.
- Actual CreatePostView rendered in temporary `/_create-preview`, using labeled sample author and local draft state; no posts or member records were written.
- 390×844 screenshot: close top-left, Post top-right, aligned author/inputs, right counters, visible city choices.
- Empty draft keeps Post disabled. Filling title/story and selecting Karachi enables Post using the existing validatePost function. No publish action was executed.
- Tags `community, building` display two badges and existing 2/5 count.
- Discard dialog inspected at 360×640: title, explanatory text and both controls fit. Existing production usePreventRemove and leave handlers retained.
- 430×932: single-line fields measured 48px; body 120px; equal 398px widths.
- Dark palette inspected at 430px.
- 1280×900: inputs measured 568px inside the centered 600px column, no horizontal overflow.
- No captured browser error-level entries.

## Remaining device verification

iOS/Android keyboard, native modal/back gestures, large text, notch insets and actual authenticated publishing were not exercised. Keyboard avoidance was corrected structurally; browser viewport tests do not certify that every native keyboard combination keeps the counter visible. The authenticated route, validation, limits, queries, publishing and discard business handlers were left intact.

Screenshots: `qa-screenshots/create-post.jpg` (390×844 sample preview), `qa-screenshots/create-discard.jpg` (360×640 sample dialog). They show the production view component with preview data, not a logged-in member account.
