begin;
-- Caller-bound projection: profiles remains owner-only and offers remain private.
create function public.feed_page(filter_type public.post_type default null, filter_city public.member_city default null,
  filter_tag text default null, before_time timestamptz default null, before_id uuid default null)
returns table(id uuid,author_id uuid,post_type public.post_type,title text,body text,tags text[],city public.member_city,
  created_at timestamptz,author_name text,author_photo text,author_role text,author_verified boolean,
  useful_count bigint,inspiring_count bigint,support_count bigint,comment_count bigint,offer_count bigint)
language sql stable security definer set search_path='' as $$
  select p.id,p.author_id,p.post_type,p.title,left(p.body,320),p.tags,p.city,p.created_at,
    a.full_name,a.avatar_path,a.headline,coalesce(v.status='approved',false),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='useful' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='inspiring' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='support' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.comments c where c.post_id=p.id and c.status='active' and not connectpk_private.is_blocked(c.author_id)),
    (select count(*) from public.offers o where o.post_id=p.id and not connectpk_private.is_blocked(o.offerer_id))
  from public.posts p join public.profiles a on a.id=p.author_id left join public.verification v on v.profile_id=a.id
  where connectpk_private.feed_approved() and p.status='active' and not connectpk_private.is_blocked(p.author_id)
    and (filter_type is null or p.post_type=filter_type) and (filter_city is null or p.city=filter_city)
    and (nullif(btrim(filter_tag),'') is null or exists(select 1 from unnest(p.tags) tag where lower(tag)=lower(btrim(filter_tag))))
    and (before_time is null or (before_id is not null and (p.created_at,p.id)<(before_time,before_id)))
  order by p.created_at desc,p.id desc limit 20;
$$;
revoke all on function public.feed_page(public.post_type,public.member_city,text,timestamptz,uuid) from public,anon;
grant execute on function public.feed_page(public.post_type,public.member_city,text,timestamptz,uuid) to authenticated;
create function connectpk_private.feed_photo_visible(object_name text) returns boolean
language sql stable security definer set search_path='' as $$
  select connectpk_private.feed_approved() and exists(select 1 from public.profiles a join public.posts p on p.author_id=a.id
    where a.avatar_path=object_name and (storage.foldername(object_name))[1]=a.id::text
      and p.status='active' and not connectpk_private.is_blocked(a.id));
$$;
revoke all on function connectpk_private.feed_photo_visible(text) from public,anon;
grant execute on function connectpk_private.feed_photo_visible(text) to authenticated;
-- Split the original all-operation guard so only reads gain feed visibility.
drop policy profile_photo_owner_guard on storage.objects;
create policy profile_photo_read_guard on storage.objects as restrictive for select to authenticated
using(bucket_id<>'profile-photos' or (storage.foldername(name))[1]=auth.uid()::text or connectpk_private.feed_photo_visible(name));
create policy profile_photo_feed_read on storage.objects for select to authenticated
using(bucket_id='profile-photos' and connectpk_private.feed_photo_visible(name));
create policy profile_photo_insert_guard on storage.objects as restrictive for insert to authenticated
with check(bucket_id<>'profile-photos' or (storage.foldername(name))[1]=auth.uid()::text);
create policy profile_photo_update_guard on storage.objects as restrictive for update to authenticated
using(bucket_id<>'profile-photos' or (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id<>'profile-photos' or (storage.foldername(name))[1]=auth.uid()::text);
create policy profile_photo_delete_guard on storage.objects as restrictive for delete to authenticated
using(bucket_id<>'profile-photos' or (storage.foldername(name))[1]=auth.uid()::text);
commit;
