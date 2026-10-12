-- Run against a disposable database with all migrations applied. Rolls back fixtures.
\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'Assertion failed'; end if; end; $$;
create function pg_temp.expect_failure(statement text, expected_state text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then if sqlstate=expected_state then return; end if; raise; end;
  raise exception 'Expected error %',expected_state;
end; $$;
create function pg_temp.form() returns jsonb language sql as $$
select jsonb_build_object('full_name','Test Member','date_of_birth','1990-01-01',
 'avatar_path','00000000-0000-0000-0000-000000000701/profile.jpg','city','Karachi','broad_area','Gulshan',
 'professional_role','Designer','independent',true,'organization','','industry','Technology','experience','1–3 years',
 'skills','Design, Strategy','interests','Education','languages','Urdu, English',
 'can_help','I can help design accessible products.','wants_to_meet','I want to meet professionals building useful tools.',
 'vision','Build more accessible professional tools.','intention','build_together','meeting_preference','online',
 'slots',jsonb_build_array(jsonb_build_object('date',(current_date+7)::text,'start','14:00','end','15:00')));
$$;
insert into auth.users(id,raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000701','{"age_confirmed_18_plus":true,"conduct_terms_version":"conduct-2026-10-05"}'),
 ('00000000-0000-0000-0000-000000000702','{}');
insert into storage.objects(bucket_id,name) values('profile-photos','00000000-0000-0000-0000-000000000701/profile.jpg');
set local role anon;
select pg_temp.expect_failure($q$select public.save_profile_setup(pg_temp.form(),2,false)$q$,'42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
select public.save_profile_setup(pg_temp.form(),2,false);
select pg_temp.check_true((select step=2 from public.profile_setup));
select pg_temp.check_true((select count(*)=0 from public.profiles));
select pg_temp.expect_failure($q$select public.save_profile_setup(jsonb_set(pg_temp.form(),'{can_help}','"Looking for a romantic partner"'),5,true)$q$,'P0001');
select pg_temp.expect_failure($q$select public.save_profile_setup(jsonb_set(pg_temp.form(),'{date_of_birth}','"2020-01-01"'),5,true)$q$,'22023');
select pg_temp.expect_failure($q$select public.save_profile_setup(jsonb_set(pg_temp.form(),'{avatar_path}','"someone-else/profile.jpg"'),5,true)$q$,'22023');
select pg_temp.expect_failure($q$select public.save_profile_setup(jsonb_set(pg_temp.form(),'{slots}',(pg_temp.form()->'slots') || (pg_temp.form()->'slots')),5,true)$q$,'22023');
select pg_temp.check_true((select count(*)=0 from public.profiles));
select public.save_profile_setup(pg_temp.form(),5,true);
select pg_temp.check_true((select role='member' and status='pending' and setup_completed_at is not null from public.profiles));
select pg_temp.check_true((select count(*)=2 from public.profile_skills));
select pg_temp.check_true((select count(*)=1 from public.availability));
select public.save_profile_setup(pg_temp.form(),5,true);
select pg_temp.check_true((select count(*)=1 from public.availability));
select pg_temp.expect_failure($q$update public.profiles set role='admin'$q$,'42501');
select pg_temp.expect_failure($q$update public.profiles set setup_completed_at=now()$q$,'42501');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000702',true);
select pg_temp.check_true((select count(*)=0 from public.profile_setup));
select pg_temp.check_true((select count(*)=0 from storage.objects where bucket_id='profile-photos'));
select pg_temp.expect_failure($q$insert into storage.objects(bucket_id,name) values('profile-photos','00000000-0000-0000-0000-000000000701/other.jpg')$q$,'42501');
select pg_temp.expect_failure($q$select public.save_profile_setup(pg_temp.form(),5,true)$q$,'22023');
rollback;
