begin;
alter table public.conversations add column closed_at timestamptz, add column closed_by uuid references public.profiles(id);
alter table public.conversations add constraint conversations_closed_state check (
 (closed_at is null and closed_by is null) or (closed_at is not null and closed_by is not null and closed_by in (user_a,user_b)));
alter table public.chat_messages add column request_key text;
create unique index chat_messages_request_idx on public.chat_messages(sender_id,request_key) where request_key is not null;
alter table public.reports add column conversation_id uuid references public.conversations(id) on delete set null;
create index reports_conversation_idx on public.reports(conversation_id) where conversation_id is not null;

create or replace function connectpk_private.feed_chat_visible(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select connectpk_private.feed_approved() and exists(select 1 from public.conversations c join public.offers o on o.id=c.offer_id
 where c.id=target and c.closed_at is null and auth.uid() in (c.user_a,c.user_b) and o.status='accepted'
 and not connectpk_private.is_blocked(case when c.user_a=auth.uid() then c.user_b else c.user_a end));
$$;
-- Serialize sending with leaving, and make retries idempotent.
revoke insert on public.chat_messages from authenticated;
revoke insert(conversation_id,sender_id,body) on public.chat_messages from authenticated;
create function public.send_chat_message(target uuid, content text, nonce text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform 1 from public.conversations where id=target for update;
 if not connectpk_private.feed_chat_visible(target) then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 if content is null or char_length(btrim(content)) not between 1 and 4000 or nonce is null or char_length(nonce) not between 1 and 100 then
 raise exception 'Invalid message' using errcode='22023'; end if;
 select id into result from public.chat_messages where sender_id=auth.uid() and request_key=nonce and conversation_id=target;
 if result is not null then return result; end if;
 insert into public.chat_messages(conversation_id,sender_id,body,request_key) values(target,auth.uid(),btrim(content),nonce) returning id into result;
 return result;
end; $$;
create function public.leave_chat(target uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.conversations where id=target and auth.uid() in (user_a,user_b) for update;
 if not found then raise exception 'Conversation unavailable' using errcode='42501'; end if;
 update public.conversations set closed_at=now(),closed_by=auth.uid() where id=target and closed_at is null;
end; $$;
create function public.report_chat(target uuid, explanation text) returns void
language plpgsql security definer set search_path='' as $$
declare other_id uuid;
begin
 if not connectpk_private.feed_chat_visible(target) or explanation is null or char_length(btrim(explanation)) not between 1 and 2000 then
 raise exception 'Invalid report' using errcode='42501'; end if;
 select case when user_a=auth.uid() then user_b else user_a end into other_id from public.conversations where id=target;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||target::text,0));
 if not exists(select 1 from public.reports where reporter_id=auth.uid() and conversation_id=target and status='open') then
 insert into public.reports(reporter_id,reported_id,conversation_id,reason) values(auth.uid(),other_id,target,btrim(explanation));
 end if;
end; $$;
create function public.chat_inbox(target uuid default null, before_time timestamptz default null,before_id uuid default null)
returns table(id uuid,other_id uuid,other_name text,post_title text,last_message text,activity_at timestamptz)
language sql stable security definer set search_path='' as $$
 select c.id,p.id,p.full_name,post.title,last.body,coalesce(last.created_at,c.created_at)
 from public.conversations c join public.offers o on o.id=c.offer_id join public.posts post on post.id=o.post_id
 join public.profiles p on p.id=case when c.user_a=auth.uid() then c.user_b else c.user_a end
 left join lateral(select body,created_at from public.chat_messages where conversation_id=c.id order by created_at desc,id desc limit 1) last on true
 where connectpk_private.feed_chat_visible(c.id) and (target is null or c.id=target)
 and (before_time is null or (coalesce(last.created_at,c.created_at),c.id)<(before_time,before_id))
 order by coalesce(last.created_at,c.created_at) desc,c.id desc limit 20;
$$;
revoke all on function public.send_chat_message(uuid,text,text),public.leave_chat(uuid),public.report_chat(uuid,text),public.chat_inbox(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.send_chat_message(uuid,text,text),public.leave_chat(uuid),public.report_chat(uuid,text),public.chat_inbox(uuid,timestamptz,uuid) to authenticated;
-- Realtime still checks the existing participant-only SELECT policies.
do $$begin
 if not exists(select 1 from pg_publication where pubname='supabase_realtime') then create publication supabase_realtime; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
 alter publication supabase_realtime add table public.chat_messages; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='conversations') then
 alter publication supabase_realtime add table public.conversations; end if;
end; $$;
commit;
