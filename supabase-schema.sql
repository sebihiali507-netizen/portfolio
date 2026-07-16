-- =============================================
-- Supabase schema for portfolio admin
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Create the projects table
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text not null default '',
  url         text not null,
  description text not null default '',
  tags        text[] not null default '{}',
  category    text not null default 'Web',
  created_at  timestamptz not null default now(),
  thumbnail   text,
  user_id     uuid references auth.users(id) on delete cascade
);

alter table projects enable row level security;

drop policy if exists "Public read access" on projects;
drop policy if exists "Authenticated insert" on projects;
drop policy if exists "Authenticated update" on projects;
drop policy if exists "Authenticated delete" on projects;

create policy "Public read access"
  on projects for select using (true);

create policy "Authenticated insert"
  on projects for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update"
  on projects for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete"
  on projects for delete
  using (auth.role() = 'authenticated');

-- 2. Create the messages table
create table if not exists messages (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text not null,
  website_description text not null,
  message             text not null default '',
  created_at          timestamptz not null default now(),
  read                boolean not null default false
);

alter table messages enable row level security;

drop policy if exists "Anyone can insert messages" on messages;
drop policy if exists "Authenticated read messages" on messages;
drop policy if exists "Authenticated update messages" on messages;
drop policy if exists "Authenticated delete messages" on messages;

create policy "Anyone can insert messages"
  on messages for insert
  with check (true);

create policy "Authenticated read messages"
  on messages for select
  using (auth.role() = 'authenticated');

create policy "Authenticated update messages"
  on messages for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete messages"
  on messages for delete
  using (auth.role() = 'authenticated');
