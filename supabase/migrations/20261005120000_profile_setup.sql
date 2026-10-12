begin;
alter table public.profiles add column setup_completed_at timestamptz;
-- Private draft and extended profile fields; never exposed through recommendations.
create table public.profile_setup (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 20000),
  step smallint not null default 1 check (step between 1 and 5),
  updated_at timestamptz not null default now()
);
alter table public.profile_setup enable row level security;
revoke all on public.profile_setup from public, anon, authenticated;
grant select on public.profile_setup to authenticated;
create policy profile_setup_owner on public.profile_setup for select to authenticated using (user_id = auth.uid());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 5242880, array['image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png'];
create policy profile_photo_read on storage.objects for select to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_photo_insert on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_photo_update on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_photo_owner_guard on storage.objects as restrictive for all to authenticated
using (bucket_id <> 'profile-photos' or (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_photo_anon_guard on storage.objects as restrictive for all to anon
using (bucket_id <> 'profile-photos');

-- The only write path validates caller identity and commits all tables together.
create function public.save_profile_setup(payload jsonb, next_step integer, finish boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  k text; v text; item text; items text[]; skill_uuid uuid;
  slot jsonb; start_time timestamptz; end_time timestamptz; birth date;
  normalized jsonb := payload;
  windows tstzrange[] := '{}';
begin
  if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' or octet_length(payload::text) > 20000
    or next_step is null or next_step not between 1 and 5 or finish is null then
    raise exception 'Invalid profile input' using errcode = '22023';
  end if;
  -- Serialize retries from multiple tabs for the same member.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if exists (select 1 from public.profiles where id = uid and setup_completed_at is not null) then
    return; -- A retry after a lost response is safe.
  end if;
  if not exists (select 1 from auth.users where id = uid
    and raw_user_meta_data->>'age_confirmed_18_plus' = 'true'
    and raw_user_meta_data->>'conduct_terms_version' = 'conduct-2026-10-05') then
    raise exception 'Accept onboarding first' using errcode = '22023';
  end if;
  foreach k in array array['full_name','date_of_birth','avatar_path','city','broad_area','professional_role','organization','industry','experience','skills','interests','languages','can_help','wants_to_meet','vision','intention','meeting_preference'] loop
    if jsonb_typeof(payload->k) is distinct from 'string' then raise exception 'Invalid profile input' using errcode = '22023'; end if;
    v := normalize(btrim(payload->>k), NFKC);
    normalized := jsonb_set(normalized, array[k], to_jsonb(v));
    if k not in ('avatar_path','date_of_birth') and v ~* '\m(dating|romance|romantic|hookup|hook[[:space:]-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(ing)?)\M' then
      raise exception 'Professional wording required' using errcode = 'P0001';
    end if;
  end loop;
  if jsonb_typeof(payload->'independent') is distinct from 'boolean' or jsonb_typeof(payload->'slots') is distinct from 'array' then
    raise exception 'Invalid profile input' using errcode = '22023';
  end if;
  if jsonb_array_length(payload->'slots') not between 1 and 5 then raise exception 'Invalid windows' using errcode = '22023'; end if;
  for slot in select value from jsonb_array_elements(payload->'slots') loop
    if jsonb_typeof(slot->'date') is distinct from 'string' or jsonb_typeof(slot->'start') is distinct from 'string' or jsonb_typeof(slot->'end') is distinct from 'string' then raise exception 'Invalid window' using errcode = '22023'; end if;
  end loop;
  if not finish then
    insert into public.profile_setup(user_id,data,step) values(uid,normalized,next_step)
    on conflict(user_id) do update set data=excluded.data, step=excluded.step, updated_at=now();
    return;
  end if;
  foreach k in array array['full_name','broad_area','professional_role','industry'] loop
    if char_length(normalized->>k) not between 2 and (case k when 'full_name' then 120 when 'professional_role' then 100 else 80 end) then
      raise exception 'Complete required fields' using errcode = '22023';
    end if;
  end loop;
  if not (normalized->>'independent')::boolean and char_length(normalized->>'organization') not between 2 and 120 then
    raise exception 'Organization required' using errcode = '22023';
  end if;
  if (normalized->>'independent')::boolean then normalized := jsonb_set(normalized,'{organization}','""'); end if;
  if normalized->>'experience' not in ('Starting out','1–3 years','4–7 years','8+ years')
    or normalized->>'city' not in ('Karachi','Lahore','Islamabad')
    or normalized->>'intention' not in ('exchange_ideas','grow_professionally','build_together')
    or normalized->>'meeting_preference' not in ('online','public_venue','either') then
    raise exception 'Invalid selection' using errcode = '22023';
  end if;
  if normalized->>'date_of_birth' !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid birth date' using errcode = '22023'; end if;
  birth := (normalized->>'date_of_birth')::date;
  if birth < date '1900-01-01' or birth > (timezone('Asia/Karachi',now())::date - interval '18 years')::date then
    raise exception 'Adults only' using errcode = '22023';
  end if;
  if not exists(select 1 from storage.objects where bucket_id='profile-photos' and name=normalized->>'avatar_path'
    and (storage.foldername(name))[1]=uid::text) then raise exception 'Profile photo required' using errcode = '22023'; end if;
  foreach k in array array['can_help','wants_to_meet','vision'] loop
    if char_length(normalized->>k) not between 20 and (case k when 'vision' then 300 else 500 end) then
      raise exception 'Complete your professional goals' using errcode = '22023';
    end if;
  end loop;
  foreach k in array array['skills','interests','languages'] loop
    items := string_to_array(normalized->>k, ',');
    if array_length(items,1) is null or array_length(items,1) > 10 then raise exception 'Invalid list' using errcode = '22023'; end if;
    foreach item in array items loop
      if char_length(btrim(item)) not between 1 and 80 then raise exception 'Invalid list item' using errcode = '22023'; end if;
    end loop;
  end loop;
  if jsonb_array_length(normalized->'slots') not between 1 and 5 then raise exception 'Availability required' using errcode = '22023'; end if;
  for slot in select value from jsonb_array_elements(normalized->'slots') loop
    if (slot->>'date') is null or (slot->>'date') !~ '^\d{4}-\d{2}-\d{2}$'
      or (slot->>'start') is null or (slot->>'start') !~ '^([01]\d|2[0-3]):[0-5]\d$'
      or (slot->>'end') is null or (slot->>'end') !~ '^([01]\d|2[0-3]):[0-5]\d$' then
      raise exception 'Invalid availability' using errcode = '22023';
    end if;
    start_time := ((slot->>'date') || 'T' || (slot->>'start') || ':00+05:00')::timestamptz;
    end_time := ((slot->>'date') || 'T' || (slot->>'end') || ':00+05:00')::timestamptz;
    if start_time <= now() or end_time < start_time + interval '30 minutes' then raise exception 'Invalid availability' using errcode = '22023'; end if;
    if exists(select 1 from unnest(windows) w where w && tstzrange(start_time,end_time,'[)')) then raise exception 'Overlapping availability' using errcode = '22023'; end if;
    windows := array_append(windows,tstzrange(start_time,end_time,'[)'));
  end loop;
  insert into public.profiles(id,full_name,date_of_birth,city,intention,headline,bio,avatar_path,setup_completed_at)
  values(uid,normalized->>'full_name',birth,(normalized->>'city')::public.member_city,
    (normalized->>'intention')::public.intentions,normalized->>'professional_role',normalized->>'can_help',normalized->>'avatar_path',now())
  on conflict(id) do update set full_name=excluded.full_name,date_of_birth=excluded.date_of_birth,city=excluded.city,
    intention=excluded.intention,headline=excluded.headline,bio=excluded.bio,avatar_path=excluded.avatar_path,setup_completed_at=now(),updated_at=now();
  delete from public.profile_skills where profile_id=uid;
  foreach item in array string_to_array(normalized->>'skills', ',') loop
    insert into public.skills(name) values(lower(btrim(item))) on conflict (lower(btrim(name))) do update set name=excluded.name returning id into skill_uuid;
    insert into public.profile_skills(profile_id,skill_id) values(uid,skill_uuid) on conflict do nothing;
  end loop;
  delete from public.availability where profile_id=uid;
  insert into public.availability(profile_id,starts_at,ends_at) select uid,lower(w),upper(w) from unnest(windows) w;
  insert into public.profile_setup(user_id,data,step) values(uid,normalized,5)
    on conflict(user_id) do update set data=excluded.data,step=5,updated_at=now();
end;
$$;
revoke all on function public.save_profile_setup(jsonb,integer,boolean) from public,anon;
grant execute on function public.save_profile_setup(jsonb,integer,boolean) to authenticated;
commit;
