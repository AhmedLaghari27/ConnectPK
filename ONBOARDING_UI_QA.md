# Onboarding UI QA — 2026-10-10

Skills: senior-ui-ux-designer, senior-app-developer-ui, ui-qa-checklist.

| Screen | Problem | Severity | Fix |
| --- | --- | --- | --- |
| Profile setup | Navigation buttons scrolled away with fields | High | Added a footer slot to OnboardingFrame; moved existing Next/Back controls below the scroll area inside keyboard avoidance and safe area |
| Onboarding | Horizontal margins used 24px | Medium | Standardized to 16px; centered maximum 600px content |
| Welcome/login | Animated button wrapper lost web layout styling | Medium | Used existing native DetailButton component with original handlers |
| Login | Show-password checkbox stacked vertically | Medium | Native pressable for existing checkbox, retaining checked state and handler |
| Profile | Choice controls lost styling; photo size inconsistent | Medium | Native pressables and circular 80px profile photo |
| Verification | Selected selfie preview aligned left | Medium | Centered square preview, preserving camera and upload behavior |
| Verification | Status hierarchy too large | Low | Shared status card with title typography and left-aligned badge |

## Preserved behavior and scope
- No auth, routing, validation, API, query or service logic changed.
- Login remains email/password, following the earlier approved choice. There is no resend function or email-link/check-email flow to restyle; adding one requires a separate auth change. No misleading countdown was added.
- Existing splash logo container is geometrically centered with name/tagline below. The 4.5-second timer and brand background/native splash configuration were already present and remain unchanged. Existing access checks can keep the splash visible longer; changing that would change startup behavior.
- Profile still shows exactly the existing group for each of its five steps. Existing validation messages, navigation and save handlers remain.
- Camera uses the existing native image-picker interface. Only the selected-photo preview layout was changed; no embedded camera or new permission flow added.

## Checks performed
- `npm run typecheck`: passed.
- `npx expo export --platform web --output-dir /tmp/connectpk-onboarding-check`: passed; only terminal color-environment warnings.
- Actual Welcome at 390x844: advanced all three slides and opened the existing login screen.
- Actual login: checked signup/sign-in layouts without submitting credentials.
- Profile preview at 360x640: footer button measured 48px high and remained visible; form content occupies a separate scroll region. Error text rendered below its input.
- Dark verification preview at 390x844: status badge, title and text aligned and readable.
- Verification at 430x932: 16px margins, 398px content width.
- Desktop at 1280x900: 600px content centered at x=340.
- Final browser console returned no error entries.

## Screenshots and limits
Welcome/login screenshots show actual unauthenticated screens. Profile setup and verification screenshots use labeled sample-data previews sharing the production frame, fields and status card. These do not establish authenticated save/upload behavior.
Native iOS/Android keyboard, camera permission, safe-area behavior, cold-start white flash and accessibility text scaling remain device checks. No physical-device pass is claimed. Other verification statuses were source-reviewed, not all rendered in this session.

## Changed files
app/index.tsx, app/email.tsx, app/profile-setup.tsx, app/verification.tsx, components/onboarding-frame.tsx, components/onboarding-ui.tsx, components/profile-fields.tsx, components/verification-status-card.tsx, app/_onboarding-preview.tsx.

## Manual test
Cold-start the installed app; check splash and launch transition. Advance Welcome and sign in normally. Complete each profile group, checking keyboard and pinned buttons on a small phone. Capture a selfie and check its centered preview; review pending, approved and rejected status layouts without exposing evidence publicly.
