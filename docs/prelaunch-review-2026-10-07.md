# ConnectPK pre-launch review — 7 October 2026

**Decision: suitable for further staging tests, not yet a launch sign-off.** No confirmed critical authorization bypass was found in this source review. Several high-priority abuse/privacy gaps should be addressed before inviting 50–100 members. No application code, policies, dependencies, hosted settings or user data were changed. This report is the only new file for this review.

Skills: frontend/backend security, privacy and testing guidance in `.claude/skills/skill.md`; current `PROJECT.md` overrides that guide's older product rules.

Scope: local migrations, client services, key mobile screens, staff authentication/evidence handling, push worker and build configuration. This is not a penetration test or confirmation of the hosted database configuration. Existing migrations must be applied in order; policies visible in source do not prove the same policies are live. Production Auth settings, bucket configuration, secrets, scheduler, backups, native-device behavior and store accounts were not inspected.

## 1. Security findings, in priority order

### High: offers accept explicit scam wording

`lib/offer-model.ts:9` validates only the type and message length; `supabase/migrations/20261006120000_professional_feed_schema.sql:65` similarly constrains message length. The post-content trigger applies to posts, not offers. A local call to `validateOffer('funding_interest', 'Send me money for guaranteed returns.')` returns `null` (valid). A client-only filter would still be bypassable through REST.

Add a narrowly scoped server-side offer validation trigger first, with matching friendly client validation, Unicode normalization and regression cases for legitimate funding conversations. Do not describe keyword checks as fraud detection. Include Urdu/Roman Urdu and evasion cases in manual moderation training. This is a high-priority abuse gap, not a confirmed critical access-control exploit; left unchanged under the requested critical-only fix scope.

### High: incomplete abuse and storage quotas

- Posts and offers have robust database quotas: 3 and 20 per Pakistan calendar day, serialized with a profile row lock and backed by an append-only creation ledger. Deletion cannot reset the allowance (`20261006130000_feed_access_control.sql:89`).
- Comments/reaction churn have no comparable rate limiter in the reviewed migrations. `send_chat_message` validates size and retry nonce, but has no per-minute/day cap (`20261006180000_messages.sql:20`). Accepted chat can therefore be flooded. Reports are deduplicated per reporter/target but have no overall submission cap across different targets.
- Profile-photo insertion checks the user's directory and a 5 MB per-object ceiling, but does not restrict total objects/bytes or require an approved member (`20261005120000_profile_setup.sql:15`). A signed-in account can upload many distinct objects. Verification starts are capped at 10/hour, but abandoned uploads have no cleanup/retention job in the reviewed source.
- `set_device_push` accepts syntactically valid tokens without a per-user device count cap (`20261007090000_notifications.sql:60`). Fake token registrations can amplify storage/work-queue costs; token ownership is not independently demonstrated by registration.

Add transactional per-member burst/daily limits, bounded active device registrations and storage quotas. Keep legitimate safety reporting available when applying report limits. Add scheduled cleanup of abandoned uploads with retention exclusions for submitted evidence and open reports. Monitor counts and costs during the pilot.

### High privacy risk: image metadata is not authoritatively stripped

`lib/profile-service.ts` and `lib/verification-service.ts` upload image bytes after client-side signature/size checks. Picker `exif:false` avoids returning metadata to JavaScript; it does not establish a server-side guarantee that every uploaded image has no embedded GPS/EXIF data. REST clients can bypass the picker. Profile-photo recipients can download the image bytes.

Before making a strong location-privacy guarantee, re-encode images in a trusted upload pipeline and strip metadata, enforce actual format/dimensions and reject malformed files. Test a known GPS-tagged JPEG downloaded through the member API. No actual metadata leak was demonstrated in a user image; this is an unclosed exposure path.

### Medium: direct profile writes bypass the profile RPC's text checks

`20261005093000_connectpk_rls.sql:89` grants own-profile updates to name, headline, bio, avatar path and other fields. Its policy checks ownership, not the later `save_member_profile` professional wording checks or approved status. A caller can therefore bypass those RPC validations, although they cannot change role/approval status. Verified members can also change the identity name/photo without re-verification through the intended edit flow.

Move shared text validation to database constraints/triggers or restrict direct writes after checking onboarding compatibility. Decide which identity changes require re-review. This is not a role-escalation finding.

### Medium: Auth configuration and recovery are not pilot-ready by default

Local `supabase/config.toml:183` allows six-character passwords, while signup UI asks for eight. Email confirmations are disabled locally (`:227`) and TOTP enrollment/verification disabled (`:303`); hosted values may differ. The staff portal requires TOTP, so local setup will fail until enabled. Email/password signup without confirmation does not prove ownership of the email address. No password-reset, account-deletion/export or suspension appeal UI was found in the reviewed app routes.

Verify hosted password/rate-limit settings explicitly, enable staff TOTP, plan email ownership/recovery before opening signup, and define a support/deletion/appeal process for the pilot. Keep signup controlled until these are ready. Do not turn on email confirmation without working delivery and the corresponding user flow.

### Medium: suspension does not automatically remove all public content

`feed_post_visible` checks the viewer's approval, active post status and blocking, not the author's current membership status (`20261006130000_feed_access_control.sql:8`). Staff suspension/ban changes profile state, so a sanctioned member loses approved-member actions, but their existing active posts can remain visible. `feed_chat_visible` similarly checks the current viewer, not both profiles; existing approved counterparts may retain conversation access. This is distinct from block, which checks both directions.

Decide whether suspension should quarantine existing content and close chats. For the pilot, moderators must remove harmful posts separately and understand that a ban is not an Auth-level account deletion/session revocation.

### Medium: staff evidence reads can bypass portal audit logging

The portal's `admin_evidence` RPC records access and its proxy uses private/no-store responses. But AAL2 staff also have direct Storage SELECT and verification-table access via RLS. Authorized staff could use those APIs without invoking the audited RPC. This is not member access, but means “every evidence read is audited” is too strong. Use platform access logs or a single audited server-side retrieval mechanism if that guarantee is required.

### Protections present in the source

- RLS is enabled on feed tables; ownership columns and moderation fields are not broadly client-writable. Profiles expose own rows directly; public member/profile/feed RPCs select explicit public fields.
- Verification bucket is private with restrictive member/anonymous read guards, immutable client uploads, allowed MIME types and per-object size limits. Staff evidence reads require approved staff + AAL2 after the admin migration.
- Offers are private to the pair; server-side status transitions distinguish owner accept/decline from offerer withdrawal. Conversations are trigger-created only for accepted offers. Chat sends recheck membership/visibility and have retry idempotency.
- Bidirectional block predicates protect feed, profiles, offers and chats. Short-lived photo URLs can remain usable after blocking until expiry; already downloaded images cannot be recalled.
- Reports preserve snapshots, flag scam/fraud as high severity, and hide posts after three distinct open reporters. Staff decisions require notes and audit records, with stale-decision protection.
- Native sessions use SecureStore. Admin uses server-side HTTP-only cookies, verified user/role checks and MFA. Service-role credentials are referenced only in the server push worker in the reviewed code. This was not a full Git-history secret scan.

## 2. Error, empty and recovery states

Feed, messages, chat, offers, member profiles, verification and notifications contain loading/error/empty or unavailable states; the reviewed lists have retry paths. Do not treat passing model tests as visual/device verification.

Specific gaps:

1. **Suspended/banned accounts:** `AuthProvider` only distinguishes auth/eligibility/profile completion, and feed access failure shows the generic “complete verification and wait” copy (`constants/feed-copy.ts:10`). Add distinct restricted-account guidance and a support/appeal path; avoid sending already verified suspended members back to verification.
2. **Evidence upload on poor connectivity:** `uploadEvidence` has no explicit application timeout/cancellation, and the screen disables refresh/signout while busy. Test dropped connections; add a bounded retry/cancel state without duplicating a submitted verification. Profile-photo upload has a similar wait risk.
3. **Rejected verification:** the status screen gives generic rejection copy but does not receive the moderator's review note. Decide which feedback is safe to share and provide a correction/resubmission reason without exposing internal notes.
4. **Account recovery:** password-reset and deleted/restricted-account support flows are missing. Existing confirmation-required text refers to a development administrator rather than a launch support route.
5. **Offline and long-lived screens:** several failures clear visible lists; this is conservative for privacy, but can feel like data loss. Test stale approval/block state, expired photo URLs, reconnect, pagination and drafts under flight-mode toggling. Preserve safe drafts, never stale private access.
6. **Admin:** queues have empty states and a generic error boundary; exercise real MFA enrollment, evidence download failures, expired sessions and stale decisions on a configured project. Browser end-to-end verification is still outstanding.

## 3. Privacy confirmation — qualified, not absolute

**No dedicated phone-number or exact-location field was found on the reviewed member-facing feed/profile/offer/chat screens.** Public profile RPCs expose city, professional fields and profile photo; they do not project phone, date of birth, verification paths or evidence links. Broad area is entered in private setup, not the public profile projection.

It would be incorrect to confirm that *no screen anywhere* shows verification evidence: `app/verification.tsx:65` previews the member's own newly captured selfie locally, and the restricted admin verification queue intentionally opens evidence for review. Members do not fetch other members' stored verification evidence in the reviewed code.

User-authored titles, bodies, comments, offers, names and messages can still contain phone numbers, addresses or private information. Free-text rendering and keyword checks do not prevent that. Public images can contain visible documents/address information or metadata. Thus a categorical “the app never displays private information” claim is not currently proven. Add input guidance, targeted PII detection/redaction where appropriate, review/report tooling and metadata stripping; disclose the limits honestly.

## 4. Offer/funding spam and scam controls

Existing: verified senders, one offer per member/post including after withdrawal, 20/day, private pair visibility, owner acceptance before chat, warning on funding offers, reporting/blocking and no payment processing.

Recommended order, separate changes:

1. Apply server/client offer text checks with tests for direct REST bypass and false positives.
2. Add burst limits and repeat-message detection across posts; use lower initial limits for newly approved accounts, with a documented review path.
3. Show the warning regardless of whether a sender labels their money pitch “funding” or “advice”; verified identity must not imply financial trust. Strengthen copy to say verification is not a guarantee and never share OTPs/bank credentials or pay advance fees.
4. Review duplicate identities and suspicious funding patterns manually. Do not assume a selfie proves liveness, identity authenticity or investment legitimacy.
5. Protect against three-account report brigading: review auto-hidden posts promptly, monitor reporter patterns and preserve appeal context. Do not silently lower the user's required three-report threshold.
6. Keep funding as expressions of interest only. No payment links generated by the app, custody, investment promises or money-handling workflow.

## 5. Pilot checklist: 50–100 members

- [ ] Use a staging Supabase project first. Apply migrations in order; run `supabase/checks/installation-audit.sql` on the intended project. Never blindly rerun a partly applied creation migration or use database reset on production.
- [ ] Run SQL integration suites in a disposable migrated database, including `tests/offer-help.sql`, `messages.sql`, `moderation.sql`, `notifications.sql`, `admin-portal.sql`, `admin-content-actions.sql`; run `moderation-concurrency.py` according to its setup. Object-existence audits alone do not prove RLS behavior.
- [ ] Exercise anonymous, pending, approved A/B/C, suspended and AAL1/AAL2 staff accounts through the actual API. Try role/status edits, other-member drafts, evidence retrieval, manufactured accept, blocked reads and quota races. Denials must hold outside the UI.
- [ ] Close the high-priority offer filtering, burst/quota and image-metadata gaps; validate live Auth settings. Verify signup is controlled and email recovery has an owner.
- [ ] Define evidence/report retention and abandoned-file cleanup. Test backup restore. Establish a documented account deletion/export request path; preserve safety evidence only under the defined policy.
- [ ] Have at least two trained staff with individual MFA accounts, a recovery process, daily queues and an urgent scam-report escalation owner. Use synthetic evidence for training.
- [ ] Test real Android and iPhone: signup, profile, camera denial, selfie upload, approval, post, offer/accept, chat, report, block, leave, signout/account switch, foreground/background reconnect and push. No private content should appear on lock-screen notifications.
- [ ] Deploy/schedule the push worker, verify its secret, retries, invalid-token cleanup, APNs/FCM credentials and opt-out behavior. Confirm no duplicate flood when reconnecting.
- [ ] Publish actual conduct/privacy/support information, truthful verification wording, age eligibility and store privacy disclosures. Review platform account-deletion requirements before store submission.
- [ ] Start with 10–15 invited members, check failures/queue load, then 50, then 100. Track accepted offers, useful-conversation feedback (not yet an established measurement flow), reports, failed uploads and support volume. Define pause criteria for data exposure or unresolved serious fraud.

Validation performed this turn: all **37 JavaScript model/service tests passed**, root TypeScript passed, admin TypeScript and lint passed. The targeted scam-offer acceptance check reproduced the gap above. SQL suites, native builds, live hosted RLS, push delivery and browser/device flows were **not rerun** in this review. Previous local SQL results do not establish current hosted state.

## 6. Android and iOS builds with Expo EAS

These are instructions, not builds already executed. Run from the ConnectPK root, not `/admin`. The admin Next.js portal deploys separately.

Current configuration: `eas.json` already has development, preview and production profiles; EAS project/owner and iOS bundle ID exist. **`expo.android.package` is missing** from `app.json`. Choose the permanent Android application ID before the first build (for example, `com.ahmed27steam.connectpk` if that namespace is yours); EAS can prompt for it. Do not change the existing iOS bundle ID casually. See [Expo build configuration](https://docs.expo.dev/build-reference/build-configuration/).

1. Check tooling and account:

```sh
cd /Users/macbookair/Documents/ConnectPK
npm ci
npx expo-doctor
npx expo install --check
npx eas-cli@latest login
npx eas-cli@latest whoami
```

Use your Expo account, with access to `ahmed27s-team`. This is not the Supabase login. Resolve dependency-check errors deliberately before building; do not automatically force upgrades.

2. In the Expo dashboard for this existing project, configure both **preview** and **production** environments:

```text
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use the staging project for preview and intended live project for production. These values are embedded in the app; never put service-role, worker, Apple or admin secrets in `EXPO_PUBLIC_*`. Verify the environment chosen for each profile. Current EAS resolves preview/internal builds to preview and store builds to production unless explicitly overridden. See [Expo environment variables](https://docs.expo.dev/eas/environment-variables/usage/).

3. Android installable pilot build:

```sh
npx eas-cli@latest build --platform android --profile preview
```

Confirm the Android package when prompted, let EAS manage the signing keystore if appropriate, and install the resulting APK from its build link on a test device. The existing internal preview profile is suitable for sharing an APK. Keep the signing credentials recoverable. See [internal distribution](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/).

4. iPhone internal preview (requires appropriate Apple Developer membership/signing):

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

Register each test iPhone before building; ad hoc distribution only installs on provisioned devices. Follow the device registration link and signing prompts yourself. For a 50–100-person iOS pilot, TestFlight is generally easier than repeatedly registering devices. See [EAS build profiles](https://docs.expo.dev/build/eas-json/).

5. iOS TestFlight build/upload:

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

Choose the intended build, complete App Store Connect setup and testing information, and invite testers in TestFlight. External testers may require beta review. EAS upload is not an automatic public App Store release. See [Expo iOS submission](https://docs.expo.dev/submit/ios/) and [TestFlight](https://docs.expo.dev/submit/testflight/).

6. Android Play testing build:

```sh
npx eas-cli@latest build --platform android --profile production
```

Use the resulting AAB with Google Play Console's internal testing track. Complete the first app setup/upload and required Play signing/privacy details; configure EAS Submit credentials later if automating subsequent uploads. Do not assume the empty production submit profile selects your intended testing track. Preview APK distribution can precede Play publication.

7. Verify push on installed builds, with APNs and FCM v1 configured for the correct identifiers/project. Camera, login, MFA on admin, uploads and moderation must be tested against the matching environment. A successful EAS build confirms packaging/signing, not backend security or feature correctness.
