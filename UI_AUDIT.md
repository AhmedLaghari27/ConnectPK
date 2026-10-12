# ConnectPK UI audit

## Final-pass status — 2026-10-10

**Stopped at a confirmed business/acceptance boundary, as requested. This is not a completed final QA pass.**

Screen | Problem | Severity | Required next step
--- | --- | --- | ---
Eligibility / conduct | `constants/conduct.ts` still describes intentions, three weekly introductions, private passing and unmatching, inconsistent with the current feed-and-offer rules in PROJECT.md. `app/eligibility.tsx` records acceptance of `TERMS_VERSION`, and `lib/onboarding.ts` checks that version to determine onboarding completion. | high | Approve the revised agreement and decide whether existing members must re-accept it before changing agreement version/acceptance behavior. This exceeds styling/layout.

No application files were changed during this final-pass attempt. The temporary `_ui-preview` screen has not yet been removed. Full light/dark, four-viewport, all-state checks and authenticated login/profile/verification/post/comment/offer/chat checks were **not** completed or certified.

### Fixes completed in preceding UI passes
- Profile header alignment, circular avatar, wrapping skills, equal-width tabs and initial-only loading skeleton; Search aligned results and explicit empty states. See `PROFILE_SEARCH_QA.md`.
- Notifications aligned timestamps/unread dots; Messages one-line previews; Chat 80% bubbles and keyboard-avoidance layout. Messages unread state was explicitly omitted because the existing data does not provide it. See `ACTIVITY_UI_QA.md`.
- Onboarding 16px margins, corrected button/checkbox rendering, pinned profile navigation, centered selected-selfie preview and aligned verification status. Existing password auth retained. See `ONBOARDING_UI_QA.md`.
- Previous TypeScript/web-export passes establish compilation, not end-to-end flow correctness. Prior screenshots include labeled component fixtures; they are not substitutes for authenticated or physical-device testing.

The original findings below are historical and require reconciliation against current source after this blocker is resolved. Do not interpret them as all still open, or all fixed. Remaining work includes shared style cleanup, preview removal, full state/viewport testing and device keyboard/camera/launch checks. These verification gaps are not classified as low-priority cosmetic items.


Date: 2026-10-09. Scope: mobile/web application presentation only. This report is the sole file-writing exception requested; no application, query, auth, validation or business-logic files were changed.

Skills used: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist (all read fully). The designer skill resides in `.claude/skills/seniour-ui-ux-deesigner/skill.md`.

## Evidence and limits

This is a source-level audit, not a completed visual-device certification. The browser initially exposed the splash, but subsequent inspection failed with “Tab 3 is not part of browser session”; authenticated screens and the required viewport matrix could not be visually verified. Findings marked **risk** require reproduction. No screenshots, measured overflow, or end-to-end visual passes are claimed. Severity high = obstructed understanding/action or substantial recurring instability; medium = material consistency/usability defect; low = polish/maintenance. No fabricated critical security findings.

Reviewed route sources: splash/layout, welcome, email login, auth callback, eligibility, profile setup, verification, home, create, edit post, post detail, search, own/public profile, edit profile, notifications, messages and chat; supporting offers, moderation, navigation and UI components. Admin portal is outside the requested screen set.

The existing email/password flow is intentional; missing email OTP/resend is not recorded as a UI defect. Generic notification/message avatars are not treated as missing data. Own verification previews are not public evidence exposure. No contrast failure is asserted without a measured rendered color pair. Tabs rendered as siblings do not automatically require an extra overlay-sized bottom inset.

## Findings — severity, then screen

Screen | Problem | Severity | Fix
--- | --- | --- | ---
Chat | Fixed header stacks identity, related post, safety copy, connection status and errors above the composer; little space remains for messages on a short phone with keyboard open [device risk] Source: `app/chat/[id].tsx:64`. | high | Compact the header and reserve a usable message viewport; verify 360×640 with keyboard and large text.
Create Post | Discard dialog has no keyboard avoidance or scrollable safe-area content; buttons may be obscured when opened while typing [device risk] Source: `app/create.tsx:114`. | high | Use a bounded, safe-area-aware, keyboard-aware dialog with reachable actions.
Eligibility / conduct | The agreement still describes intentions, three weekly introductions, passing and unmatching; this contradicts the current professional feed Source: `constants/conduct.ts`. | high | Review displayed agreement copy against PROJECT.md; any terms/version or acceptance change needs separate authorization.
Feed / Search / Profile | Home uses the new card, while Search and Profile use legacy PostCard: different padding, avatar shape, tags, metadata and actions Source: `components/home-feed-ui.tsx; components/feed-ui.tsx`. | high | Unify the visual card anatomy while preserving each screen’s existing actions/data.
Offers | Feed opens a modal containing OfferHelp, which opens a second modal to compose; close controls sit at the bottom Source: `components/home-feed-item.tsx:58; components/offer-help.tsx:17`. | high | Use one visible sheet layer with a persistent top close control; retain send/decision handlers.
Offers | Send offer is disabled by validateOffer, but its returned explanation is never rendered; users can be stuck with a disabled action and no reason Source: `components/offer-help.tsx`. | high | Display the existing validation result beside the message without changing validation.
Profile | Every 15-second refresh sets loading=true and inserts a skeleton above the existing profile, producing repeated layout jumps Source: `components/member-profile-screen.tsx:25`. | high | Render the initial skeleton only when there is no displayed profile; preserve the existing refresh behavior.
Shared components | Two button/input/card systems remain active: ActionButton/EmailInput and ui Button/Input; label sizes, radii, padding and resulting heights differ Source: `components/onboarding-ui.tsx; components/ui/index.tsx`. | high | Consolidate presentation behind compatible props, preserving every handler and disabled condition.
Shared forms | Legacy EmailInput has no explicit focus/error styling, while new Input does; login, editing, offers and chat use inconsistent field affordances Source: `components/onboarding-ui.tsx:38`. | high | Share visual focus/error treatment, keeping all input values, validation and handlers unchanged.
Chat | Conversation menu spans the full browser width rather than the 600px app column Source: `app/chat/[id].tsx:89`. | medium | Center and constrain the sheet with the shared width token.
Chat | Every bubble repeats a full date and time; connection implementation text occupies permanent header space Source: `app/chat/[id].tsx`. | medium | Reduce timestamp visual weight and make connection status compact; preserve information and state.
Chat | Every received bubble contains a full-size Report message button, overwhelming short messages and distorting bubble widths Source: `app/chat/[id].tsx:81`. | medium | Expose the same report action through a compact accessible message action.
Create Post | Header uses 16px padding while form uses 24px, creating different left edges Source: `app/create.tsx`. | medium | Align header and form to the same 16px screen inset.
Create Post | Tall form and wrapping type chips compete with the title/body; centered counters do not align with inputs Source: `app/create.tsx`. | medium | Group metadata compactly and align helper text/counters consistently.
Edit Post / Edit Profile | Editing uses the older onboarding frame and legacy controls rather than the create/profile visual language; Cancel is at the bottom of long forms Source: `app/edit-post/[id].tsx; app/edit-profile.tsx`. | medium | Provide matching compact headers and shared input/button presentation; keep routes and save handlers.
Feed | Author time is below the role instead of aligned right; long author text lacks consistent truncation across card variants Source: `components/home-feed-ui.tsx; components/feed-ui.tsx`. | medium | Use a shared flexible author row and a bounded timestamp region.
Feed | Floating new-post control uses a fixed bottom offset of 120 rather than measured shell/inset positioning [device risk] Source: `app/home.tsx`. | medium | Position relative to the navigation shell and safe area; test large text.
Feed | Verified status appears both on the avatar and beside the name Source: `components/home-feed-ui.tsx`. | medium | Use one consistent verified indicator per author row.
Messages | Back navigation and content header have different horizontal padding; large header and connection copy consume list space Source: `app/messages.tsx`. | medium | Use one header baseline and compact status presentation.
Navigation | Tab labels are hardcoded 10px and single-line, below the supplied caption scale; Notifications is especially crowded Source: `components/navigation-shell.tsx:37`. | medium | Use legible tokenized labels and validate all five tabs with large text.
Notifications | Push settings, explanatory copy and mark-all control precede the list, pushing recent activity down the page Source: `app/notifications.tsx`. | medium | Compact settings presentation and prioritize the activity list.
Notifications | Unread rows add a full-size Mark as read action, creating excessive height and duplicated action emphasis Source: `app/notifications.tsx`. | medium | Present the existing action compactly while retaining an accessible label.
Offers | Funding warning uses the generic primary tint and centered note in list cards, weakening warning hierarchy Source: `components/offer-help.tsx`. | medium | Use warning tokens and left-aligned readable text without changing the warning.
Offers | Offer composition looks different from Feed and Detail because typeChips defaults to false Source: `components/offer-help.tsx`. | medium | Use the same chip presentation for the existing type selection everywhere.
Offers | Owner cards stack report, block, view profile, accept and decline as large buttons; confirmations add another primary button Source: `components/offer-help.tsx`. | medium | Group secondary actions in a compact menu and give the decision a clear hierarchy.
Post Detail | 24px outer inset plus card inset differs from Feed; header scrolls with the content Source: `app/post/[id].tsx`. | medium | Match feed alignment and retain a predictable back affordance.
Post Detail | Action errors are displayed in more than one area, and a shared busy state can visually label unrelated Send activity Source: `app/post/[id].tsx`. | medium | Show contextual errors once; avoid misleading loading labels without changing action state.
Post Detail | Opinions/Offers switch follows the entire expanded post; a long body puts key navigation far below the fold Source: `app/post/[id].tsx`. | medium | Keep the section switch discoverable through a compact or sticky presentation.
Post Detail | Report/block buttons dominate each opinion; inline confirmation expands surrounding content Source: `app/post/[id].tsx`. | medium | Group existing moderation actions compactly and contain confirmation layout.
Profile | 24px screen plus 24px profile-card padding narrows the content excessively; organization is centered among left-aligned text Source: `components/member-profile-screen.tsx`. | medium | Use 16px screen/card padding and align profile metadata.
Profile | Each own post has separate full-size Open/Edit/Delete controls below a legacy card Source: `components/member-profile-screen.tsx`. | medium | Group existing actions into a compact consistent card footer/menu.
Profile | Vision, all skills and help text precede tabs, while About repeats some of them; posts become hard to discover Source: `components/member-profile-screen.tsx`. | medium | Shorten the visible header with UI-only expansion and organize existing text in About.
Profile setup | Old choice/check controls mix with new inputs; long availability groups and bottom actions create an uneven step rhythm Source: `app/profile-setup.tsx; components/profile-fields.tsx`. | medium | Use consistent group spacing and control visuals, retaining all five steps and fields.
Profile setup / Edit Profile | Selected photo is a 112px rounded square with no failed-image fallback, unlike circular profile avatars Source: `components/profile-fields.tsx:43`. | medium | Use a circular preview and a stable fallback without changing upload behavior.
Search | People cards have a fixed 208px width with unbounded name/role text; long content creates uneven heights [layout risk] Source: `components/search-ui.tsx`. | medium | Bound name/role lines and use consistent card dimensions at supported widths.
Shared components | Generic centered note styling is reused for long safety/privacy/help text and left-aligned metadata Source: `components/onboarding-ui.tsx`. | medium | Split note presentation into aligned helper, metadata and centered-short-caption variants.
Shared components | Legacy cards use 24px padding/16px radius; new cards use 16px padding/24px radius, contrary to a single card specification Source: `components/onboarding-ui.tsx; components/ui/index.tsx`. | medium | Define one card geometry with deliberate documented variants.
Shared components | Legacy primary buttons append an outward arrow to unrelated actions such as confirmation and sending Source: `components/onboarding-ui.tsx:34`. | medium | Use appropriate optional icons and center labels consistently.
Shared layout | Feed action sheets and chat menu omit the 600px width constraint used elsewhere Source: `components/home-feed-item.tsx; app/chat/[id].tsx`. | medium | Apply a common centered sheet container.
Shared layout | Most onboarding/detail/profile areas use 24px screen padding versus Feed’s 16px; headers and cards do not share one baseline Source: `components/onboarding-frame.tsx; app; components`. | medium | Adopt shared screen/row/stack primitives and the required 16px outer inset.
Shared layout | Several keyboard containers specify iOS padding but undefined Android behavior [device risk, not a proven overlap] Source: `components/onboarding-frame.tsx; components/offer-help.tsx; app/chat/[id].tsx`. | medium | Verify Android resize behavior and use the skill’s keyboard-aware layout where necessary.
Shared states | Generic line-only skeletons do not reserve the geometry of profile, offer and form content Source: `components/onboarding-ui.tsx; components/member-profile-screen.tsx`. | medium | Create content-shaped placeholders and keep populated views stable during refresh.
Shared theme | Current type scale (32/22/16/13), pill buttons and 24px cards conflict with the newly supplied skill scale and radius specification Source: `constants/theme.ts`. | medium | Agree one specification and encode it centrally before screen polish; retain readable contrast.
Splash | Separate absolute logo/copy layout with fixed offsets can clip in short landscape or large text [device risk] Source: `components/startup-splash.tsx`. | medium | Use a responsive centered stack within safe bounds.
Verification | Selfie preview appears only after capture and inserts a large block, shifting the form Source: `app/verification.tsx`. | medium | Reserve a stable preview region with a friendly empty state.
Verification | Web capture remains actionable and explains the platform restriction only after tapping Source: `app/verification.tsx`. | medium | Surface the existing platform limitation beside the control without changing verification rules.
Welcome / Login | Large onboarding headers, 24px insets and full-size secondary controls use substantial space on small phones Source: `app/index.tsx; app/email.tsx; components/onboarding-frame.tsx`. | medium | Reduce header density and standardize vertical rhythm; retain password auth and current flow.
Notifications | Timestamps inherit centered note styling, weakening alignment with notification text Source: `app/notifications.tsx; components/onboarding-ui.tsx`. | low | Left-align metadata with the notification body.
Search | Recent searches header and clear action have no explicit narrow/large-text adaptation Source: `components/search-ui.tsx`. | low | Allow wrapping/shrinking while preserving the existing local history behavior.
Shared lists | Comments/offers/profile posts use mapped ScrollView content and many repeated inline style objects Source: `app/post/[id].tsx; components/offer-help.tsx; components/member-profile-screen.tsx`. | low | Consider presentational list virtualization/style extraction separately; preserve pagination and fetching.
Shared source hygiene | Legacy editorial/orbit styles remain alongside modern onboarding styles, making the active design language unclear Source: `components/onboarding-ui.tsx`. | low | Confirm unused styles and remove them in a later scoped UI cleanup.
Shared states | Several empty states are plain body text rather than the checklist’s icon/title/help/action pattern Source: `components/offer-help.tsx; components/member-profile-screen.tsx; app/chat/[id].tsx`. | low | Use the shared EmptyState with only existing applicable actions.
Splash | 4.5-second hold and 850/1200ms animation conflict with the skill’s no-delay/150–250ms guidance, but follow an earlier explicit user requirement Source: `components/startup-splash.tsx`. | low | Keep current timing unless the user authorizes changing that requirement.
Welcome | Slide content has variable height, so Next/Get started shifts between slides Source: `app/index.tsx`. | low | Reserve responsive slide space while allowing large text to scroll.

## Recommended fix order

1. Resolve the agreement-copy discrepancy with product approval; do not silently change terms acceptance/versioning.
2. Fix hidden existing offer validation feedback and profile refresh skeleton presentation.
3. Establish one shared input/button/card/header geometry, typography and 16px screen inset. Keep compatible handlers and props.
4. Fix dialog/sheet composition, close placement and keyboard reachability; verify on 360×640 first.
5. Unify Home, Search, Profile and Detail post cards; compact moderation actions in comments, offers and chat.
6. Refine profile/header density, notifications, navigation labels and long-text behavior.
7. Polish onboarding, photo fallbacks, skeleton/empty states and motion. Changing splash duration requires approval because it was explicitly requested earlier.
8. Run the full visual matrix below, then remove confirmed obsolete styles in a separate UI-only pass.

All fixes above are proposals only. Data fetching, subscriptions, queries, guards, validation rules, auth and business behavior must remain unchanged. Any fix that cannot be implemented solely in presentation must stop for separate authorization.

## Required visual verification — not yet passed

For each reviewed screen: loading, empty, error, filled, maximum text and very short text; light/dark; 360×640, 390×844, 430×932 and web 1280px. Add tablet, enlarged system text, reduced motion, keyboard open, notch/home indicator and Android navigation bar. Check 44px targets, focus visibility, screen-reader labels, last-item reachability, long names/tags and broken images. Test modal dismissal, all disabled/loading labels, refresh without scroll jumps and native/web back controls. Measure text contrast on actual rendered pairs, including disabled and warning states. No source or runtime tests were run to certify visual behavior.

## Hardcoded color inventory

Literal colors below are an inventory, not all defects: theme palette definitions, native splash configuration and `transparent` are legitimate exceptions. No claim that every literal should be replaced blindly.

File:line | Literals
--- | ---
`app/post/[id].tsx:95` | `'transparent'`
`components/home-feed-ui.tsx:75` | `'transparent'`
`components/member-profile-screen.tsx:73` | `'transparent'`
`components/navigation-shell.tsx:31` | `'transparent'`
`components/ui/index.tsx:21` | `'transparent'`
`components/ui/index.tsx:22` | `'transparent'`
`constants/theme.ts:3` | `#00B7CD`
`constants/theme.ts:5` | `#00000066`, `#FAFAFA`, `#FFFFFF`, `#F0F1F2`
`constants/theme.ts:6` | `#007383`, `#E3F7FA`, `#FFFFFF`, `#102A30`
`constants/theme.ts:7` | `#191C20`, `#5D636B`, `#D5D9DE`
`constants/theme.ts:8` | `#217044`, `#EAF6EF`, `#875500`, `#FFF4D6`
`constants/theme.ts:9` | `#B32E39`, `#FFF0F1`, `#007383`
`constants/theme.ts:11` | `#E3F7FA`, `#E3F7FA`, `#191C20`, `#5D636B`, `#007383`, `#C5EDF2`
`constants/theme.ts:14` | `#00000099`, `#111214`, `#1B1D20`, `#282B30`
`constants/theme.ts:15` | `#57D5E4`, `#13353B`, `#102A30`, `#102A30`
`constants/theme.ts:16` | `#F4F5F6`, `#B2B8C1`, `#464B53`
`constants/theme.ts:17` | `#8AD6A7`, `#183324`, `#F3CD78`, `#382C15`
`constants/theme.ts:18` | `#FFA5AC`, `#3D2026`, `#57D5E4`
`constants/theme.ts:19` | `#13353B`, `#1B1D20`, `#F4F5F6`, `#B2B8C1`, `#57D5E4`, `#23505A`
`constants/theme.ts:28` | `#000000`
`app.json:24` | `#00B7CD`
`app.json:26` | `#00B7CD`
`app.json:48` | `#FFF1D1`
`app.json:66` | `#00B7CD`

## Numeric presentation inventory

Every direct numeric style-property literal matched in the reviewed TSX/theme files is listed below, plus numeric JSX size dimensions. This includes valid structural values (flex 1, border 1, opacity 0), intentional avatar/icon sizes and unused legacy styles; it is **not** a claim that all are random spacing. Token candidates are padding/margin/gap, typography, dimensions, radius and motion values repeated outside the theme. Dynamic expressions and token references require manual review; this lexical inventory does not evaluate computed styles.

File:line | Direct numeric declarations
--- | ---
`app/chat/[id].tsx:64` | `flex:1`
`app/chat/[id].tsx:65` | `flex:1`
`app/chat/[id].tsx:68` | `minWidth:44`, `minHeight:48`, `size={26}`
`app/chat/[id].tsx:69` | `size={40}`, `flex:1`, `minWidth:44`, `minHeight:48`, `size={24}`
`app/chat/[id].tsx:71` | `borderWidth:1`
`app/chat/[id].tsx:77` | `flex:1`
`app/chat/[id].tsx:83` | `borderTopWidth:1`
`app/chat/[id].tsx:84` | `maxHeight:120`, `flex:1`
`app/chat/[id].tsx:88` | `flex:1`
`app/create.tsx:80` | `flex:1`
`app/create.tsx:81` | `flex:1`
`app/create.tsx:82` | `borderBottomWidth:1`
`app/create.tsx:84` | `minWidth:48`, `minHeight:48`
`app/create.tsx:85` | `size={28}`
`app/create.tsx:87` | `flex:1`
`app/create.tsx:93` | `flex:1`
`app/create.tsx:105` | `minHeight:200`
`app/create.tsx:115` | `flex:1`
`app/create.tsx:116` | `maxWidth:440`
`app/home.tsx:88` | `flex:1`
`app/home.tsx:98` | `flex:1`
`app/home.tsx:101` | `flex:1`, `flexGrow:1`
`app/home.tsx:110` | `bottom:120`
`app/index.tsx:24` | `width:88`, `height:88`, `size={40}`
`app/index.tsx:26` | `height:8`
`app/messages.tsx:32` | `flex:1`
`app/messages.tsx:35` | `flexGrow:1`
`app/messages.tsx:38` | `borderWidth:1`
`app/messages.tsx:39` | `flex:1`
`app/messages.tsx:40` | `flexShrink:1`
`app/notifications.tsx:31` | `flex:1`
`app/notifications.tsx:32` | `flexGrow:1`
`app/notifications.tsx:34` | `flex:1`
`app/notifications.tsx:41` | `borderWidth:1`
`app/notifications.tsx:42` | `minHeight:48`, `flex:1`, `width:8`, `height:8`
`app/post/[id].tsx:65` | `flex:1`
`app/post/[id].tsx:66` | `flex:1`
`app/post/[id].tsx:95` | `flex:1`, `minHeight:48`
`app/post/[id].tsx:101` | `size={32}`, `flex:1`
`app/post/[id].tsx:110` | `borderTopWidth:1`
`app/post/[id].tsx:114` | `flex:1`, `minHeight:48`, `maxHeight:128`, `borderWidth:1`
`app/profile-setup.tsx:72` | `minHeight:120`
`app/verification.tsx:72` | `width: 160`, `height: 160`
`components/activity-ui.tsx:12` | `width:48`, `height:48`
`components/activity-ui.tsx:13` | `size={25}`
`components/activity-ui.tsx:14` | `bottom:-2`, `end:-2`, `borderWidth:2`, `size={12}`
`components/activity-ui.tsx:29` | `size={20}`
`components/activity-ui.tsx:30` | `flex:1`
`components/activity-ui.tsx:31` | `minWidth:44`, `minHeight:44`, `size={20}`
`components/feed-ui.tsx:16` | `minHeight:44`
`components/feed-ui.tsx:17` | `borderWidth:1`
`components/feed-ui.tsx:27` | `lineHeight:20`
`components/feed-ui.tsx:28` | `borderWidth:1`
`components/feed-ui.tsx:29` | `minHeight:48`
`components/feed-ui.tsx:31` | `width:48`, `height:48`
`components/feed-ui.tsx:32` | `width:48`, `height:48`
`components/feed-ui.tsx:35` | `flex:1`
`components/feed-ui.tsx:47` | `lineHeight:28`
`components/feed-ui.tsx:48` | `lineHeight:25`
`components/home-feed-item.tsx:59` | `flex: 1`
`components/home-feed-ui.tsx:24` | `borderWidth: 1`
`components/home-feed-ui.tsx:25` | `width: 48`, `height: 48`, `size={24}`
`components/home-feed-ui.tsx:26` | `flex: 1`
`components/home-feed-ui.tsx:27` | `size={22}`
`components/home-feed-ui.tsx:44` | `borderWidth: 1`
`components/home-feed-ui.tsx:46` | `flex: 1`, `minHeight: 48`
`components/home-feed-ui.tsx:48` | `flex: 1`
`components/home-feed-ui.tsx:51` | `size={16}`
`components/home-feed-ui.tsx:57` | `minWidth: 44`, `minHeight: 44`, `size={24}`
`components/home-feed-ui.tsx:61` | `size={14}`
`components/home-feed-ui.tsx:66` | `opacity: 0`
`components/home-feed-ui.tsx:75` | `flexGrow: 1`, `minHeight: 44`
`components/home-feed-ui.tsx:76` | `size={19}`
`components/home-feed-ui.tsx:80` | `minHeight: 44`
`components/home-feed-ui.tsx:81` | `size={20}`
`components/home-feed-ui.tsx:83` | `size={18}`
`components/home-feed-ui.tsx:96` | `borderWidth: 1`
`components/home-feed-ui.tsx:97` | `width: 48`, `height: 48`, `flex: 1`
`components/member-profile-screen.tsx:49` | `flex:1`
`components/member-profile-screen.tsx:58` | `width:104`, `height:104`
`components/member-profile-screen.tsx:59` | `width:104`, `height:104`, `width:104`, `height:104`
`components/member-profile-screen.tsx:60` | `bottom:0`, `end:0`, `borderWidth:3`
`components/member-profile-screen.tsx:69` | `borderTopWidth:1`
`components/member-profile-screen.tsx:72` | `borderBottomWidth:1`
`components/member-profile-screen.tsx:73` | `flex:1`, `minHeight:48`, `borderBottomWidth:2`
`components/moderation-actions.tsx:21` | `flex:1`
`components/navigation-shell.tsx:22` | `borderTopWidth: 1`
`components/navigation-shell.tsx:30` | `flex: 1`, `minHeight: 56`
`components/navigation-shell.tsx:32` | `size={26}`
`components/navigation-shell.tsx:33` | `top: -3`, `end: -5`, `minWidth: 20`, `paddingHorizontal: 4`
`components/navigation-shell.tsx:34` | `fontSize: 11`, `lineHeight: 18`
`components/navigation-shell.tsx:37` | `fontSize: 10`
`components/navigation-shell.tsx:45` | `opacity: 1`
`components/navigation-shell.tsx:57` | `borderBottomWidth: 1`
`components/navigation-shell.tsx:58` | `minHeight: 64`
`components/navigation-shell.tsx:60` | `width: 32`, `height: 32`
`components/navigation-shell.tsx:63` | `minWidth: 48`, `minHeight: 48`
`components/navigation-shell.tsx:64` | `size={26}`
`components/navigation-shell.tsx:72` | `minHeight: 48`
`components/navigation-shell.tsx:73` | `size={24}`
`components/offer-help.tsx:16` | `flex:1`
`components/onboarding-frame.tsx:8` | `flex:1`
`components/onboarding-frame.tsx:9` | `flex:1`
`components/onboarding-frame.tsx:10` | `flexGrow:1`
`components/onboarding-frame.tsx:12` | `width:48`, `height:48`
`components/onboarding-ui.tsx:81` | `flex: 1`
`components/onboarding-ui.tsx:82` | `flexGrow: 1`
`components/onboarding-ui.tsx:83` | `flex: 1`
`components/onboarding-ui.tsx:85` | `flex: 1`
`components/onboarding-ui.tsx:89` | `fontSize: 22`, `letterSpacing: -0.6`
`components/onboarding-ui.tsx:90` | `width: 32`, `height: 32`, `borderRadius: 10`
`components/onboarding-ui.tsx:91` | `fontSize: 30`, `lineHeight: 32`
`components/onboarding-ui.tsx:92` | `letterSpacing: 0.4`
`components/onboarding-ui.tsx:95` | `letterSpacing: 1`
`components/onboarding-ui.tsx:97` | `borderWidth: 1`
`components/onboarding-ui.tsx:99` | `borderWidth: 1`
`components/onboarding-ui.tsx:102` | `borderWidth: 1`
`components/onboarding-ui.tsx:103` | `flexShrink: 1`
`components/onboarding-ui.tsx:106` | `opacity: 0.55`, `opacity: 0.75`, `scale: 0.985`
`components/onboarding-ui.tsx:107` | `borderStartWidth: 3`
`components/onboarding-ui.tsx:108` | `lineHeight: 22`
`components/onboarding-ui.tsx:109` | `borderWidth: 1`
`components/onboarding-ui.tsx:111` | `width: 24`, `height: 24`, `borderWidth: 1`, `borderRadius: 6`
`components/onboarding-ui.tsx:112` | `flex: 1`, `lineHeight: 22`
`components/onboarding-ui.tsx:114` | `lineHeight: 19`
`components/onboarding-ui.tsx:117` | `flex: 1`, `lineHeight: 22`
`components/onboarding-ui.tsx:119` | `flex: 1`, `minWidth: 140`
`components/onboarding-ui.tsx:121` | `lineHeight: 19`
`components/onboarding-ui.tsx:123` | `flex: 1`, `height: 3`
`components/onboarding-ui.tsx:124` | `lineHeight: 16`
`components/onboarding-ui.tsx:126` | `width: 56`, `height: 56`
`components/onboarding-ui.tsx:127` | `fontSize: 28`
`components/onboarding-ui.tsx:128` | `flexShrink: 1`
`components/onboarding-ui.tsx:129` | `height: 16`
`components/onboarding-ui.tsx:130` | `minHeight: 660`
`components/onboarding-ui.tsx:132` | `fontSize: 46`, `lineHeight: 54`, `letterSpacing: -1`
`components/onboarding-ui.tsx:133` | `lineHeight: 23`
`components/onboarding-ui.tsx:134` | `letterSpacing: 0.4`
`components/onboarding-ui.tsx:135` | `height: 220`
`components/onboarding-ui.tsx:136` | `width: 210`, `height: 210`, `borderRadius: 105`, `borderWidth: 1`
`components/onboarding-ui.tsx:137` | `width: 160`, `height: 160`, `borderRadius: 80`, `borderWidth: 1`
`components/onboarding-ui.tsx:138` | `width: 100`, `height: 80`, `borderRadius: 24`
`components/onboarding-ui.tsx:139` | `translateX: -35`, `translateY: -25`, `borderBottomEndRadius: 4`
`components/onboarding-ui.tsx:140` | `translateX: 45`, `translateY: 30`, `borderBottomStartRadius: 4`
`components/onboarding-ui.tsx:141` | `gap: 8`, `width: 8`, `height: 8`, `borderRadius: 4`, `fontSize: 40`
`components/profile-fields.tsx:9` | `minHeight: 120`
`components/profile-fields.tsx:40` | `width: 112`, `height: 112`
`components/search-ui.tsx:21` | `borderWidth:1`
`components/search-ui.tsx:22` | `size={22}`
`components/search-ui.tsx:23` | `flex:1`, `minWidth:0`, `minHeight:52`
`components/search-ui.tsx:44` | `width:208`, `borderWidth:1`
`components/startup-splash.tsx:62` | `flex: 1`
`components/startup-splash.tsx:63` | `flex: 1`
`components/startup-splash.tsx:79` | `top: 0`, `bottom: 0`, `left: 0`, `right: 0`
`components/startup-splash.tsx:80` | `width: 160`, `height: 160`
`components/startup-splash.tsx:82` | `marginTop: 104`
`components/startup-splash.tsx:84` | `maxWidth: 320`
`components/ui/feedback-pressable.tsx:14` | `minWidth:44`, `minHeight:44`
`components/ui/index.tsx:21` | `borderWidth: 2`
`components/ui/index.tsx:26` | `flexShrink: 1`
`components/ui/index.tsx:38` | `borderWidth: 1`
`components/ui/index.tsx:52` | `bottom: -2`, `end: -2`, `borderWidth: 2`, `minWidth: 22`, `minHeight: 22`
`components/ui/index.tsx:61` | `minHeight: 44`
`components/ui/index.tsx:62` | `borderWidth: 1`
`components/ui/index.tsx:69` | `borderWidth: 1`
`components/ui/index.tsx:72` | `height: 1`
`components/ui/index.tsx:98` | `borderWidth: 1`
`components/ui/index.tsx:99` | `flex: 1`
`constants/theme.ts:22` | `fontSize: 32`, `lineHeight: 40`
`constants/theme.ts:23` | `fontSize: 22`, `lineHeight: 30`
`constants/theme.ts:24` | `fontSize: 16`, `lineHeight: 24`
`constants/theme.ts:25` | `fontSize: 13`, `lineHeight: 18`
`constants/theme.ts:26` | `fontSize: 16`, `lineHeight: 24`
`constants/theme.ts:28` | `width: 0`, `height: 2`, `shadowOpacity: 0.06`, `shadowRadius: 8`, `elevation: 2`
`constants/theme.ts:39` | `shadowOpacity: 0.2`

## Duplicated style families

Family | Locations | Consolidation proposal
--- | --- | ---
Buttons | `components/onboarding-ui.tsx` ActionButton; `components/ui/index.tsx` Button; screen-level icon Pressables | One geometry and feedback contract with compatible visual variants.
Inputs | EmailInput/ProfileField; ui Input; Create inline title/body | Share focus, border, typography and helper/error presentation.
Post cards | `components/feed-ui.tsx`; `components/home-feed-ui.tsx` | One visual anatomy with existing actions injected.
Avatar/verification | ui Avatar; feed-ui; member-profile-screen; ProfilePhoto; activity-ui | Shared circular geometry, fallback and badge positioning; do not invent unavailable image data.
Screen containers | onboarding-frame; raw SafeAreaView/ScrollView containers throughout app | Shared inset/width and keyboard-aware presentation.
Sheets | offer-help; home-feed-item; chat; moderation-actions | Shared scrim, max-width, safe-area, header and action placement.
Skeletons | onboarding-ui LoadingSkeleton; ui LoadingSkeleton; home-feed-ui | Shared primitives with content-specific dimensions.
Metadata | s.note across profile, notifications, messages, offers and forms | Separate aligned helpers/metadata from centered short captions.
Chips/choices | ProfileChoices; FilterChips; ui Chip; post-type controls | Consistent selected state, typography and visible geometry with 44px hit regions.

### Repeated flat style objects (mechanical inventory)

Exact normalized flat style declarations repeated in multiple files are shown below. Common flex/gap patterns are not inherently bugs; this inventory identifies candidates for shared primitives. Nested objects are excluded.

Declaration | Locations
--- | ---
`flex:1,backgroundColor:t.colors.background` | `app/chat/[id].tsx:64`, `app/home.tsx:98`, `app/messages.tsx:32`, `app/notifications.tsx:31`, `app/post/[id].tsx:65`, `components/member-profile-screen.tsx:49`, `components/onboarding-frame.tsx:8`
`flex:1,gap:t.spacing.xs` | `app/create.tsx:93`, `app/messages.tsx:39`, `components/feed-ui.tsx:35`, `components/home-feed-ui.tsx:48`
`flex:1,justifyContent:'flex-end',backgroundColor:t.colors.scrim` | `app/chat/[id].tsx:88`, `components/moderation-actions.tsx:21`, `components/offer-help.tsx:16`
`flexDirection:'row',alignItems:'center',gap:t.spacing.compact` | `app/create.tsx:92`, `components/onboarding-frame.tsx:12`
`flexDirection:'row',alignItems:'center',gap:t.spacing.sm` | `app/chat/[id].tsx:67`, `app/post/[id].tsx:101`, `components/navigation-shell.tsx:59`
`flexDirection:'row',flexWrap:'wrap',gap:t.spacing.sm` | `app/create.tsx:100`, `app/create.tsx:108`, `app/post/[id].tsx:90`, `components/feed-ui.tsx:49`, `components/home-feed-ui.tsx:70`, `components/member-profile-screen.tsx:68`, `components/member-profile-screen.tsx:71`, `components/offer-help.tsx:90`, `components/profile-fields.tsx:18`
`flexDirection:'row',gap:t.spacing.sm` | `app/index.tsx:26`, `app/post/[id].tsx:94`
`gap:t.spacing.compact` | `components/home-feed-ui.tsx:59`, `components/search-ui.tsx:43`, `components/ui/index.tsx:91`
`gap:t.spacing.md` | `app/home.tsx:105`, `app/messages.tsx:36`, `app/notifications.tsx:33`, `components/feed-ui.tsx:43`, `components/offer-help.tsx:64`, `components/onboarding-frame.tsx:15`, `components/search-ui.tsx:18`, `components/search-ui.tsx:41`
`gap:t.spacing.sm` | `app/create.tsx:100`, `app/create.tsx:108`, `app/index.tsx:25`, `app/notifications.tsx:39`, `app/post/[id].tsx:79`, `app/post/[id].tsx:84`, `app/verification.tsx:71`, `components/home-feed-item.tsx:52`, `components/member-profile-screen.tsx:85`, `components/moderation-actions.tsx:18`, `components/offer-help.tsx:90`, `components/onboarding-frame.tsx:14`, `components/search-ui.tsx:27`, `components/search-ui.tsx:29`, `components/ui/index.tsx:32`
`padding:t.spacing.lg,gap:t.spacing.md` | `app/chat/[id].tsx:89`, `components/home-feed-item.tsx:61`, `components/moderation-actions.tsx:22`, `components/offer-help.tsx:18`
`padding:t.spacing.lg,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center'` | `app/post/[id].tsx:67`, `components/member-profile-screen.tsx:50`
`padding:t.spacing.lg,gap:t.spacing.md,maxWidth:t.layout.content,width:'100%',alignSelf:'center',flexGrow:1` | `app/messages.tsx:35`, `app/notifications.tsx:32`
`width:48,height:48,borderRadius:t.radius.md` | `components/feed-ui.tsx:31`, `components/onboarding-frame.tsx:12`

## Source coverage

- `app/_layout.tsx`
- `app/auth/callback.tsx`
- `app/chat/[id].tsx`
- `app/create.tsx`
- `app/edit-post/[id].tsx`
- `app/edit-profile.tsx`
- `app/eligibility.tsx`
- `app/email.tsx`
- `app/home.tsx`
- `app/index.tsx`
- `app/member/[id].tsx`
- `app/messages.tsx`
- `app/notifications.tsx`
- `app/post/[id].tsx`
- `app/profile-setup.tsx`
- `app/profile.tsx`
- `app/search.tsx`
- `app/verification.tsx`
- `components/activity-ui.tsx`
- `components/auth-provider.tsx`
- `components/feed-ui.tsx`
- `components/home-feed-item.tsx`
- `components/home-feed-ui.tsx`
- `components/member-profile-screen.tsx`
- `components/moderation-actions.tsx`
- `components/navigation-shell.tsx`
- `components/notification-provider.tsx`
- `components/offer-help.tsx`
- `components/onboarding-frame.tsx`
- `components/onboarding-ui.tsx`
- `components/profile-fields.tsx`
- `components/search-ui.tsx`
- `components/sign-out-button.tsx`
- `components/startup-splash.tsx`
- `components/ui/feedback-pressable.tsx`
- `components/ui/index.tsx`
- `constants/theme.ts`
