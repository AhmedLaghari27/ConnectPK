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
select pg_temp.check_true((select count(*)=0 from public.notifications));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=1 from public.notifications where type='offer_accepted'));
select id as second_post from public.posts where author_id='00000000-0000-0000-0000-000000000301' and id<>:'post_id' order by id limit 1 \gset
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'second_post',auth.uid(),'mentoring','Happy to mentor') returning id as second_offer \gset
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
update public.offers set status='declined' where id=:'second_offer';
select pg_temp.check_true((select count(*)=0 from public.conversations where offer_id=:'second_offer'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=1 from public.notifications where type='offer_declined'));
select id as third_post from public.posts where author_id='00000000-0000-0000-0000-000000000302' order by id limit 1 \gset
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'third_post',auth.uid(),'development','Happy to help') returning id as third_offer \gset
update public.offers set status='withdrawn' where id=:'third_offer';
select set_config('test.post',:'third_post',true);
do $$begin
 begin
 insert into public.offers(post_id,offerer_id,offer_type,message) values(current_setting('test.post')::uuid,auth.uid(),'advice','Another offer');
 raise exception 'Duplicate offer accepted' using errcode='XX000';
 exception when unique_violation then null;end;
end;$$;
select pg_temp.check_true((select count(*)=0 from public.conversations where offer_id=:'third_offer'));
insert into public.offers(post_id,offerer_id,offer_type,message)
select p.id,auth.uid(),'advice','I can help' from public.posts p
where not exists(select 1 from public.offers o where o.post_id=p.id and o.offerer_id=auth.uid()) limit 17;
do $$begin
 begin
 insert into public.offers(post_id,offerer_id,offer_type,message)
 select p.id,auth.uid(),'advice','One more offer' from public.posts p
 where not exists(select 1 from public.offers o where o.post_id=p.id and o.offerer_id=auth.uid()) limit 1;
 raise exception 'Daily limit bypassed' using errcode='XX000';
 exception when raise_exception then null;end;
end;$$;
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000301');
select pg_temp.check_true((select count(*)=0 from public.post_offers(:'post_id')));
select pg_temp.check_true((select count(*)=0 from public.offer_profile(:'offer_id')));
rollback;
