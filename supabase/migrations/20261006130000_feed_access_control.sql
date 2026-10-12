begin;

create function connectpk_private.feed_approved() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join public.verification v on v.profile_id=p.id
    where p.id=auth.uid() and p.status='approved' and v.status='approved');
$$;
create function connectpk_private.feed_post_visible(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select connectpk_private.feed_approved() and exists(select 1 from public.posts p
    where p.id=target and p.status='active' and not connectpk_private.is_blocked(p.author_id));
$$;
create function connectpk_private.feed_offer_visible(target_post uuid,offerer uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select connectpk_private.feed_approved() and exists(select 1 from public.posts p
    where p.id=target_post and auth.uid() in (offerer,p.author_id)
      and not connectpk_private.is_blocked(case when auth.uid()=offerer then p.author_id else offerer end));
$$;
create function connectpk_private.feed_chat_visible(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select connectpk_private.feed_approved() and exists(select 1 from public.conversations c join public.offers o on o.id=c.offer_id
    where c.id=target and auth.uid() in (c.user_a,c.user_b) and o.status='accepted'
      and not connectpk_private.is_blocked(case when c.user_a=auth.uid() then c.user_b else c.user_a end));
$$;
revoke all on function connectpk_private.feed_approved(),connectpk_private.feed_post_visible(uuid),
  connectpk_private.feed_offer_visible(uuid,uuid),connectpk_private.feed_chat_visible(uuid) from public,anon,authenticated;
grant execute on function connectpk_private.feed_approved(),connectpk_private.feed_post_visible(uuid),
  connectpk_private.feed_offer_visible(uuid,uuid),connectpk_private.feed_chat_visible(uuid) to authenticated;

grant select,delete on public.posts,public.comments to authenticated;
grant insert(author_id,post_type,title,body,tags,city) on public.posts to authenticated;
grant update(post_type,title,body,tags,city,status) on public.posts to authenticated;
grant insert(post_id,author_id,body) on public.comments to authenticated;
grant update(body,status) on public.comments to authenticated;
create policy posts_read on public.posts for select to authenticated
using(author_id=auth.uid() or connectpk_private.feed_post_visible(id));
create policy posts_insert on public.posts for insert to authenticated
with check(author_id=auth.uid() and connectpk_private.feed_approved() and status='active');
create policy posts_update on public.posts for update to authenticated
using(author_id=auth.uid() and connectpk_private.feed_approved() and status='active')
with check(author_id=auth.uid() and status in ('active','removed'));
create policy posts_delete on public.posts for delete to authenticated using(author_id=auth.uid());
create policy comments_read on public.comments for select to authenticated
using(author_id=auth.uid() or (status='active' and connectpk_private.feed_post_visible(post_id) and not connectpk_private.is_blocked(author_id)));
create policy comments_insert on public.comments for insert to authenticated
with check(author_id=auth.uid() and status='active' and connectpk_private.feed_post_visible(post_id));
create policy comments_update on public.comments for update to authenticated
using(author_id=auth.uid() and status='active' and connectpk_private.feed_post_visible(post_id))
with check(author_id=auth.uid() and status in ('active','removed'));
create policy comments_delete on public.comments for delete to authenticated using(author_id=auth.uid());

grant select,delete on public.reactions to authenticated;
grant insert(post_id,user_id,type) on public.reactions to authenticated;
grant update(type) on public.reactions to authenticated;
create policy reactions_read on public.reactions for select to authenticated
using(connectpk_private.feed_post_visible(post_id) and not connectpk_private.is_blocked(user_id));
create policy reactions_insert on public.reactions for insert to authenticated
with check(user_id=auth.uid() and connectpk_private.feed_post_visible(post_id));
create policy reactions_update on public.reactions for update to authenticated
using(user_id=auth.uid() and connectpk_private.feed_post_visible(post_id)) with check(user_id=auth.uid());
create policy reactions_delete on public.reactions for delete to authenticated using(user_id=auth.uid());

grant select on public.offers to authenticated;
grant insert(post_id,offerer_id,offer_type,message) on public.offers to authenticated;
grant update(status) on public.offers to authenticated;
create policy offers_read on public.offers for select to authenticated using(connectpk_private.feed_offer_visible(post_id,offerer_id));
create policy offers_insert on public.offers for insert to authenticated
with check(offerer_id=auth.uid() and status='pending' and connectpk_private.feed_post_visible(post_id)
  and exists(select 1 from public.posts p where p.id=post_id and p.author_id<>auth.uid()));
create policy offers_update on public.offers for update to authenticated
using(connectpk_private.feed_offer_visible(post_id,offerer_id)) with check(connectpk_private.feed_offer_visible(post_id,offerer_id));

grant select on public.conversations,public.chat_messages to authenticated;
grant insert(conversation_id,sender_id,body) on public.chat_messages to authenticated;
create policy conversations_read on public.conversations for select to authenticated using(connectpk_private.feed_chat_visible(id));
create policy chat_messages_read on public.chat_messages for select to authenticated using(connectpk_private.feed_chat_visible(conversation_id));
create policy chat_messages_insert on public.chat_messages for insert to authenticated
with check(sender_id=auth.uid() and connectpk_private.feed_chat_visible(conversation_id));
-- Conversation creation is trigger-only. Notifications retain deny-by-default access.

-- An append-only ledger prevents deleting content from resetting daily quotas.
-- Reuse audit_log instead of adding a quota table; record no content or evidence.
insert into public.audit_log(actor_id,action,entity_type,entity_id,created_at)
select author_id,'feed.post.created','posts',id,created_at from public.posts p
where not exists(select 1 from public.audit_log a where a.action='feed.post.created' and a.entity_id=p.id);
insert into public.audit_log(actor_id,action,entity_type,entity_id,created_at)
select offerer_id,'feed.offer.created','offers',id,created_at from public.offers o
where not exists(select 1 from public.audit_log a where a.action='feed.offer.created' and a.entity_id=o.id);
create function connectpk_private.feed_daily_limit() returns trigger
language plpgsql security definer set search_path='' as $$
declare member_id uuid; event text; cap integer; day_start timestamptz;
begin
  if tg_table_name='posts' then member_id:=new.author_id; else member_id:=new.offerer_id; end if;
  event:=case when tg_table_name='posts' then 'feed.post.created' else 'feed.offer.created' end;
  cap:=case when tg_table_name='posts' then 3 else 20 end;
  -- A real row write serializes concurrent inserts, including stricter isolation levels.
  update public.profiles set updated_at=updated_at where id=member_id;
  new.created_at:=clock_timestamp();
  day_start:=date_trunc('day',new.created_at at time zone 'Asia/Karachi') at time zone 'Asia/Karachi';
  if (select count(*) from public.audit_log where actor_id=member_id and action=event
      and created_at>=day_start and created_at<day_start+interval '24 hours') >= cap then
    raise exception 'Daily limit reached' using errcode='P0001';
  end if;
  return new;
end; $$;
create function connectpk_private.feed_record_creation() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_table_name='posts' then
    insert into public.audit_log(actor_id,action,entity_type,entity_id,created_at)
    values(new.author_id,'feed.post.created','posts',new.id,new.created_at);
  else
    insert into public.audit_log(actor_id,action,entity_type,entity_id,created_at)
    values(new.offerer_id,'feed.offer.created','offers',new.id,new.created_at);
  end if;
  return new;
end; $$;
create trigger posts_daily_limit before insert on public.posts for each row execute function connectpk_private.feed_daily_limit();
create trigger offers_daily_limit before insert on public.offers for each row execute function connectpk_private.feed_daily_limit();
create trigger posts_record_creation after insert on public.posts for each row execute function connectpk_private.feed_record_creation();
create trigger offers_record_creation after insert on public.offers for each row execute function connectpk_private.feed_record_creation();

-- Soft deletion preserves reports and accepted-offer conversation context.
-- Direct DELETE returns zero deleted rows; clients should refresh the content.
create function connectpk_private.feed_soft_delete() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is not null then
    if old.author_id<>auth.uid() then raise exception 'Not the author' using errcode='42501'; end if;
    if tg_table_name='posts' then update public.posts set status='removed' where id=old.id;
    else update public.comments set status='removed' where id=old.id; end if;
    return null;
  end if;
  return old;
end; $$;
create trigger posts_soft_delete before delete on public.posts for each row execute function connectpk_private.feed_soft_delete();
create trigger comments_soft_delete before delete on public.comments for each row execute function connectpk_private.feed_soft_delete();

create function connectpk_private.feed_offer_transition() returns trigger
language plpgsql security definer set search_path='' as $$
declare owner_id uuid;
begin
  if new.status=old.status then return new; end if;
  select author_id into owner_id from public.posts where id=old.post_id for share;
  if not connectpk_private.feed_post_visible(old.post_id) or not connectpk_private.feed_offer_visible(old.post_id,old.offerer_id)
     or old.status<>'pending' or not (
       (auth.uid()=owner_id and new.status in ('accepted','declined'))
       or (auth.uid()=old.offerer_id and new.status='withdrawn')) then
    raise exception 'Invalid offer transition' using errcode='42501';
  end if;
  return new;
end; $$;
create trigger offers_transition before update of status on public.offers for each row execute function connectpk_private.feed_offer_transition();
create function connectpk_private.feed_validate_conversation() returns trigger
language plpgsql security definer set search_path='' as $$
declare offer public.offers; owner_id uuid;
begin
  select * into offer from public.offers where id=new.offer_id for share;
  select author_id into owner_id from public.posts where id=offer.post_id for share;
  if offer.status is distinct from 'accepted' or new.user_a is distinct from owner_id or new.user_b is distinct from offer.offerer_id then
    raise exception 'Conversation requires the accepted offer participants' using errcode='42501';
  end if;
  return new;
end; $$;
create trigger conversations_validate before insert or update on public.conversations for each row execute function connectpk_private.feed_validate_conversation();
create function connectpk_private.feed_open_conversation() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.status='accepted' and old.status<>'accepted' then
    insert into public.conversations(offer_id,user_a,user_b)
    select new.id,author_id,new.offerer_id from public.posts where id=new.post_id;
  end if;
  return new;
end; $$;
create trigger offers_open_conversation after update of status on public.offers for each row execute function connectpk_private.feed_open_conversation();
revoke all on function connectpk_private.feed_daily_limit(),connectpk_private.feed_record_creation(),
  connectpk_private.feed_soft_delete(),connectpk_private.feed_offer_transition(),
  connectpk_private.feed_validate_conversation(),connectpk_private.feed_open_conversation() from public,anon,authenticated;

commit;
