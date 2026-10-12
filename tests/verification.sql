\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'Assertion failed'; end if; end; $$;
create function pg_temp.expect_failure(statement text, expected_state text) returns void language plpgsql as $$
begin begin execute statement; exception when others then if sqlstate=expected_state then return; end if; raise; end; raise exception 'Expected error %',expected_state; end; $$;
insert into auth.users(id) values('00000000-0000-0000-0000-000000000801'),('00000000-0000-0000-0000-000000000802'),('00000000-0000-0000-0000-000000000803');
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,setup_completed_at)
select id,'Verification Test','1990-01-01','Karachi','exchange_ideas','approved',now() from auth.users where id::text like '%00000000080_';
update public.profiles set role='moderator' where id='00000000-0000-0000-0000-000000000803';
select pg_temp.expect_failure($q$insert into public.introductions(member_a_id,member_b_id,reason,expires_at) values('00000000-0000-0000-0000-000000000801','00000000-0000-0000-0000-000000000802','Shared skills',now()+interval '7 days')$q$,'42501');
set local role anon;
select pg_temp.expect_failure('select public.my_verification_status()','42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
select pg_temp.check_true(public.my_verification_status()='unverified');
select public.begin_verification() as attempt \gset
select pg_temp.expect_failure(format('select public.submit_verification(%L)', :'attempt'),'22023');
insert into storage.objects(bucket_id,name) values('verification',:'attempt'||'/selfie');
select pg_temp.check_true((select count(*)=0 from storage.objects where bucket_id='verification'));
select pg_temp.expect_failure(format('select public.submit_verification(%L,%L)', :'attempt','https://evil.example/linkedin.com'),'22023');
select public.submit_verification(:'attempt','https://linkedin.com/in/test',null);
select public.submit_verification(:'attempt','https://linkedin.com/in/test',null);
select pg_temp.check_true(public.my_verification_status()='pending');
select pg_temp.check_true((select count(*)=0 from public.verification));
select pg_temp.expect_failure('select public.begin_verification()','42501');
select pg_temp.expect_failure($q$update public.verification set status='approved'$q$,'42501');
select pg_temp.expect_failure(format('insert into storage.objects(bucket_id,name) values(%L,%L)','verification',:'attempt'||'/work'),'42501');
update storage.objects set name='tampered' where bucket_id='verification';
reset role;
select pg_temp.check_true(exists(select 1 from storage.objects where name=:'attempt'||'/selfie'));
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000802',true);
select pg_temp.check_true(public.my_verification_status()='unverified');
select pg_temp.expect_failure(format('select public.submit_verification(%L)', :'attempt'),'42501');
select pg_temp.expect_failure(format('insert into storage.objects(bucket_id,name) values(%L,%L)','verification',:'attempt'||'/university'),'42501');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000803',true);
select pg_temp.check_true((select count(*)=1 from public.verification));
select pg_temp.check_true((select count(*)=1 from storage.objects where bucket_id='verification'));
reset role;
update public.verification set status='rejected' where profile_id='00000000-0000-0000-0000-000000000801';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
select pg_temp.check_true(public.my_verification_status()='rejected');
select public.begin_verification() as retry_attempt \gset
insert into storage.objects(bucket_id,name) values('verification',:'retry_attempt'||'/selfie');
select public.submit_verification(:'retry_attempt');
reset role;
update public.verification set status='approved',reviewed_at=now() where profile_id='00000000-0000-0000-0000-000000000801';
insert into public.verification(profile_id,selfie_path,status,reviewed_at) values('00000000-0000-0000-0000-000000000802','fixture/selfie','approved',now());
insert into public.introductions(member_a_id,member_b_id,reason,expires_at) values('00000000-0000-0000-0000-000000000801','00000000-0000-0000-0000-000000000802','Shared skills',now()+interval '7 days');
set local role authenticated;
select pg_temp.check_true(public.my_verification_status()='approved');
select pg_temp.check_true((select count(*)=1 from public.recommended_profiles));
reset role;
update public.verification set status='rejected' where profile_id='00000000-0000-0000-0000-000000000802';
set local role authenticated;
select pg_temp.check_true((select count(*)=0 from public.recommended_profiles));
rollback;
