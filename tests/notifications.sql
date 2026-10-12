\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(701,703)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status)
select id,'Notification Tester','1990-01-01','Karachi','exchange_ideas','approved' from auth.users where id between '00000000-0000-0000-0000-000000000701' and '00000000-0000-0000-0000-000000000703';
insert into public.verification(profile_id,selfie_path,status,reviewed_at) select id,'private/selfie','approved',now() from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
select public.set_device_push('ExpoPushToken[testA]',true);
insert into public.posts(author_id,post_type,title,body,tags,city) values(auth.uid(),'building','Useful project','Building a useful tool',array['Design'],'Karachi') returning id as post_id \gset
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'My own opinion');
select pg_temp.check_true((select count(*)=0 from public.notifications));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000702',true);
select public.set_device_push('ExpoPushToken[testB]',true);
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'Useful work');
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','Happy to advise') returning id as offer_id \gset
select pg_temp.check_true((select count(*)=0 from public.notifications));
select public.set_device_push('ExpoPushToken[testA]',false);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
select pg_temp.check_true(public.my_device_push('ExpoPushToken[testA]'));
select pg_temp.check_true((select count(*)=2 from public.notifications));
select id as notice_id from public.notifications where type='new_comment' \gset
update public.offers set status='accepted' where id=:'offer_id';
select id as chat_id from public.conversations where offer_id=:'offer_id' \gset
select public.send_chat_message(:'chat_id','Happy to discuss','notification-retry');
select public.send_chat_message(:'chat_id','Happy to discuss','notification-retry');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000702',true);
select pg_temp.check_true((select count(*)=2 from public.notifications));
select public.mark_notifications_read(:'notice_id');
select pg_temp.check_true(not has_function_privilege('authenticated','public.claim_push_jobs()','execute'));
select pg_temp.check_true(not has_table_privilege('authenticated','connectpk_private.push_devices','select'));
reset role;
select pg_temp.check_true((select read_at is null from public.notifications where id=:'notice_id'));
select pg_temp.check_true((select count(*)=4 from connectpk_private.push_jobs where status='pending'));
-- Claim and stale lease protection, then receipt handling.
select job_id,job_lease from public.claim_push_jobs() limit 1 \gset
select public.finish_push_job(:'job_id',gen_random_uuid(),'delivered');
select pg_temp.check_true((select status='working' from connectpk_private.push_jobs where id=:'job_id'));
select public.finish_push_job(:'job_id',:'job_lease','ticket','test-ticket');
select pg_temp.check_true((select status='ticket' and next_attempt_at>now() from connectpk_private.push_jobs where id=:'job_id'));
-- Read/opt-out cancels queued and leased jobs.
set local role authenticated;
select public.mark_notifications_read();
select public.set_device_push('ExpoPushToken[testB]',false);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
select public.mark_notifications_read();
reset role;
select pg_temp.check_true((select count(*)=0 from public.claim_push_jobs()));
select pg_temp.check_true((select count(*)=0 from connectpk_private.push_jobs where status in ('pending','ticket','working')));
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000703',true);
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','Another offer') returning id as declined_id \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
update public.offers set status='declined' where id=:'declined_id';
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000703',true);
select pg_temp.check_true((select count(*)=1 from public.notifications where type='offer_declined'));
select pg_temp.check_true((select count(*)=1 from public.notifications));
-- Blocking removes existing entries and suppresses unsent jobs.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000701',true);
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000703');
select pg_temp.check_true((select count(*)=0 from public.notifications where actor_id='00000000-0000-0000-0000-000000000703'));
reset role;
select pg_temp.check_true((select count(*)=0 from public.claim_push_jobs()));
-- Invalid devices stop future sends; retries terminate rather than loop forever.
insert into public.notifications(user_id,actor_id,type,data) values('00000000-0000-0000-0000-000000000701','00000000-0000-0000-0000-000000000702','new_message','{}');
select job_id,job_lease from public.claim_push_jobs() limit 1 \gset
select public.finish_push_job(:'job_id',:'job_lease','dead',null,'DeviceNotRegistered');
select pg_temp.check_true((select not enabled from connectpk_private.push_devices where token='ExpoPushToken[testA]'));
update connectpk_private.push_devices set enabled=true where token='ExpoPushToken[testA]';
insert into public.notifications(user_id,actor_id,type,data) values('00000000-0000-0000-0000-000000000701','00000000-0000-0000-0000-000000000702','new_message','{}');
update connectpk_private.push_jobs set attempts=4 where status='pending';
select job_id,job_lease from public.claim_push_jobs() limit 1 \gset
select public.finish_push_job(:'job_id',:'job_lease','pending',null,'NetworkError');
select pg_temp.check_true((select status='dead' and attempts=5 from connectpk_private.push_jobs where id=:'job_id'));
rollback;
