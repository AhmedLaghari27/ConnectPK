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
select id as post_id from public.posts where author_id='00000000-0000-0000-0000-000000000301' limit 1 \gset
select pg_temp.check_true((select count(*)=1 from public.post_detail(:'post_id')));
insert into public.reactions(post_id,user_id,type) values(:'post_id',auth.uid(),'useful');
select pg_temp.check_true((select useful_count=1 from public.post_detail(:'post_id')));
update public.reactions set type='support' where post_id=:'post_id' and user_id=auth.uid();
select pg_temp.check_true((select useful_count=0 and support_count=1 from public.post_detail(:'post_id')));
delete from public.reactions where post_id=:'post_id' and user_id=auth.uid();
select pg_temp.check_true((select support_count=0 from public.post_detail(:'post_id')));
insert into public.comments(post_id,author_id,body) values(:'post_id',auth.uid(),'Helpful perspective') returning id as comment_id \gset
select pg_temp.check_true((select count(*)=1 from public.post_opinions(:'post_id')));
select public.submit_report('post',:'post_id','harassment','Please review this post');
select public.submit_report('post',:'post_id','harassment','Repeated report');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
select public.submit_report('comment',:'comment_id','harassment','Review opinion');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=0 from public.reports));
update public.comments set status='removed' where id=:'comment_id';
select pg_temp.check_true((select count(*)=0 from public.post_opinions(:'post_id')));
insert into public.hidden_posts(user_id,post_id) values(auth.uid(),:'post_id');
select pg_temp.check_true((select count(*)=0 from public.post_detail(:'post_id')));
select pg_temp.check_true(not exists(select 1 from public.feed_page() where id=:'post_id'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000310',true);
select pg_temp.check_true((select count(*)=1 from public.post_detail(:'post_id')));
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000301');
select pg_temp.check_true((select count(*)=0 from public.post_detail(:'post_id')));
reset role;
select pg_temp.check_true((select count(*)=2 from public.reports where post_id=:'post_id'));
rollback;
