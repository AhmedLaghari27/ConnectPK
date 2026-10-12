-- Read-only structural audit. Run in Supabase SQL Editor; no data is changed.
-- Existence is not a full comparison of function bodies or policy expressions.
with checks as (
select 'table'::text as check_type, 'connectpk_private.verification_uploads'::text as object_name, (to_regclass('connectpk_private.verification_uploads') is not null) as ok
union all
select 'table'::text as check_type, 'public.audit_log'::text as object_name, (to_regclass('public.audit_log') is not null) as ok
union all
select 'RLS'::text as check_type, 'audit_log'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='audit_log' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.availability'::text as object_name, (to_regclass('public.availability') is not null) as ok
union all
select 'RLS'::text as check_type, 'availability'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='availability' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.blocks'::text as object_name, (to_regclass('public.blocks') is not null) as ok
union all
select 'RLS'::text as check_type, 'blocks'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='blocks' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.chat_messages'::text as object_name, (to_regclass('public.chat_messages') is not null) as ok
union all
select 'RLS'::text as check_type, 'chat_messages'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='chat_messages' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.comments'::text as object_name, (to_regclass('public.comments') is not null) as ok
union all
select 'RLS'::text as check_type, 'comments'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='comments' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.conversations'::text as object_name, (to_regclass('public.conversations') is not null) as ok
union all
select 'RLS'::text as check_type, 'conversations'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='conversations' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.feedback'::text as object_name, (to_regclass('public.feedback') is not null) as ok
union all
select 'RLS'::text as check_type, 'feedback'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='feedback' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.hidden_posts'::text as object_name, (to_regclass('public.hidden_posts') is not null) as ok
union all
select 'RLS'::text as check_type, 'hidden_posts'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='hidden_posts' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.introductions'::text as object_name, (to_regclass('public.introductions') is not null) as ok
union all
select 'RLS'::text as check_type, 'introductions'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='introductions' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.matches'::text as object_name, (to_regclass('public.matches') is not null) as ok
union all
select 'RLS'::text as check_type, 'matches'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='matches' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.meetings'::text as object_name, (to_regclass('public.meetings') is not null) as ok
union all
select 'RLS'::text as check_type, 'meetings'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='meetings' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.messages'::text as object_name, (to_regclass('public.messages') is not null) as ok
union all
select 'RLS'::text as check_type, 'messages'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='messages' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.notifications'::text as object_name, (to_regclass('public.notifications') is not null) as ok
union all
select 'RLS'::text as check_type, 'notifications'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='notifications' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.offers'::text as object_name, (to_regclass('public.offers') is not null) as ok
union all
select 'RLS'::text as check_type, 'offers'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='offers' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.posts'::text as object_name, (to_regclass('public.posts') is not null) as ok
union all
select 'RLS'::text as check_type, 'posts'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='posts' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.profile_setup'::text as object_name, (to_regclass('public.profile_setup') is not null) as ok
union all
select 'RLS'::text as check_type, 'profile_setup'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profile_setup' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.profile_skills'::text as object_name, (to_regclass('public.profile_skills') is not null) as ok
union all
select 'RLS'::text as check_type, 'profile_skills'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profile_skills' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.profiles'::text as object_name, (to_regclass('public.profiles') is not null) as ok
union all
select 'RLS'::text as check_type, 'profiles'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profiles' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.reactions'::text as object_name, (to_regclass('public.reactions') is not null) as ok
union all
select 'RLS'::text as check_type, 'reactions'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='reactions' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.reports'::text as object_name, (to_regclass('public.reports') is not null) as ok
union all
select 'RLS'::text as check_type, 'reports'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='reports' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.safety_checkins'::text as object_name, (to_regclass('public.safety_checkins') is not null) as ok
union all
select 'RLS'::text as check_type, 'safety_checkins'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='safety_checkins' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.skills'::text as object_name, (to_regclass('public.skills') is not null) as ok
union all
select 'RLS'::text as check_type, 'skills'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='skills' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.trusted_contacts'::text as object_name, (to_regclass('public.trusted_contacts') is not null) as ok
union all
select 'RLS'::text as check_type, 'trusted_contacts'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='trusted_contacts' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.verification'::text as object_name, (to_regclass('public.verification') is not null) as ok
union all
select 'RLS'::text as check_type, 'verification'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='verification' and c.relrowsecurity)) as ok
union all
select 'table'::text as check_type, 'public.weekly_intro_quota'::text as object_name, (to_regclass('public.weekly_intro_quota') is not null) as ok
union all
select 'RLS'::text as check_type, 'weekly_intro_quota'::text as object_name, (exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='weekly_intro_quota' and c.relrowsecurity)) as ok
union all
select 'type'::text as check_type, 'public.attendance_status'::text as object_name, (to_regtype('public.attendance_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.checkin_status'::text as object_name, (to_regtype('public.checkin_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.feed_content_status'::text as object_name, (to_regtype('public.feed_content_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.intentions'::text as object_name, (to_regtype('public.intentions') is not null) as ok
union all
select 'type'::text as check_type, 'public.introduction_response'::text as object_name, (to_regtype('public.introduction_response') is not null) as ok
union all
select 'type'::text as check_type, 'public.introduction_status'::text as object_name, (to_regtype('public.introduction_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.match_status'::text as object_name, (to_regtype('public.match_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.meeting_mode'::text as object_name, (to_regtype('public.meeting_mode') is not null) as ok
union all
select 'type'::text as check_type, 'public.meeting_status'::text as object_name, (to_regtype('public.meeting_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.member_city'::text as object_name, (to_regtype('public.member_city') is not null) as ok
union all
select 'type'::text as check_type, 'public.member_role'::text as object_name, (to_regtype('public.member_role') is not null) as ok
union all
select 'type'::text as check_type, 'public.offer_status'::text as object_name, (to_regtype('public.offer_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.offer_type'::text as object_name, (to_regtype('public.offer_type') is not null) as ok
union all
select 'type'::text as check_type, 'public.post_type'::text as object_name, (to_regtype('public.post_type') is not null) as ok
union all
select 'type'::text as check_type, 'public.profile_status'::text as object_name, (to_regtype('public.profile_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.reaction_type'::text as object_name, (to_regtype('public.reaction_type') is not null) as ok
union all
select 'type'::text as check_type, 'public.report_severity'::text as object_name, (to_regtype('public.report_severity') is not null) as ok
union all
select 'type'::text as check_type, 'public.report_status'::text as object_name, (to_regtype('public.report_status') is not null) as ok
union all
select 'type'::text as check_type, 'public.verification_status'::text as object_name, (to_regtype('public.verification_status') is not null) as ok
union all
select 'index'::text as check_type, 'audit_log_actor_idx'::text as object_name, (exists(select 1 from pg_class where relname='audit_log_actor_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'audit_log_created_idx'::text as object_name, (exists(select 1 from pg_class where relname='audit_log_created_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'audit_log_entity_idx'::text as object_name, (exists(select 1 from pg_class where relname='audit_log_entity_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'availability_window_idx'::text as object_name, (exists(select 1 from pg_class where relname='availability_window_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'blocks_blocked_idx'::text as object_name, (exists(select 1 from pg_class where relname='blocks_blocked_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'chat_messages_conversation_idx'::text as object_name, (exists(select 1 from pg_class where relname='chat_messages_conversation_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'chat_messages_sender_idx'::text as object_name, (exists(select 1 from pg_class where relname='chat_messages_sender_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'comments_author_idx'::text as object_name, (exists(select 1 from pg_class where relname='comments_author_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'comments_post_idx'::text as object_name, (exists(select 1 from pg_class where relname='comments_post_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'conversations_user_a_idx'::text as object_name, (exists(select 1 from pg_class where relname='conversations_user_a_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'conversations_user_b_idx'::text as object_name, (exists(select 1 from pg_class where relname='conversations_user_b_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'feedback_profile_idx'::text as object_name, (exists(select 1 from pg_class where relname='feedback_profile_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'introductions_expiry_idx'::text as object_name, (exists(select 1 from pg_class where relname='introductions_expiry_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'introductions_member_a_idx'::text as object_name, (exists(select 1 from pg_class where relname='introductions_member_a_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'introductions_member_b_idx'::text as object_name, (exists(select 1 from pg_class where relname='introductions_member_b_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'introductions_open_pair_idx'::text as object_name, (exists(select 1 from pg_class where relname='introductions_open_pair_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'matches_active_pair_idx'::text as object_name, (exists(select 1 from pg_class where relname='matches_active_pair_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'matches_member_a_idx'::text as object_name, (exists(select 1 from pg_class where relname='matches_member_a_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'matches_member_b_idx'::text as object_name, (exists(select 1 from pg_class where relname='matches_member_b_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'meetings_match_idx'::text as object_name, (exists(select 1 from pg_class where relname='meetings_match_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'meetings_proposer_idx'::text as object_name, (exists(select 1 from pg_class where relname='meetings_proposer_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'meetings_upcoming_idx'::text as object_name, (exists(select 1 from pg_class where relname='meetings_upcoming_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'messages_conversation_idx'::text as object_name, (exists(select 1 from pg_class where relname='messages_conversation_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'messages_sender_idx'::text as object_name, (exists(select 1 from pg_class where relname='messages_sender_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'notifications_inbox_idx'::text as object_name, (exists(select 1 from pg_class where relname='notifications_inbox_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'notifications_unread_idx'::text as object_name, (exists(select 1 from pg_class where relname='notifications_unread_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'offers_offerer_idx'::text as object_name, (exists(select 1 from pg_class where relname='offers_offerer_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'offers_post_idx'::text as object_name, (exists(select 1 from pg_class where relname='offers_post_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_author_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_author_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_city_feed_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_city_feed_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_city_type_feed_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_city_type_feed_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_feed_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_feed_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_moderation_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_moderation_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_tags_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_tags_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'posts_type_feed_idx'::text as object_name, (exists(select 1 from pg_class where relname='posts_type_feed_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'profile_skills_skill_idx'::text as object_name, (exists(select 1 from pg_class where relname='profile_skills_skill_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'profiles_matching_idx'::text as object_name, (exists(select 1 from pg_class where relname='profiles_matching_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'profiles_review_idx'::text as object_name, (exists(select 1 from pg_class where relname='profiles_review_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reactions_post_type_idx'::text as object_name, (exists(select 1 from pg_class where relname='reactions_post_type_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reactions_user_idx'::text as object_name, (exists(select 1 from pg_class where relname='reactions_user_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_chat_message_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_chat_message_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_comment_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_comment_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_meeting_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_meeting_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_message_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_message_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_offer_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_offer_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_post_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_post_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_queue_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_queue_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_reported_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_reported_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_reporter_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_reporter_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'reports_reviewer_idx'::text as object_name, (exists(select 1 from pg_class where relname='reports_reviewer_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'safety_checkins_contact_idx'::text as object_name, (exists(select 1 from pg_class where relname='safety_checkins_contact_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'safety_checkins_due_idx'::text as object_name, (exists(select 1 from pg_class where relname='safety_checkins_due_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'safety_checkins_profile_idx'::text as object_name, (exists(select 1 from pg_class where relname='safety_checkins_profile_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'skills_name_unique_idx'::text as object_name, (exists(select 1 from pg_class where relname='skills_name_unique_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'verification_phone_idx'::text as object_name, (exists(select 1 from pg_class where relname='verification_phone_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'verification_queue_idx'::text as object_name, (exists(select 1 from pg_class where relname='verification_queue_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'verification_reviewer_idx'::text as object_name, (exists(select 1 from pg_class where relname='verification_reviewer_idx' and relkind='i')) as ok
union all
select 'index'::text as check_type, 'weekly_intro_quota_week_idx'::text as object_name, (exists(select 1 from pg_class where relname='weekly_intro_quota_week_idx' and relkind='i')) as ok
union all
select 'policy'::text as check_type, 'public.profiles.profiles_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.profiles.profiles_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.profiles.profiles_update_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own')) as ok
union all
select 'policy'::text as check_type, 'public.skills.skills_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='skills' and policyname='skills_read')) as ok
union all
select 'policy'::text as check_type, 'public.profile_skills.profile_skills_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profile_skills' and policyname='profile_skills_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.profile_skills.profile_skills_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profile_skills' and policyname='profile_skills_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.profile_skills.profile_skills_delete_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profile_skills' and policyname='profile_skills_delete_own')) as ok
union all
select 'policy'::text as check_type, 'public.availability.availability_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='availability' and policyname='availability_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.availability.availability_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='availability' and policyname='availability_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.availability.availability_update_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='availability' and policyname='availability_update_own')) as ok
union all
select 'policy'::text as check_type, 'public.availability.availability_delete_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='availability' and policyname='availability_delete_own')) as ok
union all
select 'policy'::text as check_type, 'public.introductions.introductions_read_pair'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='introductions' and policyname='introductions_read_pair')) as ok
union all
select 'policy'::text as check_type, 'public.matches.matches_read_pair'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='matches' and policyname='matches_read_pair')) as ok
union all
select 'policy'::text as check_type, 'public.messages.messages_read_pair'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='messages' and policyname='messages_read_pair')) as ok
union all
select 'policy'::text as check_type, 'public.meetings.meetings_read_pair'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='meetings' and policyname='meetings_read_pair')) as ok
union all
select 'policy'::text as check_type, 'public.feedback.feedback_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.feedback.feedback_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.feedback.feedback_update_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_update_own')) as ok
union all
select 'policy'::text as check_type, 'public.blocks.blocks_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='blocks' and policyname='blocks_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.blocks.blocks_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='blocks' and policyname='blocks_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.blocks.blocks_delete_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='blocks' and policyname='blocks_delete_own')) as ok
union all
select 'policy'::text as check_type, 'public.reports.reports_staff_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='reports' and policyname='reports_staff_read')) as ok
union all
select 'policy'::text as check_type, 'public.verification.verification_staff_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='verification' and policyname='verification_staff_read')) as ok
union all
select 'policy'::text as check_type, 'public.trusted_contacts.trusted_contacts_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='trusted_contacts' and policyname='trusted_contacts_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.trusted_contacts.trusted_contacts_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='trusted_contacts' and policyname='trusted_contacts_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.trusted_contacts.trusted_contacts_update_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='trusted_contacts' and policyname='trusted_contacts_update_own')) as ok
union all
select 'policy'::text as check_type, 'public.trusted_contacts.trusted_contacts_delete_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='trusted_contacts' and policyname='trusted_contacts_delete_own')) as ok
union all
select 'policy'::text as check_type, 'public.safety_checkins.safety_checkins_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='safety_checkins' and policyname='safety_checkins_read_own')) as ok
union all
select 'policy'::text as check_type, 'public.safety_checkins.safety_checkins_insert_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='safety_checkins' and policyname='safety_checkins_insert_own')) as ok
union all
select 'policy'::text as check_type, 'public.safety_checkins.safety_checkins_update_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='safety_checkins' and policyname='safety_checkins_update_own')) as ok
union all
select 'policy'::text as check_type, 'public.weekly_intro_quota.weekly_intro_quota_read_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='weekly_intro_quota' and policyname='weekly_intro_quota_read_own')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_objects_staff_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_objects_staff_read')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_objects_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_objects_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_objects_anon_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_objects_anon_guard')) as ok
union all
select 'policy'::text as check_type, 'public.profile_setup.profile_setup_owner'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='profile_setup' and policyname='profile_setup_owner')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_read')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_insert')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_update')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_delete'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_delete')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_anon_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_anon_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_upload_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_upload_insert')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_upload_insert_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_upload_insert_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_immutable_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_immutable_update')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_immutable_delete'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_immutable_delete')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.verification_anon_write_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='verification_anon_write_guard')) as ok
union all
select 'policy'::text as check_type, 'public.posts.posts_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_read')) as ok
union all
select 'policy'::text as check_type, 'public.posts.posts_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_insert')) as ok
union all
select 'policy'::text as check_type, 'public.posts.posts_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_update')) as ok
union all
select 'policy'::text as check_type, 'public.posts.posts_delete'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='posts_delete')) as ok
union all
select 'policy'::text as check_type, 'public.comments.comments_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_read')) as ok
union all
select 'policy'::text as check_type, 'public.comments.comments_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_insert')) as ok
union all
select 'policy'::text as check_type, 'public.comments.comments_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_update')) as ok
union all
select 'policy'::text as check_type, 'public.comments.comments_delete'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_delete')) as ok
union all
select 'policy'::text as check_type, 'public.reactions.reactions_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='reactions' and policyname='reactions_read')) as ok
union all
select 'policy'::text as check_type, 'public.reactions.reactions_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='reactions' and policyname='reactions_insert')) as ok
union all
select 'policy'::text as check_type, 'public.reactions.reactions_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='reactions' and policyname='reactions_update')) as ok
union all
select 'policy'::text as check_type, 'public.reactions.reactions_delete'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='reactions' and policyname='reactions_delete')) as ok
union all
select 'policy'::text as check_type, 'public.offers.offers_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='offers' and policyname='offers_read')) as ok
union all
select 'policy'::text as check_type, 'public.offers.offers_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='offers' and policyname='offers_insert')) as ok
union all
select 'policy'::text as check_type, 'public.offers.offers_update'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='offers' and policyname='offers_update')) as ok
union all
select 'policy'::text as check_type, 'public.conversations.conversations_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='conversations' and policyname='conversations_read')) as ok
union all
select 'policy'::text as check_type, 'public.chat_messages.chat_messages_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_read')) as ok
union all
select 'policy'::text as check_type, 'public.chat_messages.chat_messages_insert'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_read_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_read_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_feed_read'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_feed_read')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_insert_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_insert_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_update_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_update_guard')) as ok
union all
select 'policy'::text as check_type, 'storage.objects.profile_photo_delete_guard'::text as object_name, (exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='profile_photo_delete_guard')) as ok
union all
select 'policy'::text as check_type, 'public.hidden_posts.hidden_posts_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='hidden_posts' and policyname='hidden_posts_own')) as ok
union all
select 'policy'::text as check_type, 'public.notifications.notifications_own'::text as object_name, (exists(select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_own')) as ok
union all
select 'trigger'::text as check_type, 'introductions_require_verification'::text as object_name, (exists(select 1 from pg_trigger where tgname='introductions_require_verification' and tgrelid=to_regclass('public.introductions') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'posts_daily_limit'::text as object_name, (exists(select 1 from pg_trigger where tgname='posts_daily_limit' and tgrelid=to_regclass('public.posts') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'offers_daily_limit'::text as object_name, (exists(select 1 from pg_trigger where tgname='offers_daily_limit' and tgrelid=to_regclass('public.offers') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'posts_record_creation'::text as object_name, (exists(select 1 from pg_trigger where tgname='posts_record_creation' and tgrelid=to_regclass('public.posts') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'offers_record_creation'::text as object_name, (exists(select 1 from pg_trigger where tgname='offers_record_creation' and tgrelid=to_regclass('public.offers') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'posts_soft_delete'::text as object_name, (exists(select 1 from pg_trigger where tgname='posts_soft_delete' and tgrelid=to_regclass('public.posts') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'comments_soft_delete'::text as object_name, (exists(select 1 from pg_trigger where tgname='comments_soft_delete' and tgrelid=to_regclass('public.comments') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'offers_transition'::text as object_name, (exists(select 1 from pg_trigger where tgname='offers_transition' and tgrelid=to_regclass('public.offers') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'conversations_validate'::text as object_name, (exists(select 1 from pg_trigger where tgname='conversations_validate' and tgrelid=to_regclass('public.conversations') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'offers_open_conversation'::text as object_name, (exists(select 1 from pg_trigger where tgname='offers_open_conversation' and tgrelid=to_regclass('public.offers') and tgenabled<>'D')) as ok
union all
select 'trigger'::text as check_type, 'posts_validate_content'::text as object_name, (exists(select 1 from pg_trigger where tgname='posts_validate_content' and tgrelid=to_regclass('public.posts') and tgenabled<>'D')) as ok
union all
select 'column'::text as check_type, 'public.profiles.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.profiles.full_name'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='full_name')) as ok
union all
select 'column'::text as check_type, 'public.profiles.date_of_birth'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='date_of_birth')) as ok
union all
select 'column'::text as check_type, 'public.profiles.city'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='city')) as ok
union all
select 'column'::text as check_type, 'public.profiles.intention'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='intention')) as ok
union all
select 'column'::text as check_type, 'public.profiles.role'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='role')) as ok
union all
select 'column'::text as check_type, 'public.profiles.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.profiles.headline'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='headline')) as ok
union all
select 'column'::text as check_type, 'public.profiles.bio'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='bio')) as ok
union all
select 'column'::text as check_type, 'public.profiles.avatar_path'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='avatar_path')) as ok
union all
select 'column'::text as check_type, 'public.profiles.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.profiles.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.skills.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='skills' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.skills.name'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='skills' and column_name='name')) as ok
union all
select 'column'::text as check_type, 'public.skills.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='skills' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.profile_skills.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_skills' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.profile_skills.skill_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_skills' and column_name='skill_id')) as ok
union all
select 'column'::text as check_type, 'public.availability.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='availability' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.availability.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='availability' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.availability.starts_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='availability' and column_name='starts_at')) as ok
union all
select 'column'::text as check_type, 'public.availability.ends_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='availability' and column_name='ends_at')) as ok
union all
select 'column'::text as check_type, 'public.availability.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='availability' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.introductions.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.introductions.member_a_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='member_a_id')) as ok
union all
select 'column'::text as check_type, 'public.introductions.member_b_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='member_b_id')) as ok
union all
select 'column'::text as check_type, 'public.introductions.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.introductions.member_a_response'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='member_a_response')) as ok
union all
select 'column'::text as check_type, 'public.introductions.member_b_response'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='member_b_response')) as ok
union all
select 'column'::text as check_type, 'public.introductions.reason'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='reason')) as ok
union all
select 'column'::text as check_type, 'public.introductions.expires_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='expires_at')) as ok
union all
select 'column'::text as check_type, 'public.introductions.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.introductions.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='introductions' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.matches.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.matches.introduction_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='introduction_id')) as ok
union all
select 'column'::text as check_type, 'public.matches.member_a_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='member_a_id')) as ok
union all
select 'column'::text as check_type, 'public.matches.member_b_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='member_b_id')) as ok
union all
select 'column'::text as check_type, 'public.matches.introduction_status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='introduction_status')) as ok
union all
select 'column'::text as check_type, 'public.matches.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.matches.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.matches.ended_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='matches' and column_name='ended_at')) as ok
union all
select 'column'::text as check_type, 'public.messages.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.messages.match_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='match_id')) as ok
union all
select 'column'::text as check_type, 'public.messages.sender_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='sender_id')) as ok
union all
select 'column'::text as check_type, 'public.messages.body'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='body')) as ok
union all
select 'column'::text as check_type, 'public.messages.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='messages' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.meetings.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.meetings.match_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='match_id')) as ok
union all
select 'column'::text as check_type, 'public.meetings.proposed_by'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='proposed_by')) as ok
union all
select 'column'::text as check_type, 'public.meetings.starts_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='starts_at')) as ok
union all
select 'column'::text as check_type, 'public.meetings.duration_minutes'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='duration_minutes')) as ok
union all
select 'column'::text as check_type, 'public.meetings.mode'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='mode')) as ok
union all
select 'column'::text as check_type, 'public.meetings.venue'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='venue')) as ok
union all
select 'column'::text as check_type, 'public.meetings.online_url'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='online_url')) as ok
union all
select 'column'::text as check_type, 'public.meetings.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.meetings.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.meetings.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='meetings' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.feedback.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.feedback.meeting_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='meeting_id')) as ok
union all
select 'column'::text as check_type, 'public.feedback.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.feedback.attendance'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='attendance')) as ok
union all
select 'column'::text as check_type, 'public.feedback.accuracy'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='accuracy')) as ok
union all
select 'column'::text as check_type, 'public.feedback.conduct'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='conduct')) as ok
union all
select 'column'::text as check_type, 'public.feedback.usefulness'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='usefulness')) as ok
union all
select 'column'::text as check_type, 'public.feedback.felt_safe'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='felt_safe')) as ok
union all
select 'column'::text as check_type, 'public.feedback.wants_another'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='wants_another')) as ok
union all
select 'column'::text as check_type, 'public.feedback.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='feedback' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.blocks.blocker_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='blocks' and column_name='blocker_id')) as ok
union all
select 'column'::text as check_type, 'public.blocks.blocked_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='blocks' and column_name='blocked_id')) as ok
union all
select 'column'::text as check_type, 'public.blocks.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='blocks' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.reports.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.reports.reporter_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='reporter_id')) as ok
union all
select 'column'::text as check_type, 'public.reports.reported_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='reported_id')) as ok
union all
select 'column'::text as check_type, 'public.reports.message_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='message_id')) as ok
union all
select 'column'::text as check_type, 'public.reports.meeting_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='meeting_id')) as ok
union all
select 'column'::text as check_type, 'public.reports.reason'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='reason')) as ok
union all
select 'column'::text as check_type, 'public.reports.severity'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='severity')) as ok
union all
select 'column'::text as check_type, 'public.reports.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.reports.reviewed_by'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='reviewed_by')) as ok
union all
select 'column'::text as check_type, 'public.reports.resolved_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='resolved_at')) as ok
union all
select 'column'::text as check_type, 'public.reports.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.reports.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.verification.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.verification.phone'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='phone')) as ok
union all
select 'column'::text as check_type, 'public.verification.phone_verified_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='phone_verified_at')) as ok
union all
select 'column'::text as check_type, 'public.verification.selfie_path'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='selfie_path')) as ok
union all
select 'column'::text as check_type, 'public.verification.evidence_path'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='evidence_path')) as ok
union all
select 'column'::text as check_type, 'public.verification.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.verification.reviewed_by'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='reviewed_by')) as ok
union all
select 'column'::text as check_type, 'public.verification.reviewed_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='reviewed_at')) as ok
union all
select 'column'::text as check_type, 'public.verification.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.verification.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.trusted_contacts.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='trusted_contacts' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.trusted_contacts.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='trusted_contacts' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.trusted_contacts.name'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='trusted_contacts' and column_name='name')) as ok
union all
select 'column'::text as check_type, 'public.trusted_contacts.phone'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='trusted_contacts' and column_name='phone')) as ok
union all
select 'column'::text as check_type, 'public.trusted_contacts.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='trusted_contacts' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.meeting_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='meeting_id')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.trusted_contact_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='trusted_contact_id')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.due_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='due_at')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.checked_in_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='checked_in_at')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.safety_checkins.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='safety_checkins' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.actor_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='actor_id')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.action'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='action')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.entity_type'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='entity_type')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.entity_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='entity_id')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.metadata'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='metadata')) as ok
union all
select 'column'::text as check_type, 'public.audit_log.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='audit_log' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.weekly_intro_quota.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='weekly_intro_quota' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'public.weekly_intro_quota.week_start'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='weekly_intro_quota' and column_name='week_start')) as ok
union all
select 'column'::text as check_type, 'public.weekly_intro_quota.introductions_count'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='weekly_intro_quota' and column_name='introductions_count')) as ok
union all
select 'column'::text as check_type, 'public.weekly_intro_quota.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='weekly_intro_quota' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'public.profile_setup.user_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_setup' and column_name='user_id')) as ok
union all
select 'column'::text as check_type, 'public.profile_setup.data'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_setup' and column_name='data')) as ok
union all
select 'column'::text as check_type, 'public.profile_setup.step'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_setup' and column_name='step')) as ok
union all
select 'column'::text as check_type, 'public.profile_setup.updated_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_setup' and column_name='updated_at')) as ok
union all
select 'column'::text as check_type, 'connectpk_private.verification_uploads.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='connectpk_private' and table_name='verification_uploads' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'connectpk_private.verification_uploads.profile_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='connectpk_private' and table_name='verification_uploads' and column_name='profile_id')) as ok
union all
select 'column'::text as check_type, 'connectpk_private.verification_uploads.submitted'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='connectpk_private' and table_name='verification_uploads' and column_name='submitted')) as ok
union all
select 'column'::text as check_type, 'connectpk_private.verification_uploads.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='connectpk_private' and table_name='verification_uploads' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.posts.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.posts.author_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='author_id')) as ok
union all
select 'column'::text as check_type, 'public.posts.post_type'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='post_type')) as ok
union all
select 'column'::text as check_type, 'public.posts.title'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='title')) as ok
union all
select 'column'::text as check_type, 'public.posts.body'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='body')) as ok
union all
select 'column'::text as check_type, 'public.posts.tags'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='tags')) as ok
union all
select 'column'::text as check_type, 'public.posts.city'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='city')) as ok
union all
select 'column'::text as check_type, 'public.posts.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.posts.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.comments.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.comments.post_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='post_id')) as ok
union all
select 'column'::text as check_type, 'public.comments.author_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='author_id')) as ok
union all
select 'column'::text as check_type, 'public.comments.body'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='body')) as ok
union all
select 'column'::text as check_type, 'public.comments.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.comments.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='comments' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.reactions.post_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reactions' and column_name='post_id')) as ok
union all
select 'column'::text as check_type, 'public.reactions.user_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reactions' and column_name='user_id')) as ok
union all
select 'column'::text as check_type, 'public.reactions.type'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reactions' and column_name='type')) as ok
union all
select 'column'::text as check_type, 'public.offers.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.offers.post_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='post_id')) as ok
union all
select 'column'::text as check_type, 'public.offers.offerer_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='offerer_id')) as ok
union all
select 'column'::text as check_type, 'public.offers.offer_type'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='offer_type')) as ok
union all
select 'column'::text as check_type, 'public.offers.message'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='message')) as ok
union all
select 'column'::text as check_type, 'public.offers.status'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='status')) as ok
union all
select 'column'::text as check_type, 'public.offers.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='offers' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.conversations.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.conversations.offer_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='offer_id')) as ok
union all
select 'column'::text as check_type, 'public.conversations.user_a'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='user_a')) as ok
union all
select 'column'::text as check_type, 'public.conversations.user_b'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='user_b')) as ok
union all
select 'column'::text as check_type, 'public.conversations.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.chat_messages.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.chat_messages.conversation_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='conversation_id')) as ok
union all
select 'column'::text as check_type, 'public.chat_messages.sender_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='sender_id')) as ok
union all
select 'column'::text as check_type, 'public.chat_messages.body'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='body')) as ok
union all
select 'column'::text as check_type, 'public.chat_messages.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.notifications.id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='id')) as ok
union all
select 'column'::text as check_type, 'public.notifications.user_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='user_id')) as ok
union all
select 'column'::text as check_type, 'public.notifications.type'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='type')) as ok
union all
select 'column'::text as check_type, 'public.notifications.data'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='data')) as ok
union all
select 'column'::text as check_type, 'public.notifications.read_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='read_at')) as ok
union all
select 'column'::text as check_type, 'public.notifications.created_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='notifications' and column_name='created_at')) as ok
union all
select 'column'::text as check_type, 'public.hidden_posts.user_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='hidden_posts' and column_name='user_id')) as ok
union all
select 'column'::text as check_type, 'public.hidden_posts.post_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='hidden_posts' and column_name='post_id')) as ok
union all
select 'function'::text as check_type, 'public.save_profile_setup(jsonb,integer,boolean)'::text as object_name, (to_regprocedure('public.save_profile_setup(jsonb,integer,boolean)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'save_profile_setup'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.save_profile_setup(jsonb,integer,boolean)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'save_profile_setup'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.save_profile_setup(jsonb,integer,boolean)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.my_verification_status()'::text as object_name, (to_regprocedure('public.my_verification_status()') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'my_verification_status'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.my_verification_status()'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'my_verification_status'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.my_verification_status()'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.begin_verification()'::text as object_name, (to_regprocedure('public.begin_verification()') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'begin_verification'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.begin_verification()'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'begin_verification'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.begin_verification()'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.submit_verification(uuid,text,text)'::text as object_name, (to_regprocedure('public.submit_verification(uuid,text,text)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'submit_verification'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.submit_verification(uuid,text,text)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'submit_verification'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.submit_verification(uuid,text,text)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.feed_page(public.post_type,public.member_city,text,timestamp with time zone,uuid)'::text as object_name, (to_regprocedure('public.feed_page(public.post_type,public.member_city,text,timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'feed_page'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.feed_page(public.post_type,public.member_city,text,timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'feed_page'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.feed_page(public.post_type,public.member_city,text,timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.my_post_quota()'::text as object_name, (to_regprocedure('public.my_post_quota()') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'my_post_quota'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.my_post_quota()'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'my_post_quota'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.my_post_quota()'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.post_detail(uuid)'::text as object_name, (to_regprocedure('public.post_detail(uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'post_detail'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.post_detail(uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'post_detail'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.post_detail(uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.post_opinions(uuid,timestamp with time zone,uuid)'::text as object_name, (to_regprocedure('public.post_opinions(uuid,timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'post_opinions'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.post_opinions(uuid,timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'post_opinions'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.post_opinions(uuid,timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.report_feed_content(uuid,text,uuid)'::text as object_name, (to_regprocedure('public.report_feed_content(uuid,text,uuid)') is not null) as ok
union all
select 'legacy report denied'::text as check_type, 'report_feed_content'::text as object_name, (not coalesce(has_function_privilege('authenticated',to_regprocedure('public.report_feed_content(uuid,text,uuid)'),'EXECUTE'),true)) as ok
union all
select 'anonymous denied'::text as check_type, 'report_feed_content'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.report_feed_content(uuid,text,uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.offer_profile(uuid)'::text as object_name, (to_regprocedure('public.offer_profile(uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'offer_profile'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.offer_profile(uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'offer_profile'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.offer_profile(uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type, 'public.post_offers(uuid,timestamp with time zone,uuid)'::text as object_name, (to_regprocedure('public.post_offers(uuid,timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type, 'post_offers'::text as object_name, (coalesce(has_function_privilege('authenticated',to_regprocedure('public.post_offers(uuid,timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type, 'post_offers'::text as object_name, (not coalesce(has_function_privilege('anon',to_regprocedure('public.post_offers(uuid,timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'private bucket'::text as check_type, 'profile-photos'::text as object_name, (exists(select 1 from storage.buckets where id='profile-photos' and public=false)) as ok
union all
select 'private bucket'::text as check_type, 'verification'::text as object_name, (exists(select 1 from storage.buckets where id='verification' and public=false)) as ok
union all
select 'column'::text as check_type, 'profiles.setup_completed_at'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='setup_completed_at')) as ok
union all
select 'column'::text as check_type, 'verification.linkedin_url'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='linkedin_url')) as ok
union all
select 'column'::text as check_type, 'verification.portfolio_url'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='portfolio_url')) as ok
union all
select 'column'::text as check_type, 'verification.work_proof_path'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='work_proof_path')) as ok
union all
select 'column'::text as check_type, 'verification.university_proof_path'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='university_proof_path')) as ok
union all
select 'column'::text as check_type, 'verification.submission_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='verification' and column_name='submission_id')) as ok
union all
select 'column'::text as check_type, 'reports.post_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='post_id')) as ok
union all
select 'column'::text as check_type, 'reports.comment_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='comment_id')) as ok
union all
select 'column'::text as check_type, 'reports.offer_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='offer_id')) as ok
union all
select 'column'::text as check_type, 'reports.chat_message_id'::text as object_name, (exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='chat_message_id')) as ok
union all
select 'function'::text as check_type,'public.send_chat_message(uuid,text,text)'::text as object_name,(to_regprocedure('public.send_chat_message(uuid,text,text)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'send_chat_message'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.send_chat_message(uuid,text,text)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'send_chat_message'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.send_chat_message(uuid,text,text)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.leave_chat(uuid)'::text as object_name,(to_regprocedure('public.leave_chat(uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'leave_chat'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.leave_chat(uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'leave_chat'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.leave_chat(uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.report_chat(uuid,text)'::text as object_name,(to_regprocedure('public.report_chat(uuid,text)') is not null) as ok
union all
select 'legacy report denied'::text as check_type,'report_chat'::text as object_name,(not coalesce(has_function_privilege('authenticated',to_regprocedure('public.report_chat(uuid,text)'),'EXECUTE'),true)) as ok
union all
select 'anonymous denied'::text as check_type,'report_chat'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.report_chat(uuid,text)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.chat_inbox(uuid,timestamp with time zone,uuid)'::text as object_name,(to_regprocedure('public.chat_inbox(uuid,timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'chat_inbox'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.chat_inbox(uuid,timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'chat_inbox'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.chat_inbox(uuid,timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'column'::text as check_type,'conversations.closed_at'::text as object_name,(exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='closed_at')) as ok
union all
select 'column'::text as check_type,'conversations.closed_by'::text as object_name,(exists(select 1 from information_schema.columns where table_schema='public' and table_name='conversations' and column_name='closed_by')) as ok
union all
select 'column'::text as check_type,'chat_messages.request_key'::text as object_name,(exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='request_key')) as ok
union all
select 'column'::text as check_type,'reports.conversation_id'::text as object_name,(exists(select 1 from information_schema.columns where table_schema='public' and table_name='reports' and column_name='conversation_id')) as ok
union all
select 'Realtime publication'::text as check_type,'chat_messages'::text as object_name,(exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages')) as ok
union all
select 'Realtime publication'::text as check_type,'conversations'::text as object_name,(exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='conversations')) as ok
union all
select 'direct message insert denied'::text as check_type,'chat_messages'::text as object_name,(not has_column_privilege('authenticated','public.chat_messages','body','INSERT')) as ok
union all
select 'function'::text as check_type,'public.member_profile(uuid)'::text as object_name,(to_regprocedure('public.member_profile(uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'public.member_profile(uuid)'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.member_profile(uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'public.member_profile(uuid)'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.member_profile(uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.member_posts(uuid,timestamp with time zone,uuid)'::text as object_name,(to_regprocedure('public.member_posts(uuid,timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'public.member_posts(uuid,timestamp with time zone,uuid)'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.member_posts(uuid,timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'public.member_posts(uuid,timestamp with time zone,uuid)'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.member_posts(uuid,timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.save_member_profile(jsonb)'::text as object_name,(to_regprocedure('public.save_member_profile(jsonb)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'public.save_member_profile(jsonb)'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.save_member_profile(jsonb)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'public.save_member_profile(jsonb)'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.save_member_profile(jsonb)'),'EXECUTE'),true)) as ok
union all
select 'function'::text as check_type,'public.my_offers(timestamp with time zone,uuid)'::text as object_name,(to_regprocedure('public.my_offers(timestamp with time zone,uuid)') is not null) as ok
union all
select 'authenticated execute'::text as check_type,'public.my_offers(timestamp with time zone,uuid)'::text as object_name,(coalesce(has_function_privilege('authenticated',to_regprocedure('public.my_offers(timestamp with time zone,uuid)'),'EXECUTE'),false)) as ok
union all
select 'anonymous denied'::text as check_type,'public.my_offers(timestamp with time zone,uuid)'::text as object_name,(not coalesce(has_function_privilege('anon',to_regprocedure('public.my_offers(timestamp with time zone,uuid)'),'EXECUTE'),true)) as ok
union all
select 'function', 'public.mark_notifications_read(uuid)', to_regprocedure('public.mark_notifications_read(uuid)') is not null
union all
select 'function', 'public.set_device_push(text,boolean)', to_regprocedure('public.set_device_push(text,boolean)') is not null
union all
select 'function', 'public.my_device_push(text)', to_regprocedure('public.my_device_push(text)') is not null
union all
select 'function', 'public.claim_push_jobs()', to_regprocedure('public.claim_push_jobs()') is not null
union all
select 'function', 'public.finish_push_job(uuid,uuid,text,text,text)', to_regprocedure('public.finish_push_job(uuid,uuid,text,text,text)') is not null
union all
select 'publication','notifications realtime', exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications')
union all
select 'private table','push_devices', exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='connectpk_private' and c.relname='push_devices' and c.relrowsecurity)
union all
select 'private table','push_jobs', exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='connectpk_private' and c.relname='push_jobs' and c.relrowsecurity)
union all
select 'function','submit_report',to_regprocedure('public.submit_report(text,uuid,text,text)') is not null
union all
select 'anonymous denied','submit_report',not has_function_privilege('anon','public.submit_report(text,uuid,text,text)','execute')
union all
select 'trigger','reports_hide_post',exists(select 1 from pg_trigger where tgname='reports_hide_post' and not tgisinternal)
union all
select 'policy','comments_block_guard',exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_block_guard' and permissive='RESTRICTIVE')

union all
select 'admin function','admin_dashboard()',to_regprocedure('public.admin_dashboard()') is not null
union all
select 'anonymous denied','admin_dashboard()',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_dashboard()'),'execute'),true)
union all
select 'admin function','admin_queue(text,integer)',to_regprocedure('public.admin_queue(text,integer)') is not null
union all
select 'anonymous denied','admin_queue(text,integer)',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_queue(text,integer)'),'execute'),true)
union all
select 'admin function','admin_evidence(uuid,text)',to_regprocedure('public.admin_evidence(uuid,text)') is not null
union all
select 'anonymous denied','admin_evidence(uuid,text)',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_evidence(uuid,text)'),'execute'),true)
union all
select 'admin function','admin_review_verification(uuid,timestamp with time zone,text,text)',to_regprocedure('public.admin_review_verification(uuid,timestamp with time zone,text,text)') is not null
union all
select 'anonymous denied','admin_review_verification(uuid,timestamp with time zone,text,text)',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_review_verification(uuid,timestamp with time zone,text,text)'),'execute'),true)
union all
select 'admin function','admin_review_report(uuid,timestamp with time zone,text,text)',to_regprocedure('public.admin_review_report(uuid,timestamp with time zone,text,text)') is not null
union all
select 'anonymous denied','admin_review_report(uuid,timestamp with time zone,text,text)',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_review_report(uuid,timestamp with time zone,text,text)'),'execute'),true)
union all
select 'admin function','admin_review_hidden(uuid,integer,text,text)',to_regprocedure('public.admin_review_hidden(uuid,integer,text,text)') is not null
union all
select 'anonymous denied','admin_review_hidden(uuid,integer,text,text)',not coalesce(has_function_privilege('anon',to_regprocedure('public.admin_review_hidden(uuid,integer,text,text)'),'execute'),true)
)
select check_type,object_name,'MISSING OR INCORRECT' as result from checks where not ok
union all
select 'SUMMARY',count(*)::text || ' checks',case when bool_and(ok) then 'ALL CHECKS PASSED' else count(*) filter(where not ok)::text || ' checks need attention' end from checks
order by check_type,object_name;
