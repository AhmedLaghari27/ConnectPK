\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(801,806)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,avatar_path)
select id,'Moderation Tester','1990-01-01','Karachi','exchange_ideas','approved',id::text||'/photo.jpg' from auth.users where id between '00000000-0000-0000-0000-000000000801' and '00000000-0000-0000-0000-000000000806';
insert into public.verification(profile_id,selfie_path,status,reviewed_at) select id,'private/selfie','approved',now() from public.profiles;
insert into storage.objects(bucket_id,name) select 'profile-photos',avatar_path from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
insert into public.posts(author_id,post_type,title,body,tags,city) values(auth.uid(),'building','Useful project','Building a useful tool',array['Design'],'Karachi') returning id as post_id \gset
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'Original opinion') returning id as comment_id \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000802',true);
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'An opinion') returning id as own_comment \gset
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','Happy to advise') returning id as offer_id \gset
select public.submit_report('profile','00000000-0000-0000-0000-000000000801','private_information','Private details in profile');
select public.submit_report('comment',:'comment_id','harassment','Please review this opinion');
select public.submit_report('post',:'post_id','scam_fraud','This appears to be fraudulent');
select public.submit_report('post',:'post_id','scam_fraud','Retry should not count twice');
select pg_temp.check_true((select count(*)=0 from public.reports));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
select public.submit_report('offer',:'offer_id','pyramid_scheme','Please review the offer');
update public.offers set status='accepted' where id=:'offer_id';
select id as chat_id from public.conversations where offer_id=:'offer_id' \gset
select public.send_chat_message(:'chat_id','Original message','moderation-test') as message_id \gset
update public.comments set body='Edited opinion' where id=:'comment_id';
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000802',true);
select public.submit_report('message',:'message_id','scam_fraud','Please review this message');
reset role;
select pg_temp.check_true((select count(*)=5 from public.reports));
select pg_temp.check_true((select count(*)=2 from public.reports where severity='high' and category='scam_fraud'));
select pg_temp.check_true((select evidence_snapshot->>'body'='Original opinion' from public.reports where target_kind='comment'));
select pg_temp.check_true((select status='active' from public.posts where id=:'post_id'));
select pg_temp.check_true(not has_function_privilege('authenticated','public.report_chat(uuid,text)','execute'));
select pg_temp.check_true(not has_function_privilege('authenticated','public.report_feed_content(uuid,text,uuid)','execute'));
select set_config('test.message',:'message_id',true);
select set_config('test.offer',:'offer_id',true);
select set_config('test.post',:'post_id',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000803',true);
do $$begin
 begin perform public.submit_report('message',current_setting('test.message')::uuid,'harassment','Unauthorized');raise exception 'Outsider reported a private message';exception when insufficient_privilege then null;end;
 begin perform public.submit_report('offer',current_setting('test.offer')::uuid,'harassment','Unauthorized');raise exception 'Outsider reported a private offer';exception when insufficient_privilege then null;end;
 begin perform public.submit_report('profile',auth.uid(),'harassment','Self report');raise exception 'Self report accepted';exception when insufficient_privilege then null;end;
 begin perform public.submit_report('post',current_setting('test.post')::uuid,'invalid','Invalid category');raise exception 'Invalid category accepted';exception when invalid_parameter_value then null;end;
 begin perform public.submit_report('post',current_setting('test.post')::uuid,'harassment','   ');raise exception 'Blank description accepted';exception when invalid_parameter_value then null;end;
end;$$;
select public.submit_report('comment',:'comment_id','harassment','A second opinion report');
select public.submit_report('post',:'post_id','harassment','Second post reporter');
select public.submit_report('post',:'post_id','scam_fraud','Escalate my existing report');
reset role;
select pg_temp.check_true((select severity='high' from public.reports where reporter_id='00000000-0000-0000-0000-000000000803' and target_kind='post'));
set local role authenticated;
select pg_temp.check_true((select count(*)=1 from public.post_detail(:'post_id')));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000804',true);
select public.submit_report('comment',:'comment_id','harassment','A third opinion report');
select pg_temp.check_true((select count(*)=1 from public.post_detail(:'post_id')));
select public.submit_report('post',:'post_id','harassment','Third post reporter');
select pg_temp.check_true((select count(*)=0 from public.post_detail(:'post_id')));
select pg_temp.check_true(not exists(select 1 from public.feed_page() where id=:'post_id'));
select pg_temp.check_true(not exists(select 1 from public.member_posts('00000000-0000-0000-0000-000000000801') where id=:'post_id'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
update public.posts set status='active' where id=:'post_id';
select pg_temp.check_true((select status='hidden' and moderation_hold from public.posts where id=:'post_id'));
reset role;
select pg_temp.check_true((select count(*)=1 from public.audit_log where action='moderation.post.auto_hidden' and entity_id=:'post_id'));
-- Restore only as trusted moderator SQL, after resolving reports.
select set_config('request.jwt.claim.sub','',true);
update public.reports set status='dismissed',resolved_at=now() where post_id=:'post_id';
update public.posts set moderation_hold=false,status='active' where id=:'post_id';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000802',true);
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000801');
select pg_temp.check_true((select count(*)=0 from public.member_profile('00000000-0000-0000-0000-000000000801')));
select pg_temp.check_true((select count(*)=0 from public.posts where id=:'post_id'));
select pg_temp.check_true((select count(*)=0 from public.comments where id=:'own_comment'));
select pg_temp.check_true((select count(*)=0 from public.post_opinions(:'post_id')));
select pg_temp.check_true((select count(*)=0 from public.my_offers()));
select pg_temp.check_true((select count(*)=0 from public.chat_inbox(:'chat_id')));
select pg_temp.check_true((select count(*)=0 from public.chat_messages where conversation_id=:'chat_id'));
select pg_temp.check_true((select count(*)=0 from storage.objects where name='00000000-0000-0000-0000-000000000801/photo.jpg'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000801',true);
select pg_temp.check_true((select count(*)=0 from public.member_profile('00000000-0000-0000-0000-000000000802')));
select pg_temp.check_true((select count(*)=0 from public.comments where id=:'own_comment'));
select pg_temp.check_true((select count(*)=0 from public.post_offers(:'post_id')));
select pg_temp.check_true((select count(*)=0 from public.chat_messages where conversation_id=:'chat_id'));
-- Reports stay readable to approved staff only.
reset role;
update public.profiles set role='moderator' where id='00000000-0000-0000-0000-000000000806';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000806',true);
select set_config('request.jwt.claims','{"aal":"aal2"}',true);
select pg_temp.check_true((select count(*)=9 from public.reports));
rollback;
