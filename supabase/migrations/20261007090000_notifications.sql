begin;
alter table public.notifications add column actor_id uuid references public.profiles(id) on delete set null;
update public.notifications n set actor_id=p.author_id from public.posts p where n.type in ('offer_accepted','offer_declined') and n.data->>'post_id'=p.id::text;
drop policy offer_notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated
using(user_id=auth.uid() and (actor_id is null or not connectpk_private.is_blocked(actor_id)));
create function public.mark_notifications_read(target uuid default null) returns void
language sql security definer set search_path='' as $$
 update public.notifications set read_at=greatest(now(),created_at) where user_id=auth.uid() and read_at is null and (target is null or id=target);
$$;
revoke all on function public.mark_notifications_read(uuid) from public,anon;
grant execute on function public.mark_notifications_read(uuid) to authenticated;

create function connectpk_private.notification_actor() returns trigger
language plpgsql set search_path='' as $$begin
 if new.actor_id is null then new.actor_id:=auth.uid(); end if; return new;
end;$$;
create trigger notifications_actor before insert on public.notifications for each row execute function connectpk_private.notification_actor();
create function connectpk_private.notify_member_event() returns trigger
language plpgsql security definer set search_path='' as $$
declare recipient uuid; actor uuid; event_type text; context jsonb;
begin
 if tg_table_name='comments' then
  select author_id into recipient from public.posts where id=new.post_id and status='active'; actor:=new.author_id;event_type:='new_comment';context:=jsonb_build_object('post_id',new.post_id,'comment_id',new.id);
 elsif tg_table_name='offers' then
  select author_id into recipient from public.posts where id=new.post_id and status='active'; actor:=new.offerer_id;event_type:='new_offer';context:=jsonb_build_object('post_id',new.post_id,'offer_id',new.id);
 else
  select case when user_a=new.sender_id then user_b else user_a end into recipient from public.conversations where id=new.conversation_id and closed_at is null;
  actor:=new.sender_id;event_type:='new_message';context:=jsonb_build_object('conversation_id',new.conversation_id,'chat_message_id',new.id);
 end if;
 if recipient is not null and recipient<>actor and not exists(select 1 from public.blocks where (blocker_id=recipient and blocked_id=actor) or (blocker_id=actor and blocked_id=recipient)) then
  insert into public.notifications(user_id,actor_id,type,data) values(recipient,actor,event_type,context);
 end if;return new;
end;$$;
create trigger comments_notify after insert on public.comments for each row execute function connectpk_private.notify_member_event();
create trigger offers_notify_new after insert on public.offers for each row execute function connectpk_private.notify_member_event();
create trigger chat_messages_notify after insert on public.chat_messages for each row execute function connectpk_private.notify_member_event();
revoke all on function connectpk_private.notification_actor(),connectpk_private.notify_member_event() from public,anon,authenticated;

create table connectpk_private.push_devices (
 token text primary key check(token ~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$' and char_length(token)<=256),
 user_id uuid not null references public.profiles(id) on delete cascade,
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create index push_devices_user_idx on connectpk_private.push_devices(user_id) where enabled;
create table connectpk_private.push_jobs (
 id uuid primary key default gen_random_uuid(), notification_id uuid not null references public.notifications(id) on delete cascade,
 token text not null references connectpk_private.push_devices(token) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','working','ticket','delivered','dead','skipped')),
 attempts integer not null default 0, receipt_checks integer not null default 0,
 ticket_id text, error_code text, next_attempt_at timestamptz not null default now(), lease_until timestamptz, lease uuid,
 unique(notification_id,token)
);
create index push_jobs_due_idx on connectpk_private.push_jobs(next_attempt_at) where status in ('pending','ticket','working');
alter table connectpk_private.push_devices enable row level security;
alter table connectpk_private.push_jobs enable row level security;
revoke all on connectpk_private.push_devices,connectpk_private.push_jobs from public,anon,authenticated;
create function public.set_device_push(device_token text, enable_push boolean) returns void
language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or enable_push is null or device_token is null then raise exception 'Invalid registration' using errcode='42501'; end if;
 if enable_push then
  if not connectpk_private.feed_approved() then raise exception 'Approval required' using errcode='42501'; end if;
  insert into connectpk_private.push_devices(token,user_id,enabled) values(device_token,auth.uid(),true)
  on conflict(token) do update set user_id=excluded.user_id,enabled=true,updated_at=now();
 else
  update connectpk_private.push_devices set enabled=false,updated_at=now() where token=device_token and user_id=auth.uid();
 end if;
 update connectpk_private.push_jobs set status='skipped' where token=device_token and status in ('pending','working','ticket')
 and ((not enable_push and user_id=auth.uid()) or (enable_push and user_id<>auth.uid()));
end;$$;
create function public.my_device_push(device_token text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from connectpk_private.push_devices where token=device_token and user_id=auth.uid() and enabled);
$$;
revoke all on function public.set_device_push(text,boolean),public.my_device_push(text) from public,anon;
grant execute on function public.set_device_push(text,boolean),public.my_device_push(text) to authenticated;
create function connectpk_private.enqueue_push() returns trigger
language plpgsql security definer set search_path='' as $$begin
 if new.type in ('new_comment','new_offer','offer_accepted','offer_declined','new_message') then
  insert into connectpk_private.push_jobs(notification_id,token,user_id)
  select new.id,token,new.user_id from connectpk_private.push_devices where user_id=new.user_id and enabled;
 end if;return new;
end;$$;
revoke all on function connectpk_private.enqueue_push() from public,anon,authenticated;
create trigger notifications_enqueue after insert on public.notifications for each row execute function connectpk_private.enqueue_push();

-- Only the scheduled service-role worker can lease and complete jobs.
create function public.claim_push_jobs()
returns table(job_id uuid,job_lease uuid,device_token text,notification_id uuid,event_type text,ticket_id text)
language plpgsql security definer set search_path='' as $$begin
 update connectpk_private.push_jobs j set status='skipped'
 where j.status in ('pending','working','ticket') and not exists(
  select 1 from connectpk_private.push_devices d join public.notifications n on n.id=j.notification_id
  join public.profiles p on p.id=j.user_id join public.verification v on v.profile_id=p.id
  where d.token=j.token and d.user_id=j.user_id and d.enabled and n.read_at is null and p.status='approved' and v.status='approved'
  and not exists(select 1 from public.blocks b where (b.blocker_id=j.user_id and b.blocked_id=n.actor_id) or (b.blocker_id=n.actor_id and b.blocked_id=j.user_id)));
 update connectpk_private.push_jobs j set status='dead',error_code='RetryLimit'
 where (j.status in ('pending','ticket') or (j.status='working' and j.lease_until<now()))
 and ((j.ticket_id is null and j.attempts>=5) or (j.ticket_id is not null and j.receipt_checks>=8));
 return query with candidates as (
  select j.id from connectpk_private.push_jobs j where j.next_attempt_at<=now()
   and (j.status in ('pending','ticket') or (j.status='working' and j.lease_until<now()))
  order by j.next_attempt_at limit 25 for update skip locked
 ), claimed as (
  update connectpk_private.push_jobs j set status='working',lease=gen_random_uuid(),lease_until=now()+interval '5 minutes',
   attempts=j.attempts+case when j.ticket_id is null then 1 else 0 end,
   receipt_checks=j.receipt_checks+case when j.ticket_id is null then 0 else 1 end
  from candidates c where j.id=c.id returning j.*
 ) select c.id,c.lease,c.token,c.notification_id,n.type,c.ticket_id from claimed c join public.notifications n on n.id=c.notification_id;
end;$$;
create function public.finish_push_job(target uuid, expected_lease uuid, outcome text, expo_ticket text default null, failure text default null) returns void
language plpgsql security definer set search_path='' as $$
declare job connectpk_private.push_jobs;
begin
 select * into job from connectpk_private.push_jobs where id=target and lease=expected_lease and status='working' for update;
 if not found then return; end if;
 if outcome not in ('pending','ticket','delivered','dead','skipped') then raise exception 'Invalid outcome'; end if;
 if (outcome='pending' and job.attempts>=5) or (outcome='ticket' and job.ticket_id is not null and job.receipt_checks>=8) then outcome:='dead'; end if;
 update connectpk_private.push_jobs set status=outcome,ticket_id=coalesce(expo_ticket,ticket_id),error_code=left(failure,100),lease_until=null,
  next_attempt_at=now()+case when outcome='ticket' then interval '15 minutes' else make_interval(secs=>least(3600,30*power(2,least(job.attempts,7)))::integer) end where id=target;
 if failure='DeviceNotRegistered' then update connectpk_private.push_devices set enabled=false where token=job.token and user_id=job.user_id; end if;
end;$$;
revoke all on function public.claim_push_jobs(),public.finish_push_job(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.claim_push_jobs(),public.finish_push_job(uuid,uuid,text,text,text) to service_role;
do $$begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
 alter publication supabase_realtime add table public.notifications; end if;
end;$$;
commit;
