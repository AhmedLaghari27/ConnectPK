\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(951,955)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,role)
select id,'Content review tester','1990-01-01','Karachi','exchange_ideas','approved',case when id='00000000-0000-0000-0000-000000000955' then 'moderator'::public.member_role else 'member'::public.member_role end from auth.users where id between '00000000-0000-0000-0000-000000000951' and '00000000-0000-0000-0000-000000000955';
insert into public.verification(profile_id,selfie_path,status,reviewed_at) select id,'private/selfie','approved',now() from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000951',true);
insert into public.posts(author_id,post_type,title,body,city) values(auth.uid(),'building','Content review','A professional project','Karachi') returning id as post_id \gset
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'Original opinion') returning id as comment_id \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000952',true);
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','Original offer') returning id as offer_id \gset
select public.submit_report('comment',:'comment_id','harassment','Review opinion');
select public.submit_report('profile','00000000-0000-0000-0000-000000000953','harassment','Review profile');
select public.submit_report('profile','00000000-0000-0000-0000-000000000954','harassment','Dismiss this report');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000951',true);
update public.offers set status='accepted' where id=:'offer_id';
select id as chat_id from public.conversations where offer_id=:'offer_id' \gset
select public.submit_report('offer',:'offer_id','harassment','Review offer');
select public.send_chat_message(:'chat_id','Original message body','admin-message-test') as message_id \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000952',true);
select public.submit_report('message',:'message_id','harassment','Review message');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000955',true);
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select id as report_id,updated_at as stamp from public.reports where target_kind='message' \gset
select public.admin_review_report(:'report_id',:'stamp','remove','Remove message');
select id as report_id,updated_at as stamp from public.reports where target_kind='comment' \gset
select public.admin_review_report(:'report_id',:'stamp','remove','Remove opinion');
select id as report_id,updated_at as stamp from public.reports where target_kind='offer' \gset
select public.admin_review_report(:'report_id',:'stamp','remove','Remove offer');
select id as report_id,updated_at as stamp from public.reports where reported_id='00000000-0000-0000-0000-000000000953' \gset
select public.admin_review_report(:'report_id',:'stamp','remove','Remove profile');
select id as report_id,updated_at as stamp from public.reports where reported_id='00000000-0000-0000-0000-000000000954' \gset
select public.admin_review_report(:'report_id',:'stamp','dismiss','No violation found');
reset role;
select pg_temp.check_true((select body='[Message removed by a moderator]' from public.chat_messages where id=:'message_id'));
select pg_temp.check_true((select evidence_snapshot->>'body'='Original message body' from public.reports where target_kind='message'));
select pg_temp.check_true((select status='removed' from public.comments where id=:'comment_id'));
select pg_temp.check_true((select moderation_removed from public.offers where id=:'offer_id'));
select pg_temp.check_true((select closed_at is not null from public.conversations where id=:'chat_id'));
select pg_temp.check_true((select status='suspended' from public.profiles where id='00000000-0000-0000-0000-000000000953'));
select pg_temp.check_true((select count(*)=5 from public.audit_log where action like 'admin.report.%'));
select set_config('request.jwt.claim.sub','',true);
update public.posts set status='hidden',moderation_hold=true where id=:'post_id';
select review_version as version from public.posts where id=:'post_id' \gset
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000955',true);
select public.admin_review_hidden(:'post_id',:'version','remove','Uphold hidden post');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000951',true);
select pg_temp.check_true((select count(*)=0 from public.post_offers(:'post_id')));
select pg_temp.check_true((select count(*)=0 from public.chat_inbox(:'chat_id')));
select pg_temp.check_true(not has_column_privilege('authenticated','public.profiles','banned_at','UPDATE'));
select pg_temp.check_true(not has_column_privilege('authenticated','public.offers','moderation_removed','UPDATE'));
rollback;
