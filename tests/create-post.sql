\set ON_ERROR_STOP on
begin;
create function pg_temp.check_true(value boolean) returns void language plpgsql as $$begin if value is distinct from true then raise exception 'Assertion failed'; end if; end;$$;
insert into auth.users(id) select ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid from generate_series(301,310)i;
insert into public.profiles(id,full_name,date_of_birth,city,intention,status,headline,avatar_path)
select id,'Feed Author','1990-01-01','Karachi','exchange_ideas','approved','Designer',id::text||'/profile.jpg' from auth.users where id between '00000000-0000-0000-0000-000000000301' and '00000000-0000-0000-0000-000000000310';
insert into public.verification(profile_id,selfie_path,status,reviewed_at)
select id,'private/selfie','approved',now() from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true(public.my_post_quota()=3);
do $$begin
 begin
 insert into public.posts(author_id,post_type,title,body,city) values(auth.uid(),'building','Project','Send me money','Karachi');
 raise exception 'Scam was accepted';
 exception when check_violation then null; end;
 begin
 insert into public.posts(author_id,post_type,title,body,city) values(auth.uid(),'building','Dating','Professional body','Karachi');
 raise exception 'Romance was accepted';
 exception when check_violation then null; end;
end;$$;
select pg_temp.check_true(public.my_post_quota()=3);
insert into public.posts(author_id,post_type,title,body,tags,city)
select auth.uid(),'building','A prototype','Seeking advice on funding a prototype',array['design'],'Karachi' from generate_series(1,3);
select pg_temp.check_true(public.my_post_quota()=0);
do $$begin
 begin
 insert into public.posts(author_id,post_type,title,body,city) values(auth.uid(),'building','Project','A professional update','Karachi');
 raise exception 'Fourth post accepted' using errcode='XX000';
 exception when raise_exception then null; end;
end;$$;
delete from public.posts where author_id=auth.uid();
select pg_temp.check_true(public.my_post_quota()=0);
rollback;
