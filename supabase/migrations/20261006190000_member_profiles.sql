begin;
create function connectpk_private.member_profile_visible(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid()=target or (connectpk_private.feed_approved() and not connectpk_private.is_blocked(target)
 and exists(select 1 from public.profiles p join public.verification v on v.profile_id=p.id where p.id=target and p.status='approved' and v.status='approved'));
$$;
revoke all on function connectpk_private.member_profile_visible(uuid) from public,anon;
grant execute on function connectpk_private.member_profile_visible(uuid) to authenticated;
create function public.member_profile(target uuid)
returns table(id uuid,full_name text,avatar_path text,verified boolean,professional_role text,organization text,independent boolean,city public.member_city,skills text[],vision text,can_help text)
language sql stable security definer set search_path='' as $$
 select p.id,p.full_name,p.avatar_path,coalesce(v.status='approved',false),p.headline,
 d.data->>'organization',coalesce((d.data->>'independent')::boolean,false),p.city,
 array(select s.name from public.profile_skills ps join public.skills s on s.id=ps.skill_id where ps.profile_id=p.id order by s.name),
 d.data->>'vision',p.bio
 from public.profiles p left join public.profile_setup d on d.user_id=p.id left join public.verification v on v.profile_id=p.id
 where p.id=target and connectpk_private.member_profile_visible(target);
$$;
revoke all on function public.member_profile(uuid) from public,anon;
grant execute on function public.member_profile(uuid) to authenticated;
create or replace function connectpk_private.feed_photo_visible(object_name text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.avatar_path=object_name and (storage.foldername(object_name))[1]=p.id::text
 and connectpk_private.member_profile_visible(p.id));
$$;
create function public.save_member_profile(payload jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); k text; value text; skill_name text; skill_id uuid; cleaned jsonb:='{}'; min_len integer; max_len integer;
begin
 perform 1 from public.profiles where id=uid and setup_completed_at is not null and status in ('pending','approved') for update;
 if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' then raise exception 'Invalid profile' using errcode='22023'; end if;
 foreach k in array array['full_name','avatar_path','professional_role','organization','city','skills','vision','can_help'] loop
  value:=btrim(coalesce(payload->>k,''));
  min_len:=case when k='organization' and payload->>'independent'='true' then 0 when k in ('vision','can_help') then 20 when k in ('full_name','professional_role','organization') then 2 else 1 end;
  max_len:=case k when 'full_name' then 120 when 'professional_role' then 100 when 'organization' then 120 when 'city' then 20 when 'skills' then 810 when 'vision' then 300 when 'can_help' then 500 else 300 end;
  if char_length(value) not between min_len and max_len then raise exception 'Invalid profile field' using errcode='22023'; end if;
  if k<>'avatar_path' and normalize(value,NFKC) ~* '\m(dating|romance|romantic|hook[[:space:]-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(ing)?)\M' then
   raise exception 'Professional wording required' using errcode='P0001'; end if;
  cleaned:=cleaned||jsonb_build_object(k,value);
 end loop;
 if jsonb_typeof(payload->'independent') is distinct from 'boolean' then raise exception 'Invalid work preference' using errcode='22023'; end if;
 cleaned:=cleaned||jsonb_build_object('independent',payload->'independent');
 if payload->>'independent'='true' then cleaned:=cleaned||jsonb_build_object('organization',''); end if;
 if cleaned->>'city' not in ('Karachi','Lahore','Islamabad') then raise exception 'Invalid city' using errcode='22023'; end if;
 if (storage.foldername(cleaned->>'avatar_path'))[1] is distinct from uid::text or not exists(select 1 from storage.objects where bucket_id='profile-photos' and name=cleaned->>'avatar_path') then
 raise exception 'Invalid photo' using errcode='22023'; end if;
 if cardinality(string_to_array(cleaned->>'skills',',')) not between 1 and 10 or exists(select 1 from unnest(string_to_array(cleaned->>'skills',',')) item where char_length(btrim(item)) not between 1 and 80) then raise exception 'Invalid skills' using errcode='22023'; end if;
 update public.profiles set full_name=cleaned->>'full_name',headline=cleaned->>'professional_role',avatar_path=cleaned->>'avatar_path',city=(cleaned->>'city')::public.member_city,bio=cleaned->>'can_help',updated_at=now() where id=uid;
 insert into public.profile_setup(user_id,data,step) values(uid,cleaned,5)
 on conflict(user_id) do update set data=public.profile_setup.data||excluded.data,updated_at=now();
 delete from public.profile_skills where profile_id=uid;
 foreach skill_name in array string_to_array(cleaned->>'skills',',') loop
  insert into public.skills(name) values(lower(btrim(skill_name))) on conflict(lower(btrim(name))) do update set name=excluded.name returning id into skill_id;
  insert into public.profile_skills(profile_id,skill_id) values(uid,skill_id) on conflict do nothing;
 end loop;
end; $$;
revoke all on function public.save_member_profile(jsonb) from public,anon;
grant execute on function public.save_member_profile(jsonb) to authenticated;
create function public.my_offers(before_time timestamptz default null,before_id uuid default null)
returns table(id uuid,post_id uuid,post_title text,offer_type public.offer_type,message text,status public.offer_status,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select o.id,o.post_id,p.title,o.offer_type,o.message,o.status,o.created_at from public.offers o join public.posts p on p.id=o.post_id
 where o.offerer_id=auth.uid() and connectpk_private.feed_offer_visible(o.post_id,o.offerer_id)
 and (before_time is null or (o.created_at,o.id)<(before_time,before_id)) order by o.created_at desc,o.id desc limit 20;
$$;
revoke all on function public.my_offers(timestamptz,uuid) from public,anon;
grant execute on function public.my_offers(timestamptz,uuid) to authenticated;
create function public.member_posts(target uuid,before_time timestamptz default null,before_id uuid default null)
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
  where p.author_id=target and connectpk_private.member_profile_visible(target) and p.status='active' and not connectpk_private.is_blocked(p.author_id)
    and (target=auth.uid() or not exists(select 1 from public.hidden_posts h where h.user_id=auth.uid() and h.post_id=p.id))
    and (before_time is null or (before_id is not null and (p.created_at,p.id)<(before_time,before_id)))
  order by p.created_at desc,p.id desc limit 20;
$$;
revoke all on function public.member_posts(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.member_posts(uuid,timestamptz,uuid) to authenticated;
commit;
