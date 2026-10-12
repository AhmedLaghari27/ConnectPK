begin;

-- Schema only: access policies and transactional workflows come in later steps.
create type public.intentions as enum (
  'exchange_ideas', 'grow_professionally', 'build_together'
);
create type public.member_role as enum ('member', 'moderator', 'admin');
create type public.member_city as enum ('Karachi', 'Lahore', 'Islamabad');
create type public.profile_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.introduction_status as enum ('pending', 'accepted', 'passed', 'expired', 'mutual');
create type public.introduction_response as enum ('pending', 'accepted', 'passed');
create type public.match_status as enum ('active', 'unmatched', 'blocked');
create type public.meeting_mode as enum ('online', 'public_venue');
create type public.meeting_status as enum ('proposed', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.attendance_status as enum ('attended', 'other_absent', 'self_absent', 'neither_attended');
create type public.report_severity as enum ('low', 'medium', 'high', 'critical');
create type public.report_status as enum ('open', 'under_review', 'resolved', 'dismissed');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.checkin_status as enum ('scheduled', 'safe', 'needs_help', 'missed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 120),
  date_of_birth date not null,
  city public.member_city not null,
  intention public.intentions not null,
  role public.member_role not null default 'member',
  status public.profile_status not null default 'pending',
  headline text check (char_length(headline) <= 160),
  bio text check (char_length(bio) <= 1500),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_adults_only check (
    date_of_birth <= (timezone('Asia/Karachi', now())::date - interval '18 years')::date
  )
);
create index profiles_matching_idx on public.profiles (city, intention) where status = 'approved';
create index profiles_review_idx on public.profiles (status, created_at);
comment on column public.profiles.date_of_birth is 'Private; exclude from member-facing profile projections.';
comment on column public.profiles.role is 'Server-managed; future member policies must forbid self-escalation.';

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);
create unique index skills_name_unique_idx on public.skills (lower(btrim(name)));

create table public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  primary key (profile_id, skill_id)
);
create index profile_skills_skill_idx on public.profile_skills (skill_id, profile_id);

-- Concrete time windows; timestamptz preserves instants across time zones.
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (profile_id, starts_at, ends_at)
);
create index availability_window_idx on public.availability (starts_at, ends_at);

create table public.introductions (
  id uuid primary key default gen_random_uuid(),
  member_a_id uuid not null references public.profiles (id) on delete cascade,
  member_b_id uuid not null references public.profiles (id) on delete cascade,
  status public.introduction_status not null default 'pending',
  member_a_response public.introduction_response not null default 'pending',
  member_b_response public.introduction_response not null default 'pending',
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Store UUIDs in ascending order so a reversed pair cannot bypass uniqueness.
  check (member_a_id < member_b_id),
  check (expires_at > created_at),
  constraint introductions_responses_consistent check (
    (status = 'pending' and member_a_response = 'pending' and member_b_response = 'pending')
    or (status = 'accepted' and (
      (member_a_response = 'accepted' and member_b_response = 'pending')
      or (member_a_response = 'pending' and member_b_response = 'accepted')
    ))
    or (status = 'passed' and (member_a_response = 'passed' or member_b_response = 'passed'))
    or (status = 'mutual' and member_a_response = 'accepted' and member_b_response = 'accepted')
    or (status = 'expired' and member_a_response <> 'passed' and member_b_response <> 'passed'
      and not (member_a_response = 'accepted' and member_b_response = 'accepted'))
  ),
  unique (id, member_a_id, member_b_id, status)
);
create unique index introductions_open_pair_idx on public.introductions (member_a_id, member_b_id)
  where status in ('pending', 'accepted', 'mutual');
create index introductions_member_a_idx on public.introductions (member_a_id, created_at desc);
create index introductions_member_b_idx on public.introductions (member_b_id, created_at desc);
create index introductions_expiry_idx on public.introductions (expires_at)
  where status in ('pending', 'accepted');
comment on table public.introductions is 'Private response/status data. Future APIs must hide passes and never notify the other member.';

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  introduction_id uuid not null unique,
  member_a_id uuid not null references public.profiles (id) on delete cascade,
  member_b_id uuid not null references public.profiles (id) on delete cascade,
  introduction_status public.introduction_status not null default 'mutual' check (introduction_status = 'mutual'),
  status public.match_status not null default 'active',
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  check (member_a_id < member_b_id),
  check ((status = 'active' and ended_at is null) or (status <> 'active' and ended_at is not null)),
  check (ended_at is null or ended_at >= created_at),
  -- A conversation can exist only for the same pair with mutual acceptance.
  foreign key (introduction_id, member_a_id, member_b_id, introduction_status)
    references public.introductions (id, member_a_id, member_b_id, status) on delete cascade
);
create unique index matches_active_pair_idx on public.matches (member_a_id, member_b_id) where status = 'active';
create index matches_member_a_idx on public.matches (member_a_id, status);
create index matches_member_b_idx on public.matches (member_b_id, status);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (match_id, created_at, id);
create index messages_sender_idx on public.messages (sender_id);
comment on table public.messages is 'Future write policies must require a participating sender, an active match, and no block in either direction.';

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  proposed_by uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes smallint not null check (duration_minutes in (30, 45)),
  mode public.meeting_mode not null,
  venue text,
  online_url text,
  status public.meeting_status not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_location_by_mode check (
    (mode = 'online' and venue is null and online_url is not null and online_url ~ '^https://[^[:space:]]+$')
    or (mode = 'public_venue' and online_url is null and venue is not null
      and char_length(btrim(venue)) between 1 and 300)
  )
);
create index meetings_match_idx on public.meetings (match_id, starts_at desc);
create index meetings_proposer_idx on public.meetings (proposed_by);
create index meetings_upcoming_idx on public.meetings (starts_at) where status in ('proposed', 'confirmed');
comment on column public.meetings.venue is 'Public venue name only; never store a member home address or live location.';

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  attendance public.attendance_status not null,
  accuracy smallint check (accuracy between 1 and 5),
  conduct smallint check (conduct between 1 and 5),
  usefulness smallint check (usefulness between 1 and 5),
  felt_safe boolean,
  wants_another boolean not null,
  created_at timestamptz not null default now(),
  unique (meeting_id, profile_id),
  check (attendance <> 'attended' or (
    accuracy is not null and conduct is not null and usefulness is not null and felt_safe is not null
  ))
);
create index feedback_profile_idx on public.feedback (profile_id);
comment on table public.feedback is 'One private response per participant per meeting. Ratings are 1 (lowest) to 5 (highest); felt_safe explicitly measures safety.';

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id, blocker_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  reported_id uuid references public.profiles (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  meeting_id uuid references public.meetings (id) on delete set null,
  reason text not null check (char_length(btrim(reason)) between 1 and 2000),
  severity public.report_severity not null default 'medium',
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reporter_id <> reported_id),
  check ((status in ('resolved', 'dismissed')) = (resolved_at is not null)),
  check (resolved_at is null or resolved_at >= created_at)
);
create index reports_queue_idx on public.reports (status, severity, created_at);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_reported_idx on public.reports (reported_id);
create index reports_message_idx on public.reports (message_id) where message_id is not null;
create index reports_meeting_idx on public.reports (meeting_id) where meeting_id is not null;
create index reports_reviewer_idx on public.reports (reviewed_by) where reviewed_by is not null;

create table public.verification (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  phone_verified_at timestamptz,
  selfie_path text check (char_length(btrim(selfie_path)) > 0),
  evidence_path text check (char_length(btrim(evidence_path)) > 0),
  status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'approved' or (phone_verified_at is not null and selfie_path is not null and reviewed_at is not null))
);
create unique index verification_phone_idx on public.verification (phone);
create index verification_queue_idx on public.verification (status, created_at);
create index verification_reviewer_idx on public.verification (reviewed_by) where reviewed_by is not null;
comment on table public.verification is 'Private verification data; object paths must refer to private Storage objects, never public URLs.';

create table public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now(),
  unique (profile_id, phone),
  unique (id, profile_id)
);
comment on table public.trusted_contacts is 'Private owner contact information; never visible to other members.';

create table public.safety_checkins (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  trusted_contact_id uuid,
  due_at timestamptz not null,
  checked_in_at timestamptz,
  status public.checkin_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  unique (meeting_id, profile_id),
  foreign key (trusted_contact_id, profile_id) references public.trusted_contacts (id, profile_id)
    on delete set null (trusted_contact_id),
  check ((status in ('safe', 'needs_help')) = (checked_in_at is not null))
);
create index safety_checkins_profile_idx on public.safety_checkins (profile_id);
create index safety_checkins_contact_idx on public.safety_checkins (trusted_contact_id, profile_id)
  where trusted_contact_id is not null;
create index safety_checkins_due_idx on public.safety_checkins (due_at) where status = 'scheduled';

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (char_length(btrim(action)) between 1 and 120),
  entity_type text not null check (char_length(btrim(entity_type)) between 1 and 80),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_created_idx on public.audit_log (created_at desc);
comment on table public.audit_log is 'Server-written audit events; metadata must exclude phone numbers, verification evidence, and message bodies.';

create table public.weekly_intro_quota (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  introductions_count smallint not null default 0 check (introductions_count between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (profile_id, week_start),
  check (extract(isodow from week_start) = 1)
);
create index weekly_intro_quota_week_idx on public.weekly_intro_quota (week_start);
comment on table public.weekly_intro_quota is 'Monday-based weeks in Asia/Karachi. Future introduction creation must atomically increment BOTH members'' counters; this table alone does not count introductions.';

-- No client policies yet: deny access until private projections and workflows exist.
-- Supabase: https://supabase.com/docs/guides/database/postgres/row-level-security
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.profile_skills enable row level security;
alter table public.availability enable row level security;
alter table public.introductions enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.meetings enable row level security;
alter table public.feedback enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.verification enable row level security;
alter table public.safety_checkins enable row level security;
alter table public.trusted_contacts enable row level security;
alter table public.audit_log enable row level security;
alter table public.weekly_intro_quota enable row level security;

-- Also remove default API grants (including TRUNCATE, which bypasses RLS).
revoke all on table
  public.profiles, public.skills, public.profile_skills, public.availability,
  public.introductions, public.matches, public.messages, public.meetings,
  public.feedback, public.blocks, public.reports, public.verification,
  public.safety_checkins, public.trusted_contacts, public.audit_log, public.weekly_intro_quota
from public, anon, authenticated;

commit;
