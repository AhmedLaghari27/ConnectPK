begin;
alter table public.reports
 add column category text check(category in ('romantic_sexual','harassment','scam_fraud','pyramid_scheme','repeated_selling','lead_harvesting','discrimination','private_information')),
 add column target_kind text check(target_kind in ('post','comment','offer','message','profile')),
 add column target_id uuid,
 add column evidence_snapshot jsonb;
create unique index reports_member_target_idx on public.reports(reporter_id,target_kind,target_id) where target_kind is not null;
create index reports_post_review_idx on public.reports(post_id,reporter_id) where comment_id is null and offer_id is null and chat_message_id is null and status in ('open','under_review');
alter table public.posts add column moderation_hold boolean not null default false;

-- All reports are server-created; severity and evidence cannot be chosen by members.
create function public.submit_report(kind text,target uuid,category_key text,description text) returns void
language plpgsql security definer set search_path='' as $$
declare subject uuid; post_ref uuid; comment_ref uuid; offer_ref uuid; message_ref uuid; conversation_ref uuid; evidence jsonb;
begin
 if not connectpk_private.feed_approved() or target is null then raise exception 'Unavailable' using errcode='42501'; end if;
 if category_key is null or category_key not in ('romantic_sexual','harassment','scam_fraud','pyramid_scheme','repeated_selling','lead_harvesting','discrimination','private_information')
 or description is null or description !~ '[^[:space:]]' or char_length(btrim(description)) not between 1 and 2000 then raise exception 'Invalid report' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||coalesce(kind,'')||target::text,0));
 -- Retrying a successful report does not create another report, even after hiding.
 if exists(select 1 from public.reports where reporter_id=auth.uid() and target_kind=kind and target_id=target) then
  if category_key='scam_fraud' then
   update public.reports set category='scam_fraud',severity='high',reason=btrim(description)
   where reporter_id=auth.uid() and target_kind=kind and target_id=target and status in ('open','under_review') and severity in ('low','medium');
  end if;
  return;
 end if;
 case kind
 when 'post' then
  select id into post_ref from public.posts where id=target for update;
  if connectpk_private.feed_post_visible(target) then
   select author_id,jsonb_build_object('title',title,'body',body,'tags',tags) into subject,evidence from public.posts where id=target;
  end if;
 when 'comment' then
  select author_id,post_id,id,jsonb_build_object('body',body) into subject,post_ref,comment_ref,evidence from public.comments
  where id=target and status='active' and connectpk_private.feed_post_visible(post_id) and not connectpk_private.is_blocked(author_id);
 when 'offer' then
  select offerer_id,post_id,id,jsonb_build_object('message',message,'offer_type',offer_type) into subject,post_ref,offer_ref,evidence from public.offers
  where id=target and connectpk_private.feed_offer_visible(post_id,offerer_id);
 when 'message' then
  select sender_id,conversation_id,id,jsonb_build_object('body',body) into subject,conversation_ref,message_ref,evidence from public.chat_messages
  where id=target and connectpk_private.feed_chat_visible(conversation_id);
 when 'profile' then
  select p.id,jsonb_build_object('full_name',p.full_name,'headline',p.headline,'bio',p.bio,'vision',d.data->>'vision','organization',d.data->>'organization')
  into subject,evidence from public.profiles p left join public.profile_setup d on d.user_id=p.id
  where p.id=target and connectpk_private.member_profile_visible(p.id);
 else raise exception 'Invalid target' using errcode='22023';
 end case;
 if subject is null or subject=auth.uid() then raise exception 'Unavailable' using errcode='42501'; end if;
 insert into public.reports(reporter_id,reported_id,post_id,comment_id,offer_id,chat_message_id,conversation_id,reason,category,target_kind,target_id,evidence_snapshot,severity)
 values(auth.uid(),subject,post_ref,comment_ref,offer_ref,message_ref,conversation_ref,btrim(description),category_key,kind,target,evidence,
 case when category_key='scam_fraud' then 'high'::public.report_severity else 'medium'::public.report_severity end);
end;$$;
revoke all on function public.submit_report(text,uuid,text,text) from public,anon;
grant execute on function public.submit_report(text,uuid,text,text) to authenticated;
-- Older free-text endpoints cannot bypass category validation.
revoke execute on function public.report_feed_content(uuid,text,uuid),public.report_chat(uuid,text) from authenticated;

create function connectpk_private.report_post_threshold() returns trigger
language plpgsql security definer set search_path='' as $$begin
 if new.post_id is not null and new.comment_id is null and new.offer_id is null and new.chat_message_id is null then
  perform 1 from public.posts where id=new.post_id for update;
  if (select count(distinct reporter_id) from public.reports where post_id=new.post_id and comment_id is null and offer_id is null and chat_message_id is null and status in ('open','under_review'))>=3 then
   update public.posts set status='hidden',moderation_hold=true where id=new.post_id and status='active';
   if found then insert into public.audit_log(actor_id,action,entity_type,entity_id) values(null,'moderation.post.auto_hidden','posts',new.post_id); end if;
  end if;
 end if;return new;
end;$$;
create trigger reports_hide_post after insert on public.reports for each row execute function connectpk_private.report_post_threshold();
revoke all on function connectpk_private.report_post_threshold() from public,anon,authenticated;

-- A member cannot restore a held post, including through a later permissive policy.
create function connectpk_private.guard_moderation_hold() returns trigger
language plpgsql set search_path='' as $$begin
 if auth.uid() is not null and not connectpk_private.is_staff() and old.moderation_hold
 and (not new.moderation_hold or new.status='active') then raise exception 'Moderator review required' using errcode='42501'; end if;
 return new;
end;$$;
create trigger posts_moderation_guard before update on public.posts for each row execute function connectpk_private.guard_moderation_hold();
revoke all on function connectpk_private.guard_moderation_hold() from public,anon,authenticated;

-- The former own-comment exception could expose a blocked post's identifier.
create function connectpk_private.comment_parent_unblocked(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.posts where id=target and not connectpk_private.is_blocked(author_id));
$$;
revoke all on function connectpk_private.comment_parent_unblocked(uuid) from public,anon;
grant execute on function connectpk_private.comment_parent_unblocked(uuid) to authenticated;
create policy comments_block_guard on public.comments as restrictive for select to authenticated
using(not connectpk_private.is_blocked(author_id) and connectpk_private.comment_parent_unblocked(post_id));
commit;
