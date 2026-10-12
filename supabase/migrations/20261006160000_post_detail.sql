begin;
create table public.hidden_posts (
 user_id uuid not null references public.profiles(id) on delete cascade,
 post_id uuid not null references public.posts(id) on delete cascade,
 primary key(user_id,post_id)
);
alter table public.hidden_posts enable row level security;
revoke all on public.hidden_posts from public,anon,authenticated;
grant select,insert,delete on public.hidden_posts to authenticated;
create policy hidden_posts_own on public.hidden_posts for all to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid() and connectpk_private.feed_post_visible(post_id));
create or replace function public.feed_page(filter_type public.post_type default null, filter_city public.member_city default null,
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
  where connectpk_private.feed_approved() and p.status='active' and not exists(select 1 from public.hidden_posts h where h.user_id=auth.uid() and h.post_id=p.id) and not connectpk_private.is_blocked(p.author_id)
    and (filter_type is null or p.post_type=filter_type) and (filter_city is null or p.city=filter_city)
    and (nullif(btrim(filter_tag),'') is null or exists(select 1 from unnest(p.tags) tag where lower(tag)=lower(btrim(filter_tag))))
    and (before_time is null or (before_id is not null and (p.created_at,p.id)<(before_time,before_id)))
  order by p.created_at desc,p.id desc limit 20;
$$;
revoke all on function public.feed_page(public.post_type,public.member_city,text,timestamptz,uuid) from public,anon;
grant execute on function public.feed_page(public.post_type,public.member_city,text,timestamptz,uuid) to authenticated;
create function public.post_detail(target uuid)
returns table(id uuid,author_id uuid,post_type public.post_type,title text,body text,tags text[],city public.member_city,
  created_at timestamptz,author_name text,author_photo text,author_role text,author_verified boolean,
  useful_count bigint,inspiring_count bigint,support_count bigint,comment_count bigint,offer_count bigint)
language sql stable security definer set search_path='' as $$
  select p.id,p.author_id,p.post_type,p.title,p.body,p.tags,p.city,p.created_at,
    a.full_name,a.avatar_path,a.headline,coalesce(v.status='approved',false),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='useful' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='inspiring' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.reactions r where r.post_id=p.id and r.type='support' and not connectpk_private.is_blocked(r.user_id)),
    (select count(*) from public.comments c where c.post_id=p.id and c.status='active' and not connectpk_private.is_blocked(c.author_id)),
    (select count(*) from public.offers o where o.post_id=p.id and not connectpk_private.is_blocked(o.offerer_id))
  from public.posts p join public.profiles a on a.id=p.author_id left join public.verification v on v.profile_id=a.id
  where connectpk_private.feed_approved() and p.status='active' and not connectpk_private.is_blocked(p.author_id)
    and p.id=target and not exists(select 1 from public.hidden_posts h where h.user_id=auth.uid() and h.post_id=p.id)
  order by p.created_at desc,p.id desc limit 1;
$$;

revoke all on function public.post_detail(uuid) from public,anon;
grant execute on function public.post_detail(uuid) to authenticated;
create function public.post_opinions(target uuid, after_time timestamptz default null, after_id uuid default null)
returns table(id uuid,author_id uuid,author_name text,body text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select c.id,c.author_id,p.full_name,c.body,c.created_at from public.comments c join public.profiles p on p.id=c.author_id
 where c.post_id=target and c.status='active' and connectpk_private.feed_post_visible(target)
 and not connectpk_private.is_blocked(c.author_id)
 and (after_time is null or (c.created_at,c.id)>(after_time,after_id))
 order by c.created_at,c.id limit 50;
$$;
revoke all on function public.post_opinions(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.post_opinions(uuid,timestamptz,uuid) to authenticated;
create function public.report_feed_content(target uuid, explanation text, opinion uuid default null) returns void
language plpgsql security definer set search_path='' as $$
declare subject uuid;
begin
 if not connectpk_private.feed_post_visible(target) or char_length(btrim(explanation)) not between 1 and 2000 or explanation is null then
 raise exception 'Invalid report' using errcode='42501'; end if;
 if opinion is null then select author_id into subject from public.posts where id=target;
 else select author_id into subject from public.comments where id=opinion and post_id=target and status='active'
 and not connectpk_private.is_blocked(author_id); end if;
 if subject is null then raise exception 'Unavailable' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || target::text || coalesce(opinion::text,''),0));
 if not exists(select 1 from public.reports where reporter_id=auth.uid() and post_id=target and comment_id is not distinct from opinion and status='open') then
 insert into public.reports(reporter_id,reported_id,post_id,comment_id,reason)
 values(auth.uid(),nullif(subject,auth.uid()),target,opinion,btrim(explanation));
 end if;
end; $$;
revoke all on function public.report_feed_content(uuid,text,uuid) from public,anon;
grant execute on function public.report_feed_content(uuid,text,uuid) to authenticated;
commit;
