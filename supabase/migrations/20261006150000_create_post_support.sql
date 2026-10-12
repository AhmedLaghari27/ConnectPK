begin;
create function public.my_post_quota() returns integer
language sql stable security definer set search_path='' as $$
  select case when connectpk_private.feed_approved() then greatest(0,3-count(*)::integer) else 0 end
  from public.audit_log where actor_id=auth.uid() and action='feed.post.created'
    and created_at >= (date_trunc('day',now() at time zone 'Asia/Karachi') at time zone 'Asia/Karachi')
    and created_at < (date_trunc('day',now() at time zone 'Asia/Karachi') at time zone 'Asia/Karachi')+interval '24 hours';
$$;
revoke all on function public.my_post_quota() from public,anon;
grant execute on function public.my_post_quota() to authenticated;
create function connectpk_private.validate_post_content() returns trigger
language plpgsql set search_path='' as $$
declare content text;
begin
  if cardinality(new.tags)>5 or exists(select 1 from unnest(new.tags) tag where char_length(tag)>40 or btrim(tag)='') then
    raise exception 'Post tags invalid' using errcode='23514';
  end if;
  content:=replace(replace(replace(replace(normalize(new.title || ' ' || new.body || ' ' || array_to_string(new.tags,' '),NFKC),chr(8203),''),chr(8204),''),chr(8205),''),chr(65279),'');
  if content ~* '\m(dating|romance|romantic|hook[[:space:]-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(ing)?)\M' then
    raise exception 'Professional wording required' using errcode='23514';
  end if;
  if content ~* '\m(send|transfer|wire)[[:space:]]+(me[[:space:]]+|us[[:space:]]+)?(money|cash|funds|crypto)\M|\mguaranteed[[:space:]]+(returns?|profits?)\M|\mdouble[[:space:]]+your[[:space:]]+money\M|\m(pay|send)[[:space:]]+(an?[[:space:]]+)?(upfront|advance)[[:space:]]+(fee|payment)\M' then
    raise exception 'Money request wording prohibited' using errcode='23514';
  end if;
  return new;
end; $$;
revoke all on function connectpk_private.validate_post_content() from public,anon,authenticated;
create trigger posts_validate_content before insert or update of title,body,tags on public.posts
for each row execute function connectpk_private.validate_post_content();
commit;
