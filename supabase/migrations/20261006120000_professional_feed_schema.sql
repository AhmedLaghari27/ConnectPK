begin;

-- Schema only. Future write APIs must enforce approval, blocks, daily quotas,
-- moderation, and owner-only offer acceptance before opening a conversation.
create type public.post_type as enum (
  'building', 'career_step', 'need_opinion', 'need_help', 'offering_help'
);
create type public.feed_content_status as enum ('active', 'hidden', 'removed');
create type public.reaction_type as enum ('useful', 'inspiring', 'support');
create type public.offer_type as enum (
  'advice', 'mentoring', 'development', 'funding_interest', 'introduction', 'collaboration'
);
create type public.offer_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  post_type public.post_type not null,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  tags text[] not null default '{}',
  city public.member_city not null,
  status public.feed_content_status not null default 'active',
  created_at timestamptz not null default now(),
  constraint posts_tags_bounded check (
    cardinality(tags) <= 10 and (cardinality(tags) = 0 or array_ndims(tags) = 1)
    and array_position(tags, null) is null
    and char_length(array_to_string(tags, ',')) <= 500
  )
);
create index posts_feed_idx on public.posts (created_at desc, id desc) where status = 'active';
create index posts_city_feed_idx on public.posts (city, created_at desc, id desc) where status = 'active';
create index posts_type_feed_idx on public.posts (post_type, created_at desc, id desc) where status = 'active';
create index posts_city_type_feed_idx on public.posts (city, post_type, created_at desc, id desc) where status = 'active';
create index posts_author_idx on public.posts (author_id, created_at desc, id desc);
create index posts_moderation_idx on public.posts (status, created_at desc, id desc);
create index posts_tags_idx on public.posts using gin (tags) where status = 'active';
comment on column public.posts.status is 'Global moderation/deletion state. Per-member hiding requires a separate future private preference; it must not set this shared status.';

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status public.feed_content_status not null default 'active',
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, status, created_at, id);
create index comments_author_idx on public.comments (author_id, created_at desc, id desc);

create table public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.reaction_type not null,
  primary key (post_id, user_id)
);
create index reactions_user_idx on public.reactions (user_id, post_id);
create index reactions_post_type_idx on public.reactions (post_id, type);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  offerer_id uuid not null references public.profiles(id) on delete cascade,
  offer_type public.offer_type not null,
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (offerer_id, post_id)
);
create index offers_post_idx on public.offers (post_id, status, created_at desc, id desc);
create index offers_offerer_idx on public.offers (offerer_id, created_at desc, id desc);
comment on column public.offers.offer_type is 'funding_interest conveys interest only, never a payment. UI must display the required scam warning.';

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.offers(id) on delete restrict,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a <> user_b)
);
create index conversations_user_a_idx on public.conversations (user_a, created_at desc, id desc);
create index conversations_user_b_idx on public.conversations (user_b, created_at desc, id desc);
comment on table public.conversations is 'One conversation per accepted offer. Future transactional acceptance must set user_a to the post owner and user_b to the offerer, and check blocks and approval.';
comment on column public.conversations.offer_id is 'RESTRICT preserves chat context. Use posts.status=removed for deletion where offers have conversations.';

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index chat_messages_conversation_idx on public.chat_messages (conversation_id, created_at, id);
create index chat_messages_sender_idx on public.chat_messages (sender_id, created_at desc, id desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (char_length(btrim(type)) between 1 and 80),
  data jsonb not null default '{}' check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 8192),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (read_at is null or read_at >= created_at)
);
create index notifications_inbox_idx on public.notifications (user_id, created_at desc, id desc);
create index notifications_unread_idx on public.notifications (user_id, created_at desc, id desc) where read_at is null;
comment on column public.notifications.data is 'Server-written safe identifiers/context only; never include verification evidence, phone numbers, exact location, or private message bodies.';

-- Extend the existing moderation table; retain legacy message/meeting references.
alter table public.reports
  add column post_id uuid references public.posts(id) on delete set null,
  add column comment_id uuid references public.comments(id) on delete set null,
  add column offer_id uuid references public.offers(id) on delete set null,
  add column chat_message_id uuid references public.chat_messages(id) on delete set null;
create index reports_post_idx on public.reports (post_id) where post_id is not null;
create index reports_comment_idx on public.reports (comment_id) where comment_id is not null;
create index reports_offer_idx on public.reports (offer_id) where offer_id is not null;
create index reports_chat_message_idx on public.reports (chat_message_id) where chat_message_id is not null;

-- Existing profiles, blocks, and reports policies stay unchanged. No feed grants
-- or policies yet: even unapproved members cannot post through the client API.
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.offers enable row level security;
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
revoke all on table public.posts, public.comments, public.reactions, public.offers,
  public.conversations, public.chat_messages, public.notifications from public, anon, authenticated;

commit;
