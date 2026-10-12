\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(901,909)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,role)
select id,'Portal tester','1990-01-01','Karachi','exchange_ideas','approved',case when id='00000000-0000-0000-0000-000000000908' then 'moderator'::public.member_role when id='00000000-0000-0000-0000-000000000909' then 'admin'::public.member_role else 'member'::public.member_role end from auth.users where id between '00000000-0000-0000-0000-000000000901' and '00000000-0000-0000-0000-000000000909';
insert into public.verification(profile_id,selfie_path,status,reviewed_at) select id,id::text||'/selfie','approved',now() from public.profiles;
insert into storage.objects(bucket_id,name) select 'verification',selfie_path from public.verification;
insert into public.posts(author_id,post_type,title,body,tags,city)
select id,'building','Portal test post','A useful professional project',array['Design'],'Karachi' from public.profiles where id in ('00000000-0000-0000-0000-000000000901','00000000-0000-0000-0000-000000000902');
select id as post_id from public.posts where author_id='00000000-0000-0000-0000-000000000901' \gset
select id as hidden_id from public.posts where author_id='00000000-0000-0000-0000-000000000902' \gset
select set_config('test.post',:'post_id',true);
select set_config('test.hidden',:'hidden_id',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000903',true);
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
do $$begin
 begin perform public.admin_dashboard();raise exception 'Member read admin metrics';exception when insufficient_privilege then null;end;
 begin perform public.admin_queue('reports');raise exception 'Member read reports';exception when insufficient_privilege then null;end;
 begin perform public.admin_review_hidden(current_setting('test.hidden')::uuid,0,'restore','Unauthorized');raise exception 'Member restored content';exception when insufficient_privilege then null;end;
end;$$;
select public.submit_report('post',:'post_id','scam_fraud','Suspected scam');
select public.submit_report('profile','00000000-0000-0000-0000-000000000902','harassment','Member warning');
select public.submit_report('profile','00000000-0000-0000-0000-000000000904','harassment','Suspension review');
select public.submit_report('profile','00000000-0000-0000-0000-000000000905','scam_fraud','Ban review');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000908',true);
select set_config('request.jwt.claims','{"aal":"aal1"}',true);
select pg_temp.check_true((select count(*)=0 from public.reports));
select pg_temp.check_true((select count(*)=0 from public.verification));
select pg_temp.check_true((select count(*)=0 from storage.objects where bucket_id='verification'));
do $$begin
 begin perform public.admin_dashboard();raise exception 'Staff without MFA read metrics';exception when insufficient_privilege then null;end;
end;$$;
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select pg_temp.check_true((public.admin_dashboard()->>'members')::int=9);
select pg_temp.check_true(jsonb_array_length(public.admin_dashboard()->'posts_per_day')=14);
select pg_temp.check_true(jsonb_array_length(public.admin_queue('reports'))=4);
select pg_temp.check_true(public.admin_evidence('00000000-0000-0000-0000-000000000901','selfie')='00000000-0000-0000-0000-000000000901/selfie');
select id as report_id,updated_at as report_time from public.reports where target_kind='post' \gset
select public.admin_review_report(:'report_id',:'report_time','remove','Removed misleading content');
select set_config('test.report',:'report_id',true);
select set_config('test.report_time',:'report_time',true);
do $$begin
 begin perform public.admin_review_report(current_setting('test.report')::uuid,current_setting('test.report_time')::timestamptz,'remove','Duplicate');raise exception 'Stale report accepted';exception when serialization_failure then null;end;
end;$$;
select id as warning_id,updated_at as warning_time from public.reports where reported_id='00000000-0000-0000-0000-000000000902' \gset
select public.admin_review_report(:'warning_id',:'warning_time','warn','Please keep your conversations professional.');
select id as suspend_id,updated_at as suspend_time from public.reports where reported_id='00000000-0000-0000-0000-000000000904' \gset
select public.admin_review_report(:'suspend_id',:'suspend_time','suspend','Suspended pending review');
select id as ban_id,updated_at as ban_time from public.reports where reported_id='00000000-0000-0000-0000-000000000905' \gset
select public.admin_review_report(:'ban_id',:'ban_time','ban','Ban for repeated fraud');
reset role;
select pg_temp.check_true((select status='removed' from public.posts where id=:'post_id'));
select pg_temp.check_true((select status='suspended' and banned_at is null from public.profiles where id='00000000-0000-0000-0000-000000000904'));
select pg_temp.check_true((select status='suspended' and banned_at is not null from public.profiles where id='00000000-0000-0000-0000-000000000905'));
select pg_temp.check_true((select count(*)=4 from public.audit_log where action like 'admin.report.%'));
select set_config('request.jwt.claim.sub','',true);
update public.posts set status='hidden',moderation_hold=true where id=:'hidden_id';
select review_version as hidden_version from public.posts where id=:'hidden_id' \gset
update public.verification set status='pending',reviewed_at=null,updated_at=now() where profile_id in ('00000000-0000-0000-0000-000000000906','00000000-0000-0000-0000-000000000907');
update public.profiles set status='pending' where id in ('00000000-0000-0000-0000-000000000906','00000000-0000-0000-0000-000000000907');
select updated_at as verify_time from public.verification where profile_id='00000000-0000-0000-0000-000000000906' \gset
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000908',true);
select pg_temp.check_true(jsonb_array_length(public.admin_queue('verification'))=2);
select pg_temp.check_true(jsonb_array_length(public.admin_queue('hidden'))=1);
select public.admin_review_hidden(:'hidden_id',:'hidden_version','restore','Cleared after review');
select public.admin_review_verification('00000000-0000-0000-0000-000000000906',:'verify_time','approve','Identity evidence reviewed');
select public.admin_review_verification('00000000-0000-0000-0000-000000000907',:'verify_time','reject','Please provide a clearer selfie');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000902',true);
select pg_temp.check_true((select data->>'message'='Please keep your conversations professional.' from public.notifications where type='moderation_warning'));
select pg_temp.check_true((select count(*)=0 from public.reports));
select pg_temp.check_true((select count(*)=0 from public.verification));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000905',true);
select pg_temp.check_true(not connectpk_private.feed_approved());
reset role;
select pg_temp.check_true((select status='approved' from public.profiles where id='00000000-0000-0000-0000-000000000906'));
select pg_temp.check_true((select status='rejected' and review_note='Please provide a clearer selfie' from public.verification where profile_id='00000000-0000-0000-0000-000000000907'));
select pg_temp.check_true((select status='active' and not moderation_hold from public.posts where id=:'hidden_id'));
select pg_temp.check_true((select count(*)=2 from public.audit_log where action like 'admin.verification.%'));
select pg_temp.check_true((select count(*)=1 from public.audit_log where action='admin.evidence.viewed'));
select pg_temp.check_true((select count(*)=1 from public.audit_log where action='admin.hidden.restore'));
rollback;
