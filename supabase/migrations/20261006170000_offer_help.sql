begin;
-- Keep the decision, conversation, and recipient-only notification atomic.
create or replace function connectpk_private.feed_open_conversation() returns trigger
language plpgsql security definer set search_path='' as $$
declare conversation_id uuid;
begin
 if new.status=old.status then return new; end if;
 if new.status='accepted' then
   insert into public.conversations(offer_id,user_a,user_b)
   select new.id,author_id,new.offerer_id from public.posts where id=new.post_id
   returning id into conversation_id;
 end if;
 if new.status in ('accepted','declined') then
   insert into public.notifications(user_id,type,data)
   values(new.offerer_id,'offer_'||new.status::text,jsonb_build_object(
     'offer_id',new.id,'post_id',new.post_id,'conversation_id',conversation_id,
     'message',case when new.status='accepted' then 'Your offer was accepted. A private conversation is ready.'
       else 'Thank you for offering to help. The post owner has declined this offer.' end));
 end if;
 return new;
end; $$;
grant select on public.notifications to authenticated;
create policy offer_notifications_own on public.notifications for select to authenticated
using(user_id=auth.uid() and type in ('offer_accepted','offer_declined'));

create function public.offer_profile(target uuid)
returns table(id uuid,full_name text,headline text,bio text,city public.member_city,verified boolean)
language sql stable security definer set search_path='' as $$
 select p.id,p.full_name,p.headline,p.bio,p.city,coalesce(v.status='approved',false)
 from public.offers o join public.profiles p on p.id=o.offerer_id
 left join public.verification v on v.profile_id=p.id
 where o.id=target and connectpk_private.feed_offer_visible(o.post_id,o.offerer_id);
$$;
revoke all on function public.offer_profile(uuid) from public,anon;
grant execute on function public.offer_profile(uuid) to authenticated;

create function public.post_offers(target uuid, before_time timestamptz default null, before_id uuid default null)
returns table(id uuid,offerer_id uuid,full_name text,offer_type public.offer_type,message text,status public.offer_status,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select o.id,o.offerer_id,p.full_name,o.offer_type,o.message,o.status,o.created_at
 from public.offers o join public.profiles p on p.id=o.offerer_id
 where o.post_id=target and connectpk_private.feed_offer_visible(o.post_id,o.offerer_id)
 and (before_time is null or (o.created_at,o.id)<(before_time,before_id))
 order by o.created_at desc,o.id desc limit 20;
$$;
revoke all on function public.post_offers(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.post_offers(uuid,timestamptz,uuid) to authenticated;
commit;
