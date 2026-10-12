# ConnectPK staff portal

A separate Next.js application for approved moderators and admins. It uses existing Supabase email/password accounts, server-side sessions, TOTP MFA, and staff-checked database functions. It does not use a service-role key.

## Run locally

1. In Supabase SQL Editor, apply `../supabase/migrations/20261007110000_admin_portal.sql` **once**, after all previous migrations. The migration is required for queues and actions.
2. From the ConnectPK project directory:

```sh
cd admin
npm install
cp .env.example .env.local
```

Fill `admin/.env.local` with your existing project's `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. These correspond to the Expo app's `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Keep the admin variables server-only. Do not add a service-role key.

3. Use an existing ConnectPK account with a completed profile. Copy its real user UUID from Supabase Authentication → Users. A trusted project owner must provision the first admin using SQL Editor:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where id = 'REPLACE_WITH_THE_ACTUAL_USER_UUID'::uuid;
```

Only change the specific account you intend to trust. The portal cannot assign roles. Additional moderators can be provisioned by the project owner with `role='moderator'`. Do not use your Supabase dashboard password to sign into the portal; use the ConnectPK account's email/password.

4. Ensure TOTP is enabled in Supabase Authentication's Multi-Factor Authentication settings. Start the portal:

```sh
npm run dev
```

Open http://localhost:3000, sign in, set up your authenticator using the private QR code, and enter its six-digit code. Later sign-ins use the existing authenticator. A trusted Supabase project owner must handle lost-authenticator recovery; there is no MFA bypass in this portal.

For deployment, configure the same two environment variables on your Next.js host, use HTTPS, and run `npm run build` / `npm start`. Authenticated responses must not be cached by your CDN. Password sign-in does not need a callback URL or SMTP.

## Scope and behavior

- **Overview:** all-time member/offer/accepted-offer/report/scam-report totals, current queue counts, and 14 days of post counts in Asia/Karachi time. Removed posts remain part of historical totals.
- **Verification:** pending submissions, private selfie/proof viewing, LinkedIn/portfolio links, approval/rejection with a required note. Approval requires a stored selfie and sets verification and membership approved together. Rejection leaves membership pending so the member can resubmit. Restricted accounts and staff cannot be approved through this flow.
- **Reports:** severity-prioritized queue with reported snapshots, categories, descriptions, required review notes, dismiss/remove/warn/suspend/ban. Snapshots are retained when content is removed. For legacy conversation reports, the queue shows up to ten recent messages; use a member action when no single removable target exists.
- **Warnings:** the review note is sent privately to the member's existing in-app inbox. No email or external message is sent. Other review notes remain staff-only.
- **Removal:** posts/opinions become removed; offers become inaccessible and their conversation closes; message text becomes a removal placeholder while the snapshot remains private; removing a profile suspends its public access.
- **Suspension:** sets the existing membership status to suspended. **Ban:** also records `banned_at`; the portal cannot reinstate a banned account. Both disable approved-member participation through existing database checks, including already-issued app sessions. Supabase identity and the member's own private data are retained; this is not account deletion or an Auth-level login ban.
- **Hidden posts:** restore/dismiss related post reports or remove/uphold them. Other content reports remain separate. A version check rejects stale review forms.
- **Audit:** queue reads, evidence access, and every successful decision are logged in `public.audit_log` with the staff actor, target, timestamp and review note. Avoid copying evidence or private message bodies into notes. Failed/stale decisions do not partially mutate data. Moderators cannot sanction admins or other moderators; admins may sanction moderators. Nobody may review their own submission/hidden post or sanction themselves.

Staff data and evidence require MFA at both server and database layers. Ordinary members cannot gain access by opening a URL or directly calling an RPC. Evidence is proxied with private/no-store headers; no public bucket or long-lived signed URL is created. Role/status checks run for every page, action, and evidence request. Mobile changes are limited to displaying the warning notification in the existing inbox and isolating `/admin` from Expo's TypeScript project.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

From the project root, run `psql "$TEST_DATABASE_URL" -f tests/admin-portal.sql` **only against a disposable migrated database**. Also run `tests/admin-content-actions.sql` and `tests/moderation.sql` against that disposable database. Run `supabase/checks/installation-audit.sql` after deployment.

Manual acceptance checks:

1. A member account and a signed-out browser cannot open queues or evidence. Staff without MFA is sent to MFA and direct admin RPCs fail.
2. Approve/reject two pending submissions with notes; verify membership, verification, and audit rows. Reusing a stale decision fails.
3. Dismiss, remove, warn, suspend, and ban separate reports. Check the affected content/account, audit rows, and warning in the member's inbox.
4. Restore and remove hidden posts; verify related post reports resolve, other reports remain, and a second reviewer cannot overwrite a completed decision.
5. Compare dashboard totals with SQL counts and daily post timestamps converted to Asia/Karachi. Test narrow and desktop widths.

Local validation: the admin action and content-removal SQL suites, moderation regression suite, and all 475 installation checks passed in a disposable PostgreSQL database. No hosted database was modified. Browser interaction testing could not complete because the browser tool repeatedly lost its preview tab; run the manual checks above with your configured project.

Dependency audit: production dependencies have no reported vulnerabilities at installation. The full audit reports five high-severity development-only transitive findings in the Next.js ESLint dependency chain; npm proposes an incompatible config downgrade. Review upstream fixes before upgrading; no forced downgrade was applied.
