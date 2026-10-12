begin;
alter table public.profiles add column banned_at timestamptz;
alter table public.verification add column review_note text;
alter table public.reports add column resolution_note text, add column moderation_action text;
alter table public.posts add column review_version integer not null default 0;
create function connectpk_private.bump_post_review_version() returns trigger language plpgsql set search_path='' as $$begin
 new.review_version:=old.review_version+1;return new;
end;$$;
create trigger posts_review_version before update of status,moderation_hold on public.posts for each row execute function connectpk_private.bump_post_review_version();
revoke all on function connectpk_private.bump_post_review_version() from public,anon,authenticated;
alter table public.offers add column moderation_removed boolean not null default false;

create function connectpk_private.admin_allowed() returns boolean
language sql stable security definer set search_path='' as $$
 select connectpk_private.is_staff() and coalesce(auth.jwt()->>'aal'='aal2',false);
$$;
create function connectpk_private.require_admin() returns void
language plpgsql security definer set search_path='' as $$begin
 if not connectpk_private.admin_allowed() then raise exception 'Staff MFA required' using errcode='42501'; end if;
end;$$;
revoke all on function connectpk_private.admin_allowed(),connectpk_private.require_admin() from public,anon;
grant execute on function connectpk_private.admin_allowed() to authenticated;
revoke all on function connectpk_private.require_admin() from authenticated;
-- Staff-only reads require MFA even outside the portal.
alter policy notifications_own on public.notifications using(user_id=auth.uid() and (type='moderation_warning' or actor_id is null or not connectpk_private.is_blocked(actor_id)));
alter policy reports_staff_read on public.reports using(connectpk_private.admin_allowed());
alter policy verification_staff_read on public.verification using(connectpk_private.admin_allowed());
alter policy verification_objects_staff_read on storage.objects using(bucket_id='verification' and connectpk_private.admin_allowed());
alter policy verification_objects_guard on storage.objects using(bucket_id<>'verification' or connectpk_private.admin_allowed());

create or replace function connectpk_private.feed_offer_visible(target_post uuid,offerer uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select connectpk_private.feed_approved() and exists(select 1 from public.posts p
 where p.id=target_post and auth.uid() in (offerer,p.author_id)
 and not connectpk_private.is_blocked(case when auth.uid()=offerer then p.author_id else offerer end))
 and not exists(select 1 from public.offers o where o.post_id=target_post and o.offerer_id=offerer and o.moderation_removed);
$$;

create function public.admin_dashboard() returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; today date:=(now() at time zone 'Asia/Karachi')::date;
begin
 perform connectpk_private.require_admin();
 select jsonb_build_object('members',(select count(*) from public.profiles),
 'offers',(select count(*) from public.offers),'accepted_offers',(select count(*) from public.offers where status='accepted'),
 'reports',(select count(*) from public.reports),'scam_reports',(select count(*) from public.reports where category='scam_fraud'),
 'pending_verifications',(select count(*) from public.verification where status='pending'),
 'open_reports',(select count(*) from public.reports where status in ('open','under_review')),
 'hidden_posts',(select count(*) from public.posts where status='hidden'),
 'posts_per_day',(select jsonb_agg(jsonb_build_object('day',d::date,'count',(select count(*) from public.posts where (created_at at time zone 'Asia/Karachi')::date=d::date)) order by d)
 from generate_series(today-13,today,interval '1 day') d)) into result;
 return result;
end;$$;

create function public.admin_queue(queue text,page_number integer default 0) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 perform connectpk_private.require_admin();
 if page_number is null or page_number<0 or page_number>100000 then raise exception 'Invalid page'; end if;
 if queue='verification' then
  select coalesce(jsonb_agg(row_to_json(q)),'[]') into result from (
   select v.profile_id as id,p.full_name,p.city,p.status as member_status,v.updated_at,v.submission_id,v.linkedin_url,v.portfolio_url,
   v.selfie_path is not null as selfie,v.work_proof_path is not null as work,v.university_proof_path is not null as university,v.evidence_path is not null as legacy,
   p.banned_at is not null as banned from public.verification v join public.profiles p on p.id=v.profile_id
   where v.status='pending' order by v.created_at,v.profile_id limit 21 offset page_number*20
  )q;
 elsif queue='reports' then
  select coalesce(jsonb_agg(row_to_json(q)),'[]') into result from (
   select r.id,r.reported_id,p.full_name,r.category,r.reason,r.severity,r.status,r.created_at,r.updated_at,
   coalesce(r.target_kind,case when r.chat_message_id is not null then 'message' when r.offer_id is not null then 'offer' when r.comment_id is not null then 'comment' when r.post_id is not null then 'post' else 'profile' end) as kind,
   coalesce(r.evidence_snapshot,
    case when r.chat_message_id is not null then (select jsonb_build_object('body',body) from public.chat_messages where id=r.chat_message_id)
    when r.message_id is not null then (select jsonb_build_object('body',body) from public.messages where id=r.message_id)
    when r.conversation_id is not null and r.chat_message_id is null then jsonb_build_object('conversation_messages',(select jsonb_agg(body) from (select body from public.chat_messages where conversation_id=r.conversation_id order by created_at desc limit 10) recent))
    when r.offer_id is not null then (select jsonb_build_object('message',message) from public.offers where id=r.offer_id)
    when r.comment_id is not null then (select jsonb_build_object('body',body) from public.comments where id=r.comment_id)
    when r.post_id is not null then (select jsonb_build_object('title',title,'body',body) from public.posts where id=r.post_id)
    else jsonb_build_object('full_name',p.full_name,'headline',p.headline,'bio',p.bio) end) as content
   from public.reports r left join public.profiles p on p.id=r.reported_id
   where r.status in ('open','under_review') order by r.severity desc,r.created_at,r.id limit 21 offset page_number*20
  )q;
 elsif queue='hidden' then
  select coalesce(jsonb_agg(row_to_json(q)),'[]') into result from (
   select p.id,p.title,p.body,p.author_id,a.full_name,p.created_at,p.moderation_hold,p.review_version,
   (select count(distinct reporter_id) from public.reports r where r.post_id=p.id and r.comment_id is null and r.offer_id is null and r.chat_message_id is null and r.status in ('open','under_review')) as report_count
   from public.posts p join public.profiles a on a.id=p.author_id where p.status='hidden'
   order by p.created_at,p.id limit 21 offset page_number*20
  )q;
 else raise exception 'Invalid queue'; end if;
 insert into public.audit_log(actor_id,action,entity_type,metadata) values(auth.uid(),'admin.queue.viewed',queue,jsonb_build_object('page',page_number));
 return result;
end;$$;

create function public.admin_evidence(target uuid,kind text) returns text
language plpgsql security definer set search_path='' as $$declare object_path text;begin
 perform connectpk_private.require_admin();
 select case kind when 'selfie' then selfie_path when 'work' then work_proof_path when 'university' then university_proof_path when 'legacy' then evidence_path end
 into object_path from public.verification where profile_id=target;
 if object_path is null then raise exception 'Evidence unavailable' using errcode='22023'; end if;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'admin.evidence.viewed','verification',target,jsonb_build_object('kind',kind));
 return object_path;
end;$$;

create function public.admin_review_verification(target uuid,expected_updated timestamptz,decision text,note text) returns void
language plpgsql security definer set search_path='' as $$declare v public.verification; p public.profiles;begin
 perform connectpk_private.require_admin();
 if decision is null or decision not in ('approve','reject') or note is null or note !~ '[^[:space:]]' or char_length(note)>2000 then raise exception 'Invalid decision' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('admin-moderation',0));
 select * into p from public.profiles where id=target for update;
 select * into v from public.verification where profile_id=target for update;
 if not found or v.status<>'pending' or v.updated_at is distinct from expected_updated then raise exception 'Queue changed. Refresh.' using errcode='40001'; end if;
 if target=auth.uid() or p.role<>'member' or p.status not in ('pending','approved') or p.banned_at is not null then raise exception 'Member cannot be reviewed' using errcode='42501'; end if;
 if decision='approve' and (v.selfie_path is null or not exists(select 1 from storage.objects where bucket_id='verification' and name=v.selfie_path)) then raise exception 'Selfie unavailable' using errcode='22023'; end if;
 update public.verification set status=case when decision='approve' then 'approved'::public.verification_status else 'rejected'::public.verification_status end,review_note=btrim(note),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where profile_id=target;
 update public.profiles set status=case when decision='approve' then 'approved'::public.profile_status else 'pending'::public.profile_status end where id=target;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'admin.verification.'||decision,'verification',target,jsonb_build_object('note',btrim(note),'submission_id',v.submission_id));
end;$$;

create function public.admin_review_report(target uuid,expected_updated timestamptz,decision text,note text) returns void
language plpgsql security definer set search_path='' as $$declare r public.reports; subject public.profiles; actor_role public.member_role;begin
 perform connectpk_private.require_admin();
 if decision is null or decision not in ('dismiss','remove','warn','suspend','ban') or note is null or note !~ '[^[:space:]]' or char_length(note)>2000 then raise exception 'Invalid decision' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('admin-moderation',0));
 select * into r from public.reports where id=target for update;
 if not found or r.status not in ('open','under_review') or r.updated_at is distinct from expected_updated then raise exception 'Queue changed. Refresh.' using errcode='40001'; end if;
 select * into subject from public.profiles where id=r.reported_id for update;
 select role into actor_role from public.profiles where id=auth.uid();
 if decision<>'dismiss' and (subject.id is null or subject.id=auth.uid() or subject.role='admin' or (subject.role='moderator' and actor_role<>'admin')) then raise exception 'Not permitted for this member' using errcode='42501'; end if;
 if r.evidence_snapshot is null then
  select case when r.chat_message_id is not null then (select jsonb_build_object('body',body) from public.chat_messages where id=r.chat_message_id)
   when r.message_id is not null then (select jsonb_build_object('body',body) from public.messages where id=r.message_id)
   when r.offer_id is not null then (select jsonb_build_object('message',message) from public.offers where id=r.offer_id)
   when r.comment_id is not null then (select jsonb_build_object('body',body) from public.comments where id=r.comment_id)
   when r.post_id is not null then (select jsonb_build_object('title',title,'body',body) from public.posts where id=r.post_id)
   else jsonb_build_object('full_name',subject.full_name,'headline',subject.headline,'bio',subject.bio) end into r.evidence_snapshot;
  update public.reports set evidence_snapshot=r.evidence_snapshot where id=target;
 end if;
 if decision='remove' then
  if r.chat_message_id is not null then
   update public.chat_messages set body='[Message removed by a moderator]' where id=r.chat_message_id;
  elsif r.message_id is not null then update public.messages set body='[Message removed by a moderator]' where id=r.message_id;
  elsif r.offer_id is not null then
   update public.offers set moderation_removed=true where id=r.offer_id;
   update public.conversations set closed_at=coalesce(closed_at,now()),closed_by=coalesce(closed_by,user_a) where offer_id=r.offer_id;
  elsif r.comment_id is not null then update public.comments set status='removed' where id=r.comment_id;
  elsif r.post_id is not null then update public.posts set status='removed',moderation_hold=false where id=r.post_id;
  elsif r.target_kind='profile' then update public.profiles set status='suspended' where id=r.reported_id;
  else raise exception 'This legacy target cannot be removed. Use a member action.' using errcode='22023'; end if;
 elsif decision in ('suspend','ban') then
  update public.profiles set status='suspended',banned_at=case when decision='ban' then coalesce(banned_at,now()) else banned_at end where id=r.reported_id;
 elsif decision='warn' then
  insert into public.notifications(user_id,actor_id,type,data) values(r.reported_id,auth.uid(),'moderation_warning',jsonb_build_object('message',btrim(note)));
 end if;
 update public.reports set status=case when decision='dismiss' then 'dismissed'::public.report_status else 'resolved'::public.report_status end,
 reviewed_by=auth.uid(),resolved_at=now(),resolution_note=btrim(note),moderation_action=decision,updated_at=now() where id=target;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'admin.report.'||decision,'reports',target,jsonb_build_object('note',btrim(note),'member_id',r.reported_id,'prior_status',subject.status));
end;$$;

create function public.admin_review_hidden(target uuid,expected_version integer,decision text,note text) returns void
language plpgsql security definer set search_path='' as $$declare p public.posts;begin
 perform connectpk_private.require_admin();
 if decision is null or decision not in ('restore','remove') or note is null or note !~ '[^[:space:]]' or char_length(note)>2000 then raise exception 'Invalid decision' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('admin-moderation',0));
 select * into p from public.posts where id=target for update;
 if not found or p.status<>'hidden' or p.review_version is distinct from expected_version then raise exception 'Queue changed. Refresh.' using errcode='40001'; end if;
 if p.author_id=auth.uid() or exists(select 1 from public.profiles where id=p.author_id and (role='admin' or (role='moderator' and not exists(select 1 from public.profiles where id=auth.uid() and role='admin')))) then raise exception 'Another staff member must review' using errcode='42501'; end if;
 update public.posts set status=case when decision='restore' then 'active'::public.feed_content_status else 'removed'::public.feed_content_status end,moderation_hold=false where id=target;
 update public.reports set status=case when decision='restore' then 'dismissed'::public.report_status else 'resolved'::public.report_status end,
 reviewed_by=auth.uid(),resolved_at=now(),resolution_note=btrim(note),moderation_action=decision,updated_at=now()
 where post_id=target and comment_id is null and offer_id is null and chat_message_id is null and status in ('open','under_review');
 insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),'admin.hidden.'||decision,'posts',target,jsonb_build_object('note',btrim(note)));
end;$$;
revoke all on function public.admin_dashboard(),public.admin_queue(text,integer),public.admin_evidence(uuid,text),public.admin_review_verification(uuid,timestamptz,text,text),public.admin_review_report(uuid,timestamptz,text,text),public.admin_review_hidden(uuid,integer,text,text) from public,anon;
grant execute on function public.admin_dashboard(),public.admin_queue(text,integer),public.admin_evidence(uuid,text),public.admin_review_verification(uuid,timestamptz,text,text),public.admin_review_report(uuid,timestamptz,text,text),public.admin_review_hidden(uuid,integer,text,text) to authenticated;
commit;
