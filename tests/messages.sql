\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(301,310)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,headline,avatar_path)
select id,'Feed Author','1990-01-01','Karachi','exchange_ideas','approved','Designer',id::text||'/profile.jpg' from auth.users where id between '00000000-0000-0000-0000-000000000301' and '00000000-0000-0000-0000-000000000310';
insert into public.verification(profile_id,selfie_path,status,reviewed_at)
select id,'private/selfie','approved',now() from public.profiles;
insert into public.posts(author_id,post_type,title,body,tags,city)
select id,'building','Useful work','A professional update',array['Design'],'Karachi' from public.profiles cross join generate_series(1,3)n where id<'00000000-0000-0000-0000-000000000309';
insert into storage.objects(bucket_id,name) select 'profile-photos',avatar_path from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select id as post_id from public.posts where author_id='00000000-0000-0000-0000-000000000301' order by id limit 1 \gset
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','I can review your prototype') returning id as offer_id \gset
select pg_temp.check_true((select count(*)=1 from public.post_offers(:'post_id')));
select set_config('test.offer',:'offer_id',true);
do $$begin
 begin
 update public.offers set status='accepted' where id=current_setting('test.offer')::uuid;
 raise exception 'Offerer accepted own offer' using errcode='XX000';
 exception when insufficient_privilege then null;end;
end;$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000310',true);
select pg_temp.check_true((select count(*)=0 from public.post_offers(:'post_id')));
select pg_temp.check_true((select count(*)=0 from public.offer_profile(:'offer_id')));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
select pg_temp.check_true((select count(*)=1 from public.offer_profile(:'offer_id')));
update public.offers set status='accepted' where id=:'offer_id';
update public.offers set status='accepted' where id=:'offer_id';
select pg_temp.check_true((select count(*)=1 from public.conversations where offer_id=:'offer_id'));
select pg_temp.check_true((select count(*)=0 from public.notifications where type='offer_accepted'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=1 from public.notifications where type='offer_accepted'));
select id as chat_id from public.conversations where offer_id=:'offer_id' \gset
select public.send_chat_message(:'chat_id','Hello, happy to help','test-retry-key');
select public.send_chat_message(:'chat_id','Hello, happy to help','test-retry-key');
select pg_temp.check_true((select count(*)=1 from public.chat_messages where conversation_id=:'chat_id'));
select pg_temp.check_true((select last_message='Hello, happy to help' from public.chat_inbox(:'chat_id')));
select id as report_message from public.chat_messages where conversation_id=:'chat_id' limit 1 \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
select public.submit_report('message',:'report_message','harassment','Please review this message');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=0 from public.reports));
select set_config('test.chat',:'chat_id',true);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000310',true);
select pg_temp.check_true((select count(*)=0 from public.chat_inbox(:'chat_id')));
select pg_temp.check_true((select count(*)=0 from public.chat_messages where conversation_id=:'chat_id'));
do $$begin
 begin perform public.send_chat_message(current_setting('test.chat')::uuid,'Intrusion','bad-key');
 raise exception 'Outsider sent a message' using errcode='XX000';
 exception when insufficient_privilege then null;end;
 begin perform public.leave_chat(current_setting('test.chat')::uuid);
 raise exception 'Outsider ended chat' using errcode='XX000';
 exception when insufficient_privilege then null;end;
end;$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000301');
select pg_temp.check_true((select count(*)=0 from public.chat_inbox(:'chat_id')));
do $$begin
 begin perform public.send_chat_message(current_setting('test.chat')::uuid,'Blocked','blocked-key');
 raise exception 'Blocked member sent a message' using errcode='XX000';
 exception when insufficient_privilege then null;end;
end;$$;
delete from public.blocks where blocker_id=auth.uid();
select public.leave_chat(:'chat_id');
select pg_temp.check_true((select count(*)=0 from public.chat_inbox(:'chat_id')));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
select pg_temp.check_true((select count(*)=0 from public.chat_messages where conversation_id=:'chat_id'));
do $$begin
 begin perform public.send_chat_message(current_setting('test.chat')::uuid,'After leave','closed-key');
 raise exception 'Closed chat accepted message' using errcode='XX000';
 exception when insufficient_privilege then null;end;
end;$$;
reset role;
select pg_temp.check_true((select count(*)=1 from public.chat_messages where conversation_id=:'chat_id'));
select pg_temp.check_true((select count(*)=1 from public.reports where conversation_id=:'chat_id'));
select pg_temp.check_true((select count(*)=2 from pg_publication_tables where pubname='supabase_realtime' and tablename in ('chat_messages','conversations')));
rollback;
