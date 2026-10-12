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
update public.profiles set setup_completed_at=now();
insert into public.profile_setup(user_id,data,step)
select id,jsonb_build_object('organization','Studio','independent',false,'vision','Building tools for local professionals.','date_of_birth','1990-01-01','broad_area','PRIVATE AREA','private_test','SECRET'),5 from public.profiles;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
select pg_temp.check_true((select count(*)=1 from public.member_profile('00000000-0000-0000-0000-000000000301')));
select pg_temp.check_true((select to_jsonb(p)::text not like '%SECRET%' and to_jsonb(p)::text not like '%PRIVATE AREA%' and not to_jsonb(p)?'date_of_birth' and not to_jsonb(p)?'phone' from public.member_profile('00000000-0000-0000-0000-000000000301') p));
select public.save_member_profile(jsonb_build_object('full_name','Updated Member','avatar_path',auth.uid()::text||'/profile.jpg','professional_role','Designer','organization','Studio','independent',false,'city','Lahore','skills','design, research','vision','Building useful tools for professionals.','can_help','I can help teams improve their product design.','role','admin','date_of_birth','2015-01-01'));
select pg_temp.check_true((select full_name='Updated Member' and city='Lahore' and date_of_birth='1990-01-01' and role='member' from public.profiles where id=auth.uid()));
select pg_temp.check_true((select cardinality(skills)=2 and organization='Studio' from public.member_profile(auth.uid())));
select pg_temp.check_true((select data->>'private_test'='SECRET' from public.profile_setup where user_id=auth.uid()));
select id as post_id from public.posts where author_id='00000000-0000-0000-0000-000000000301' limit 1 \gset
update public.posts set title='Unauthorized edit' where id=:'post_id';
select pg_temp.check_true((select title<>'Unauthorized edit' from public.posts where id=:'post_id'));
insert into public.offers(post_id,offerer_id,offer_type,message) values(:'post_id',auth.uid(),'advice','Happy to advise');
select pg_temp.check_true((select count(*)=1 from public.my_offers()));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000301',true);
select pg_temp.check_true((select count(*)=0 from public.my_offers()));
update public.posts set title='Updated title' where id=:'post_id';
select pg_temp.check_true((select title='Updated title' from public.posts where id=:'post_id'));
update public.posts set status='removed' where id=:'post_id';
select pg_temp.check_true(not exists(select 1 from public.member_posts(auth.uid()) where id=:'post_id'));
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000309',true);
insert into public.blocks(blocker_id,blocked_id) values(auth.uid(),'00000000-0000-0000-0000-000000000301');
select pg_temp.check_true((select count(*)=0 from public.member_profile('00000000-0000-0000-0000-000000000301')));
select pg_temp.check_true((select count(*)=0 from public.member_posts('00000000-0000-0000-0000-000000000301')));
select pg_temp.check_true((select count(*)=0 from storage.objects where name='00000000-0000-0000-0000-000000000301/profile.jpg'));
select pg_temp.check_true((select count(*)=0 from public.verification));
rollback;
