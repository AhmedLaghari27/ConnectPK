# ConnectPK

Minimal Expo + TypeScript + Expo Router starter. `PROJECT.md` was not present at setup time.

## Run locally

```sh
cd /Users/macbookair/Documents/ConnectPK
npm ci
cp .env.example .env
```

Fill in `.env` with values from your Supabase project's Connect dialog:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the public publishable key (`sb_publishable_...`), never a secret or service-role key. Expo embeds `EXPO_PUBLIC_` values in the app bundle.

```sh
npm start
```

Scan the QR code with Expo Go, or press `i` for an installed iOS simulator or `a` for an Android emulator. Run `npm run web` for the browser. Restart Expo after editing `.env`.

## Verify

```sh
npm run typecheck
npx expo install --check
npx expo export --platform all
```

The welcome screen shows ConnectPK and the three supported cities. Email sign-in requires the environment variables above. Live Supabase connectivity requires your own project credentials.

## Structure

- `app/`: Guarded onboarding routes, email callback, a five-step profile form, and the professional Feed.
- `components/`: Shared onboarding UI and session provider.
- `lib/supabase.ts`: Supabase client with persisted sessions.
- `constants/theme.ts`: Light/dark colors, spacing, typography, and motion tokens.
- `constants/copy.ts`: Shared English interface copy.
- `types/`: Reserved for shared TypeScript types.

Setup follows the official [Expo Router installation guide](https://docs.expo.dev/router/installation/) and [Supabase React Native guide](https://supabase.com/docs/guides/auth/quickstarts/react-native).

Screens use a responsive ivory/forest theme, accessible controls, and reduced-motion-aware transitions. Native sessions use Expo SecureStore, migrating existing AsyncStorage sessions on read; web sessions use Supabase's browser storage. Rebuild an existing native development client after adding SecureStore. Profile setup is a five-step form; home shows the professional Feed.

## Development email/password authentication

ConnectPK now has Create account and Sign in forms. Signup uses Supabase `signUp`; login uses `signInWithPassword`. Passwords are sent only to Supabase Auth, never stored in profile data or logged. New accounts follow age/conduct → profile → verification; existing sessions resume onboarding. The old callback remains available for previously sent links.

**Required dashboard setting:** Supabase → Authentication → Sign In / Providers → Email → turn **Confirm email OFF**, leave Email and new-user signup enabled, then Save. On 6 October 2026 the hosted project still had email confirmation ON. This has not been changed remotely. Local `supabase/config.toml` already disables confirmations; that file does not change the hosted project. Set the hosted minimum password length to at least 8 to match the signup form.

With confirmation disabled, new signup/sign-in does not need SMTP, email templates, OTP, or redirect links. Existing redirect URLs can remain. No SQL migration or `.env` change is required. This is a development configuration: email ownership is not verified. Restore email verification or use a verified identity provider before public launch. Selfie verification and account approval remain separate requirements for introductions.

Accounts created earlier through OTP/magic links do not automatically have passwords. Use a **new test email** for this flow, or set a password for an existing account through an authenticated/trusted recovery process. Do not delete accounts with profile data. Password reset is intentionally unavailable until email delivery is configured; no nonfunctional reset button is shown.

Test: reload the app, create an account with a new test email and matching password (8–128 characters), finish the age/conduct step, then sign out and sign in again. Check wrong-password errors, mismatched confirmation, returning-profile routing, and persistence after reload. Supabase must return a session before the app treats signup/login as successful.

The age and conduct checkboxes save an affirmation, conduct version, and acceptance timestamp in Auth user metadata. These are onboarding state, not proof of age, trusted authorization, or approval. Profile completeness uses the schema's required full name, date of birth, city, and intention. Profile setup now collects these fields and requires a final server-confirmed save before routing to home.

```sh
npm run typecheck
node --experimental-strip-types --test tests/*.test.mjs
npx expo export --platform all
```

Manual checks: malformed email; weak/mismatched passwords; wrong credentials; new-account signup; returning-account sign-in; session restored on reload; sign out; profile-fetch retry. No real emails are sent by the automated tests.


## Five-step profile setup

Apply `supabase/migrations/20261005120000_profile_setup.sql` in Supabase’s SQL Editor **after the two earlier migrations**, before opening this app version. This adds an owner-private `profile_setup` draft table, a private `profile-photos` bucket (JPEG/PNG, 5 MB), and the authenticated `save_profile_setup` RPC. No environment variables change. This migration has been tested locally, not applied to your hosted project.

The form covers identity, professional background, skills/interests/languages, goals, and concrete availability windows in Pakistan time. Date of birth and one intention are included because the existing schema requires them. Photo selection uses Expo ImagePicker; rebuild an existing native development client to include the dependency/configuration. No camera, microphone, verification, or approval workflow is added.

`Save & continue` validates the current step and saves the private draft. Back retains edits in memory; unsaved edits on the current step are lost on reload. Final submission validates all five steps, then atomically saves profiles, profile skills, availability, and extended profile details. `professional_role` means job title; it never changes the authorization `role`. Completion is server-managed, and accounts remain pending approval. An interrupted final request can be retried safely.

Client and server use a basic English keyword list for romantic/sexual wording, including case and Unicode-width normalization. This is an explicit keyword check, not comprehensive moderation or a verification system. The photo bucket currently allows only owner access; future recommendation photo delivery needs a separate authorized flow.

Checks:
1. Submit empty fields, an under-18 birth date, and a restricted term; confirm friendly errors and no advance.
2. Select/change a JPEG or PNG; reject oversized/unsupported files and confirm upload errors allow retry.
3. Complete steps 1–3, reload, and confirm the saved draft resumes without exposing another member’s draft/photo.
4. Test independent versus organization, list limits, and past/overlapping/short availability windows.
5. Finish all steps, confirm one profile with pending/member status and saved skills/windows, then reload and confirm home. Test disconnect/retry during saving.

Run `npm run typecheck` and `node --experimental-strip-types --test tests/*.test.mjs`. For a disposable Supabase-compatible test database with all migrations applied, run `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/profile-setup.sql` (transaction rolls back fixtures). Lint remains unavailable because this project has no lint script/configuration. Real photo upload and signed-in device UI checks still require your hosted setup.

## Private verification

Apply `supabase/migrations/20261005140000_private_verification.sql` in Supabase SQL Editor after the previous migrations. It provisions the **private** `verification` bucket and authenticated submission/status functions. The migration is tested locally, not applied to the hosted project. No environment-variable changes are needed.

Rebuild an existing native development client for the camera permission change. Open verification after profile setup, allow camera access, capture a fresh selfie, optionally add LinkedIn/portfolio HTTPS links or JPEG/PNG work/university proof (5 MB per image), then submit. Selfie capture uses the native camera on iOS/Android; web displays instructions to use the mobile app. Camera capture is not liveness detection or automatic identity approval.

Members see only `unverified`, `pending`, `approved`, or `rejected` through `my_verification_status()`. No verification row means unverified. Rejected members can submit again. Review/approval remains a trusted backend operation; no admin UI or automatic approvals have been built. Email sign-in means the legacy private phone field is now optional; phone ownership is never fabricated.

Evidence is insert-only under server-issued upload IDs, with 24-hour upload windows and ten upload reservations per member per hour. Members cannot download/list evidence, create evidence signed URLs, overwrite evidence, set status, or read another member’s verification. Only existing authorized staff can read evidence. Links stay in the staff-only verification row and are not fetched by the app. Abandoned uploads stay private; automated retention cleanup is not implemented in this step.

Both members must have approved verification **and** approved account status before the database accepts an introduction. Existing recommendation and mutual-match reads also check verification, so a client cannot bypass the restriction or keep reading after verification is revoked.

Test on a real device: deny/retry camera permission; capture/retake; submit with and without optional proof; reject invalid links/oversized files; interrupt and retry upload; refresh pending/approved/rejected statuses; resubmit after rejection. Run `node --experimental-strip-types --test tests/*.test.mjs`, `npm run typecheck`, and (on a disposable migrated database) `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/verification.sql`. SQL tests exercise evidence isolation, role restrictions, retries, and introduction gating. Actual camera hardware and hosted Storage uploads still need device testing.

## Professional Feed

Apply `supabase/migrations/20261006140000_feed_card_projection.sql` after the feed schema and access-control migrations in Supabase SQL Editor. This caller-bound function exposes only safe author fields and aggregate counts; full profiles, offer messages, and verification evidence remain private. Profile photos use short-lived signed URLs. No environment variables change. This migration was tested locally, not applied to the hosted project.

Sign in with an approved profile and approved verification to test the Feed. Use more than 20 active posts to check pagination, pull to refresh on mobile, filter by type/city, and search an exact tag (case-insensitive, optional #). Check empty filters and retry after a network failure. Unapproved members see their verification status entry point.

Feed, Create, Messages, and Profile are implemented; Notifications remains disabled. Tap Feed cards to open Post Detail. Offer Help is available on Post Detail.

## Create Post

Apply `supabase/migrations/20261006150000_create_post_support.sql` after the earlier feed migrations. It adds the private caller’s remaining quota and a simple server-side content check. The existing atomic three-post limit still applies, including deleted posts; days reset at midnight Pakistan time. No environment changes are needed.

Open Feed → Create with an approved account. Choose a type/city, enter a title (160 characters maximum), body (5,000 maximum), and up to five comma-separated tags (40 characters each). Publishing returns to the refreshed Feed. Test missing fields, six tags, romantic wording, “send me money”, and a fourth daily post. Keyword checks are deliberately simple and can produce false positives; they are not comprehensive scam detection.

Validation: `npm run typecheck`, `node --experimental-strip-types --test tests/post-form.test.mjs`, and `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/create-post.sql` against a disposable migrated database. Hosted account/device testing remains manual.

## Post Detail

Apply `supabase/migrations/20261006160000_post_detail.sql` after the Create Post migration. This adds caller-bound detail/opinion projections, private report submission, and per-member hidden posts; the feed excludes your hidden posts. No Realtime publication or environment changes are required. The detail screen polls every 15 seconds only while focused and foregrounded, and refreshes after actions.

Tap a Feed card to read the full body, toggle one professional reaction, add an opinion, delete your own opinion, and report any opinion. Post menu supports reporting, private hiding, blocking another author, and deleting your own post. Reports remain staff-only; post authors show a mini profile; offerers have a private profile preview for the post owner. Deletions retain moderation records through the existing soft-delete behavior.

Test with two approved accounts: reactions toggle/switch; opinions update within 15 seconds; only your own content has delete controls; hiding affects only your account; blocking removes direct detail access; reports remain private. Run `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/post-detail.sql` against a disposable migrated database for the transactional checks. Hosted/device UI checks remain manual.

## Offer Help

Apply `supabase/migrations/20261006170000_offer_help.sql` after the Post Detail migration. It adds safe offer/profile projections and private decision notifications in the same transaction as acceptance/conversation creation. No environment changes.

On another member’s post, choose Offer Help, one of six types, and a message up to 1,000 characters. Funding interest shows the required scam warning. The post owner can review offers and a basic professional profile (name, role, city, summary, verification badge), then accept or decline. Pending offers can be withdrawn; no replacement offer is allowed. Existing server limits enforce 20 offers daily.

Decision notifications are stored privately in `notifications`; offerers also see the polite decision on their offer within the active screen’s 15-second refresh. Push delivery and a Notifications inbox are not built. Accepted conversations are available in Messages.

Test with two approved accounts plus an unrelated third account: send funding interest and verify the warning, accept and check one conversation/notification, decline a different offer, withdraw another, and confirm outsiders cannot read offer messages/profiles. Run `node --experimental-strip-types --test tests/offer-model.test.mjs` and `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/offer-help.sql` on a disposable migrated database.

## Messages and text chat

Apply `supabase/migrations/20261006180000_messages.sql` in SQL Editor after the Offer Help migration. It adds closed-conversation state, safe inbox/report/send functions, retry deduplication, and the `chat_messages` / `conversations` tables to the Supabase Realtime publication. No `.env` change or extra Realtime toggle is needed. This migration has been tested locally, not applied to the hosted project.

Open Messages from the bottom tabs. Only accepted-offer conversations appear, with the other member’s name, related post title, and last message. Chat is text-only, capped at 4,000 characters. Realtime INSERT events refresh authorized data; reconnect and foreground refreshes plus a 15-second fallback recover missed events and revoke stale access. History loads 50 messages at a time; inbox pages contain 20 conversations.

The menu supports private reports, blocking, and leaving. Leaving ends the conversation for both participants and prevents future reads/sends; stored history remains for moderation. Sending and leaving serialize on the conversation row. The safety banner advises verification before sending money and meeting in public.

Test with two approved accounts on separate devices/windows: accept an offer, open Messages, exchange text and confirm live delivery; disconnect/reconnect and check recovery; retry a failed send and check no duplicate; report and confirm only moderators can read it; block or leave and verify both sides lose access within the next refresh. No image, voice, video, push notification, or read-receipt features were added.

Automated checks: `npm run typecheck`, `node --experimental-strip-types --test tests/chat-model.test.mjs`, and `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/messages.sql` against a disposable migrated database. Local PostgreSQL tests verify permissions and publication membership, not hosted Realtime WebSocket delivery.

## Public Profile and My Profile

Apply `supabase/migrations/20261006190000_member_profiles.sql` after the Messages migration. This adds explicit safe profile fields and author-post/own-offer projections while keeping the full profile table and onboarding data private. Public profiles are member-facing: approved signed-in viewers can see approved members unless either has blocked the other. Only the member’s city is returned—never phone, birth date, broad-area text, exact location, or verification evidence. Photo URLs last 60 seconds; open profile pages refresh every 15 seconds while foregrounded.

Tap a post’s author name/photo or use “Open public profile” from the offerer preview. The screen shows name, photo, verification badge, professional role, organization/independent status, city, skills, vision, help statement, and active posts. Hidden posts stay hidden from other members’ profile listings.

Profile tab shows your own profile, Edit profile, My posts with edit/delete, and My offers with their statuses. Editing public fields preserves private onboarding fields, birth date, availability, account role, and approval status. Photo changes use a new private object, so canceling does not overwrite the current profile photo. Editing a post keeps its ID and history and does not consume another daily post slot; deletion uses the existing removed status.

Test with two approved accounts: public profiles show only professional fields; profile edits persist after reload; other members cannot edit your post; post editing keeps opinions/offers; deletion removes the post; only your offers appear in My offers; blocking removes public profile/photo access on refresh. Tests: `npm run typecheck`, `node --experimental-strip-types --test tests/member-model.test.mjs`, and `psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/member-profiles.sql` on a disposable migrated database. Live device/photo-upload testing remains manual.
