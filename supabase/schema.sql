-- Hustlify: schema for the "cases" (closed orders / portfolio) MiniApp
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,               -- short one-liner shown on the card in the list
  description text not null,   -- full description shown on the case page
  cover_image text,            -- url of the cover/cover thumbnail
  images text[] not null default '{}', -- gallery, ordered array of image urls
  project_url text,            -- "Посмотреть проект" link
  tags text[] not null default '{}',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_published_sort_idx
  on public.cases (is_published, sort_order desc, created_at desc);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
before update on public.cases
for each row execute function public.set_updated_at();

-- Row Level Security: public (anon) can only READ published cases.
-- All writes go through the server (service role key), never the browser.
alter table public.cases enable row level security;

drop policy if exists "public read published cases" on public.cases;
create policy "public read published cases"
  on public.cases for select
  using (is_published = true);

-- Conversation state for the Telegram /admin bot (one row per admin's
-- Telegram user id). Serverless webhook calls are stateless, so the
-- current step of an in-progress add/edit flow is stored here between
-- messages. Only ever touched via the service role key from the bot.
create table if not exists public.admin_bot_state (
  telegram_id bigint primary key,
  step text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.admin_bot_state enable row level security;
-- No policies: this table is intentionally unreachable via the anon/public
-- API. Only the server-side service role key (which bypasses RLS) may
-- read or write it.

-- Storage bucket for case images (public read, uploads happen server-side via admin API)
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;

drop policy if exists "public read case images" on storage.objects;
create policy "public read case images"
  on storage.objects for select
  using (bucket_id = 'case-images');
