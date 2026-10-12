# Notifications setup

The inbox and unread badge work on web and Expo Go once the SQL migration is applied. Push is opt-in per device and requires an installed native build, Expo credentials, and the scheduled Supabase worker. No SMTP is needed.

## 1. Supabase database

Run **supabase/migrations/20261007090000_notifications.sql** once in the Supabase SQL Editor, after all earlier migrations. Do not rerun old migrations. Then run **supabase/checks/installation-audit.sql**. The migration adds notifications to Realtime and keeps tokens and the delivery queue in the private schema.

## 2. Deploy the worker

From the ConnectPK folder:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
openssl rand -hex 32
```

Keep that generated value private. In Supabase → Edge Functions → Secrets, add `PUSH_WORKER_SECRET` with that value. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied by Supabase automatically; never put the service-role key in Expo environment variables.

```sh
npx supabase functions deploy push-notifications
```

The function disables JWT verification in `supabase/config.toml` because the scheduler uses the dedicated secret. Its handler rejects requests without the correct secret. If Expo enhanced push security is enabled, also add `EXPO_ACCESS_TOKEN` in Edge Function secrets.

## 3. Schedule delivery

Enable Supabase Cron and pg_net in the dashboard. In Supabase Vault, create these two secrets:

- `connectpk_project_url`: your HTTPS Supabase project URL (not an exp:// URL).
- `connectpk_push_worker_secret`: the same value as `PUSH_WORKER_SECRET`.

Run **supabase/checks/schedule-push.sql** in the SQL Editor. It schedules the worker once per minute. Check Cron run history, Edge Function logs, and the status counts below if delivery fails. Do not log or share device tokens.

```sql
select status, error_code, count(*)
from connectpk_private.push_jobs
 group by status, error_code;
```

Jobs retry temporary failures with bounded backoff; failed jobs remain `dead` for inspection. Tickets are checked after 15 minutes, and invalid devices are disabled. `delivered` means Expo received a successful APNs/FCM receipt, not that the person read it. A network interruption can produce duplicate pushes; delivery is at least once. Read notifications, blocked actors, unapproved recipients, and disabled devices are skipped before claiming delivery. Already-sent or in-flight alerts cannot be recalled.

## 4. Install a phone build

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx expo install expo-dev-client
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client
```

`eas init` writes your actual EAS project ID into app configuration; do not invent it. Configure a unique iOS bundle identifier when prompted, register your physical iPhone, and follow EAS prompts for Apple signing and APNs push credentials (an Apple Developer account is required for this device build). Install the resulting build on the phone. For Android, build with `--platform android` and configure FCM v1 credentials in EAS. Rebuild after native plugin/config changes.

See [Expo push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) and [Expo development builds](https://docs.expo.dev/develop/development-builds/create-a-build/).

Open Notifications → **Push notifications on this device**, enable it, and allow OS permission. Foreground delivery refreshes the inbox silently; background delivery shows a generic preview. Tapping a push opens the protected inbox, where an item opens its post or conversation. Sign-out unregisters this device before clearing the session; if that fails, retry with a connection. Changing the toggle does not erase the in-app inbox.

## 5. Test with two approved accounts

1. Account B comments on A’s post and offers help: A gets both inbox entries and an unread badge; B gets no self-notification.
2. A accepts B’s offer: B receives the accepted entry and can open the conversation. Use another post to test a polite declined entry.
3. Send a chat message: only the other participant receives a new-message entry; check foreground refresh and background push on a physical phone.
4. Mark one/all as read: badge updates. Disable push, trigger another event, and verify the inbox still updates with no new device alert. Verify account switching does not retain alerts for the old account.
5. Block the other member: their notifications disappear and unsent pushes are skipped. An unrelated account cannot read or mark those notifications and cannot call worker RPCs.

Automated checks: `npm run typecheck`, `node --experimental-strip-types --test tests/notifications.test.mjs`, and `psql "$TEST_DATABASE_URL" -f tests/notifications.sql` against a disposable migrated Supabase database. Never run fixture tests against production.

Local validation: SQL integration checks and 459 installation checks passed; worker/model unit tests, app and worker TypeScript checks, and exports for web/iOS/Android passed. Physical-device delivery and hosted deployment require the setup above. Expo lint could not run because this project has no ESLint configuration or installed ESLint; its attempted automatic installation was canceled.
