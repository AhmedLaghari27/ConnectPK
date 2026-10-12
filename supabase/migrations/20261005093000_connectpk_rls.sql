begin;

-- Access control only. Apply after 20261005090000_create_connectpk_schema.sql.
-- RLS cannot redact columns: profiles stays owner-only; use recommended_profiles
-- for other members. Helpers bypass RLS only to evaluate caller-bound predicates.
-- https://supabase.com/docs/guides/database/postgres/row-level-security
-- https://supabase.com/docs/guides/database/postgres/column-level-security
create schema if not exists connectpk_private;
revoke all on schema connectpk_private from public, anon, authenticated;
grant usage on schema connectpk_private to authenticated;

create function connectpk_private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('moderator', 'admin')
      and p.status = 'approved'
  );
$$;

create function connectpk_private.is_blocked(other_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = other_id)
       or (b.blocked_id = (select auth.uid()) and b.blocker_id = other_id)
  );
$$;

create function connectpk_private.can_read_recommendation(other_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and other_id <> (select auth.uid())
    and not connectpk_private.is_blocked(other_id)
    and exists (select 1 from public.profiles where id = auth.uid() and status = 'approved')
    and exists (select 1 from public.profiles where id = other_id and status = 'approved')
    and exists (
      select 1 from public.introductions i
      where ((i.member_a_id = auth.uid() and i.member_b_id = other_id)
          or (i.member_b_id = auth.uid() and i.member_a_id = other_id))
        -- Passing does not change what the other member sees before expiry.
        and (i.expires_at > now() or exists (
          select 1 from public.matches m where m.introduction_id = i.id and m.status = 'active'
        ))
    );
$$;

create function connectpk_private.can_read_match(target_match_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches m
    join public.introductions i on i.id = m.introduction_id
    join public.profiles a on a.id = m.member_a_id
    join public.profiles b on b.id = m.member_b_id
    where m.id = target_match_id and auth.uid() in (m.member_a_id, m.member_b_id)
      and m.status = 'active' and i.status = 'mutual'
      and i.member_a_response = 'accepted' and i.member_b_response = 'accepted'
      and a.status = 'approved' and b.status = 'approved'
      and not connectpk_private.is_blocked(
        case when m.member_a_id = auth.uid() then m.member_b_id else m.member_a_id end
      )
  );
$$;

-- Used only for owner-private records, including after an unmatch or a block.
create function connectpk_private.owns_meeting_participation(target_meeting_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.meetings mt join public.matches m on m.id = mt.match_id
    where mt.id = target_meeting_id and auth.uid() in (m.member_a_id, m.member_b_id)
  );
$$;

revoke all on function connectpk_private.is_staff() from public, anon, authenticated;
revoke all on function connectpk_private.is_blocked(uuid) from public, anon, authenticated;
revoke all on function connectpk_private.can_read_recommendation(uuid) from public, anon, authenticated;
revoke all on function connectpk_private.can_read_match(uuid) from public, anon, authenticated;
revoke all on function connectpk_private.owns_meeting_participation(uuid) from public, anon, authenticated;
grant execute on function connectpk_private.is_staff(),
  connectpk_private.is_blocked(uuid), connectpk_private.can_read_recommendation(uuid),
  connectpk_private.can_read_match(uuid), connectpk_private.owns_meeting_participation(uuid)
  to authenticated;

-- Existing migration revoked all client grants. Grant only the required operations.
-- Role, approval status, ownership keys and timestamps are never client-editable.
grant select on public.profiles to authenticated;
grant insert (id, full_name, date_of_birth, city, intention, headline, bio, avatar_path)
  on public.profiles to authenticated;
grant update (full_name, date_of_birth, city, intention, headline, bio, avatar_path)
  on public.profiles to authenticated;
create policy profiles_read_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and role = 'member' and status = 'pending');
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Intentionally owner-executed: the explicit caller-bound predicate replaces
-- base-table RLS here. Only safe columns are exposed; no writes are granted.
create view public.recommended_profiles with (security_barrier = true) as
  select p.id, p.full_name, p.city, p.intention, p.headline, p.bio, p.avatar_path
  from public.profiles p
  where connectpk_private.can_read_recommendation(p.id);
revoke all on public.recommended_profiles from public, anon, authenticated;
grant select on public.recommended_profiles to authenticated;

-- Skills are a shared vocabulary; members manage only their own selections.
grant select on public.skills to authenticated;
create policy skills_read on public.skills for select to authenticated using (true);
grant select, delete on public.profile_skills to authenticated;
grant insert (profile_id, skill_id) on public.profile_skills to authenticated;
create policy profile_skills_read_own on public.profile_skills for select to authenticated
  using (profile_id = (select auth.uid()));
create policy profile_skills_insert_own on public.profile_skills for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy profile_skills_delete_own on public.profile_skills for delete to authenticated
  using (profile_id = (select auth.uid()));

grant select, delete on public.availability to authenticated;
grant insert (profile_id, starts_at, ends_at) on public.availability to authenticated;
grant update (starts_at, ends_at) on public.availability to authenticated;
create policy availability_read_own on public.availability for select to authenticated
  using (profile_id = (select auth.uid()));
create policy availability_insert_own on public.availability for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy availability_update_own on public.availability for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy availability_delete_own on public.availability for delete to authenticated
  using (profile_id = (select auth.uid()));

-- Status and both responses stay inaccessible, so a pass remains private.
-- Accept/pass and introduction creation need a future transactional server API.
grant select (id, member_a_id, member_b_id, reason, expires_at, created_at)
  on public.introductions to authenticated;
create policy introductions_read_pair on public.introductions for select to authenticated
  using (
    (select auth.uid()) in (member_a_id, member_b_id)
    and connectpk_private.can_read_recommendation(
      case when member_a_id = (select auth.uid()) then member_b_id else member_a_id end
    )
    and (expires_at > now() or exists (
      select 1 from public.matches m where m.introduction_id = introductions.id
    ))
  );

grant select on public.matches, public.messages, public.meetings to authenticated;
create policy matches_read_pair on public.matches for select to authenticated
  using (connectpk_private.can_read_match(id));
create policy messages_read_pair on public.messages for select to authenticated
  using (connectpk_private.can_read_match(match_id));
create policy meetings_read_pair on public.meetings for select to authenticated
  using (connectpk_private.can_read_match(match_id));
-- Shared workflow writes remain denied; this step does not implement messaging.

grant select on public.feedback to authenticated;
grant insert (meeting_id, profile_id, attendance, accuracy, conduct, usefulness, felt_safe, wants_another)
  on public.feedback to authenticated;
grant update (attendance, accuracy, conduct, usefulness, felt_safe, wants_another)
  on public.feedback to authenticated;
create policy feedback_read_own on public.feedback for select to authenticated
  using (profile_id = (select auth.uid()));
create policy feedback_insert_own on public.feedback for insert to authenticated
  with check (profile_id = (select auth.uid()) and connectpk_private.owns_meeting_participation(meeting_id));
create policy feedback_update_own on public.feedback for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()) and connectpk_private.owns_meeting_participation(meeting_id));

grant select, delete on public.blocks to authenticated;
grant insert (blocker_id, blocked_id) on public.blocks to authenticated;
create policy blocks_read_own on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy blocks_insert_own on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()) and blocked_id <> (select auth.uid()));
create policy blocks_delete_own on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- Even a report's author cannot read it through the member API.
grant select on public.reports, public.verification to authenticated;
create policy reports_staff_read on public.reports for select to authenticated
  using ((select connectpk_private.is_staff()));
create policy verification_staff_read on public.verification for select to authenticated
  using ((select connectpk_private.is_staff()));
-- Verification submission/review and report submission remain server-managed.

grant select, delete on public.trusted_contacts to authenticated;
grant insert (profile_id, name, phone) on public.trusted_contacts to authenticated;
grant update (name, phone) on public.trusted_contacts to authenticated;
create policy trusted_contacts_read_own on public.trusted_contacts for select to authenticated
  using (profile_id = (select auth.uid()));
create policy trusted_contacts_insert_own on public.trusted_contacts for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy trusted_contacts_update_own on public.trusted_contacts for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy trusted_contacts_delete_own on public.trusted_contacts for delete to authenticated
  using (profile_id = (select auth.uid()));

grant select on public.safety_checkins to authenticated;
grant insert (meeting_id, profile_id, trusted_contact_id, due_at, checked_in_at, status)
  on public.safety_checkins to authenticated;
grant update (trusted_contact_id, due_at, checked_in_at, status) on public.safety_checkins to authenticated;
create policy safety_checkins_read_own on public.safety_checkins for select to authenticated
  using (profile_id = (select auth.uid()));
create policy safety_checkins_insert_own on public.safety_checkins for insert to authenticated
  with check (profile_id = (select auth.uid()) and connectpk_private.owns_meeting_participation(meeting_id));
create policy safety_checkins_update_own on public.safety_checkins for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()) and connectpk_private.owns_meeting_participation(meeting_id));

grant select on public.weekly_intro_quota to authenticated;
create policy weekly_intro_quota_read_own on public.weekly_intro_quota for select to authenticated
  using (profile_id = (select auth.uid()));
-- audit_log and quota writes retain the original deny-by-default permissions.

-- Reserve the private bucket ID "verification" for selfie/evidence objects.
-- No bucket is created here. Never provision this bucket as public: public URLs
-- bypass download RLS. Existing deployments must also remove old signed URLs.
do $$
begin
  if exists (select 1 from storage.buckets where id = 'verification' and public) then
    raise exception 'The verification Storage bucket must be private before applying these policies';
  end if;
end;
$$;
create policy verification_objects_staff_read on storage.objects for select to authenticated
  using (bucket_id = 'verification' and (select connectpk_private.is_staff()));
-- Restrictive policies prevent another permissive storage policy opening evidence.
create policy verification_objects_guard on storage.objects as restrictive for select to authenticated
  using (bucket_id <> 'verification' or (select connectpk_private.is_staff()));
create policy verification_objects_anon_guard on storage.objects as restrictive for select to anon
  using (bucket_id <> 'verification');

commit;
