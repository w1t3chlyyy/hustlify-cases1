-- Hustlify: add-on migration for
--   1) editable /start welcome screen (text + photo + buttons)
--   2) broadcasting a message to every bot user when a case gets published
--
-- Run once in Supabase SQL Editor (Project -> SQL Editor -> New query),
-- in addition to the base supabase/schema.sql.

-- Everyone who has ever pressed /start — needed so the bot knows who to
-- broadcast "new case" announcements to. Written only by the server
-- (service role key), never reachable from the browser.
create table if not exists public.bot_users (
  telegram_id bigint primary key,
  username text,
  first_name text,
  created_at timestamptz not null default now()
);

alter table public.bot_users enable row level security;
-- No policies: intentionally unreachable via the anon/public API.

-- Singleton row (id = 'welcome') holding the editable /start screen:
-- greeting text, an optional photo (Telegram file_id or public URL),
-- and a list of {label, url} buttons shown under the message.
create table if not exists public.bot_settings (
  id text primary key,
  text text not null default '',
  photo_url text,
  buttons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.bot_settings enable row level security;
-- No policies: intentionally unreachable via the anon/public API.

insert into public.bot_settings (id, text, photo_url, buttons)
values (
  'welcome',
  '👋 Добро пожаловать в Hustlify!\n\nЗдесь собраны наши кейсы — реальные закрытые проекты. Загляните в MiniApp, чтобы посмотреть примеры работ.',
  null,
  '[]'::jsonb
)
on conflict (id) do nothing;
