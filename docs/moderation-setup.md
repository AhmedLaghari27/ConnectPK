# Reporting and blocking

Apply `supabase/migrations/20261007100000_moderation.sql` once in the Supabase SQL Editor, after the notifications migration. Reload the app after applying it. No new environment variables or native dependencies are needed. The old free-text report RPCs are intentionally disabled: members must use the category-based form in this app version.

Reports are available from the post menu, each opinion, each incoming offer, each received chat message, and public profiles. Categories match PROJECT.md; a description is required (1–2,000 characters). Reports and snapshots are visible only to approved moderators/admins. The database assigns `scam_fraud` high severity. Members cannot choose severity or supply evidence snapshots. Snapshots retain the reported text even if it is edited later; profile snapshots exclude verification evidence, phone, and exact location fields.

Three distinct members reporting the **post itself** hide it (`status='hidden'`, `moderation_hold=true`). Retries and multiple categories from one reporter count only once per target; self-reports are rejected. Reports of comments, offers, messages, or profiles do not count against the parent post. Only open/under-review post reports count. The update and report insertion are atomic, serialized against concurrent post reports. Authors cannot restore a held post.

No admin UI is added. A trusted moderator must review the report evidence before restoration. In the Supabase SQL Editor, the project administrator can inspect `public.reports` filtered by `post_id`, resolve or dismiss the reviewed reports (setting `resolved_at` and `reviewed_by`), then explicitly set the post's `moderation_hold=false` and status to `active` if cleared, or `removed` if upheld. Do not grant members direct report or moderation-column writes. Simply changing report status does not automatically republish a post.

Blocking already used symmetric server checks for feed, opinions, offers, conversations, messages, profiles, avatar authorization, and notifications. The new restrictive comment policy also hides a member's own comments on a blocked author's post. Blocking returns the initiating member to the feed. Other open screens recheck visibility every 15 seconds while foregrounded and on return; the feed now prunes inaccessible posts without resetting its pagination. Server access is revoked immediately; already downloaded content cannot be remotely erased.

## Five manual checks

1. With approved accounts, submit one report for each of the five target types. Try an empty description and no category. Verify only moderators can read reports; an unrelated member cannot report a private offer or message by guessing its ID.
2. Choose Scam or fraud. As the project administrator, verify `category='scam_fraud'`, `severity='high'`, and a private `evidence_snapshot`. Edit the source content and confirm the snapshot is unchanged.
3. Report one post from three different approved accounts. The first two leave it active; the third hides it from feed, detail and public-profile posts. Retry submissions and confirm the report count stays three. Verify the author cannot restore it through the API.
4. Report three opinions on a post: the parent remains active. Resolve a held post's reports as staff and explicitly restore it; confirm it is visible again.
5. Block between two approved members with an accepted offer/chat. Verify both directions: profiles, posts, opinions, offers, messages, chats, and notifications disappear. Check an already-open feed after 15 seconds and verify API queries cannot read blocked content.

## Automated checks

```sh
npm run typecheck
node --experimental-strip-types --test tests/moderation.test.mjs
psql "$TEST_DATABASE_URL" -f tests/moderation.sql
psql "$TEST_DATABASE_URL" -f tests/post-detail.sql -f tests/messages.sql
python3 tests/moderation-concurrency.py
```

Set `TEST_DATABASE_URL` only to a disposable migrated database. The concurrency test commits temporary fixtures and cleans them up; do not run it against production. Run `supabase/checks/installation-audit.sql` after migration to check installation objects.

Validation completed locally: TypeScript, category/description unit tests, report/block SQL integration tests, post-detail/message regression tests, concurrent-report tests, and 463 installation checks passed. Web/iOS/Android exports passed. ESLint could not run because this project has no ESLint configuration; no lint dependencies were added. Hosted migration and interactive two-account device checks remain for deployment.
