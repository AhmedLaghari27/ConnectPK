begin;
-- Email sign-in does not establish phone ownership; keep legacy phone data private.
alter table public.verification alter column phone drop not null;
alter table public.verification drop constraint verification_check;
alter table public.verification add constraint verification_approval_evidence check (
  status <> 'approved' or (selfie_path is not null and reviewed_at is not null)
);
alter table public.verification add column linkedin_url text, add column portfolio_url text,
  add column work_proof_path text, add column university_proof_path text, add column submission_id uuid;
create table connectpk_private.verification_uploads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  submitted boolean not null default false,
  created_at timestamptz not null default now()
);
revoke all on connectpk_private.verification_uploads from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('verification','verification',false,5242880,array['image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png'];

create function public.my_verification_status() returns text language sql stable security definer set search_path='' as $$
  select coalesce((select status::text from public.verification where profile_id=auth.uid()),'unverified');
$$;
create function public.begin_verification() returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result uuid;
begin
  if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,1));
  if not exists(select 1 from public.profiles where id=uid and setup_completed_at is not null and status in ('pending','approved'))
    or exists(select 1 from public.verification where profile_id=uid and status in ('pending','approved')) then
    raise exception 'Submission unavailable' using errcode='42501';
  end if;
  if (select count(*) from connectpk_private.verification_uploads where profile_id=uid and created_at > now()-interval '1 hour') >= 10 then
    raise exception 'Please try again later' using errcode='P0001';
  end if;
  insert into connectpk_private.verification_uploads(profile_id) values(uid) returning id into result;
  return result;
end; $$;
create function connectpk_private.can_upload_verification(object_name text) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from connectpk_private.verification_uploads u
    join public.profiles p on p.id=u.profile_id
    where u.profile_id=auth.uid() and not u.submitted and u.created_at > now()-interval '24 hours'
      and p.status in ('pending','approved')
      and object_name in (u.id::text||'/selfie',u.id::text||'/work',u.id::text||'/university')
      and not exists(select 1 from public.verification v where v.profile_id=auth.uid() and v.status in ('pending','approved')));
$$;
revoke all on function connectpk_private.can_upload_verification(text) from public,anon;
grant execute on function connectpk_private.can_upload_verification(text) to authenticated;
create policy verification_upload_insert on storage.objects for insert to authenticated
with check(bucket_id='verification' and connectpk_private.can_upload_verification(name));
create policy verification_upload_insert_guard on storage.objects as restrictive for insert to authenticated
with check(bucket_id<>'verification' or connectpk_private.can_upload_verification(name));
create policy verification_immutable_update on storage.objects as restrictive for update to authenticated
using(bucket_id<>'verification') with check(bucket_id<>'verification');
create policy verification_immutable_delete on storage.objects as restrictive for delete to authenticated
using(bucket_id<>'verification');
create policy verification_anon_write_guard on storage.objects as restrictive for all to anon
using(bucket_id<>'verification') with check(bucket_id<>'verification');
-- Existing restrictive SELECT policy continues to allow only approved staff.
create function public.submit_verification(upload_id uuid, linkedin text default null, portfolio text default null)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); path text:=upload_id::text; u connectpk_private.verification_uploads;
begin
  if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,1));
  select * into u from connectpk_private.verification_uploads where id=upload_id and profile_id=uid for update;
  if not found then raise exception 'Invalid submission' using errcode='42501'; end if;
  if u.submitted then return; end if;
  if not connectpk_private.can_upload_verification(path||'/selfie') then raise exception 'Submission unavailable' using errcode='42501'; end if;
  if linkedin is not null and (length(linkedin)>500 or linkedin !~ '^https://(www\.)?linkedin\.com(/[^[:space:]]*)?$') then
    raise exception 'Invalid LinkedIn URL' using errcode='22023'; end if;
  if portfolio is not null and (length(portfolio)>500 or portfolio !~ '^https://[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]+)?(/[^[:space:]]*)?$') then
    raise exception 'Invalid portfolio URL' using errcode='22023'; end if;
  if not exists(select 1 from storage.objects where bucket_id='verification' and name=path||'/selfie') then
    raise exception 'Selfie required' using errcode='22023'; end if;
  insert into public.verification(profile_id,selfie_path,work_proof_path,university_proof_path,linkedin_url,portfolio_url,submission_id,status)
  values(uid,path||'/selfie',
    (select name from storage.objects where bucket_id='verification' and name=path||'/work'),
    (select name from storage.objects where bucket_id='verification' and name=path||'/university'),linkedin,portfolio,upload_id,'pending')
  on conflict(profile_id) do update set selfie_path=excluded.selfie_path,work_proof_path=excluded.work_proof_path,
    university_proof_path=excluded.university_proof_path,linkedin_url=excluded.linkedin_url,portfolio_url=excluded.portfolio_url,
    evidence_path=null,submission_id=excluded.submission_id,status='pending',reviewed_at=null,reviewed_by=null,updated_at=now();
  update connectpk_private.verification_uploads set submitted=true where id=upload_id;
end; $$;
revoke all on function public.my_verification_status(),public.begin_verification(),public.submit_verification(uuid,text,text) from public,anon;
grant execute on function public.my_verification_status(),public.begin_verification(),public.submit_verification(uuid,text,text) to authenticated;

create function connectpk_private.is_verified(member_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.verification where profile_id=member_id and status='approved');
$$;
revoke all on function connectpk_private.is_verified(uuid) from public,anon,authenticated;
create function connectpk_private.require_verified_introduction() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if not connectpk_private.is_verified(new.member_a_id) or not connectpk_private.is_verified(new.member_b_id)
    or not exists(select 1 from public.profiles where id=new.member_a_id and status='approved')
    or not exists(select 1 from public.profiles where id=new.member_b_id and status='approved') then
    raise exception 'Both members must be approved and verified' using errcode='42501';
  end if;
  return new;
end; $$;
revoke all on function connectpk_private.require_verified_introduction() from public,anon,authenticated;
create trigger introductions_require_verification before insert or update of member_a_id,member_b_id,status
on public.introductions for each row execute function connectpk_private.require_verified_introduction();

create or replace function connectpk_private.can_read_recommendation(other_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and connectpk_private.is_verified(auth.uid()) and connectpk_private.is_verified(other_id)
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

create or replace function connectpk_private.can_read_match(target_match_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches m
    join public.introductions i on i.id = m.introduction_id
    join public.profiles a on a.id = m.member_a_id
    join public.profiles b on b.id = m.member_b_id
    where m.id = target_match_id and auth.uid() in (m.member_a_id, m.member_b_id)
      and m.status = 'active' and i.status = 'mutual'
      and i.member_a_response = 'accepted' and i.member_b_response = 'accepted'
      and connectpk_private.is_verified(m.member_a_id) and connectpk_private.is_verified(m.member_b_id)
      and a.status = 'approved' and b.status = 'approved'
      and not connectpk_private.is_blocked(
        case when m.member_a_id = auth.uid() then m.member_b_id else m.member_a_id end
      )
  );
$$;

commit;
