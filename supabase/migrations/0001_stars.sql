-- The star jar: short notes chuchu folds into paper stars and drops in.
-- Run this once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.stars (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 280),
  color text not null default 'petal'
    check (color in ('petal', 'blush', 'lavender', 'honey', 'rose')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stars_created_at_idx on public.stars (created_at);

alter table public.stars enable row level security;

-- The app talks to this table with a publishable (anon) key from server-side
-- route handlers only. These policies scope that key to exactly this table.
-- The gift lives on an unshared URL; there is no per-user auth.
drop policy if exists "stars are readable" on public.stars;
create policy "stars are readable"
  on public.stars for select
  to anon, authenticated
  using (true);

drop policy if exists "stars can be added" on public.stars;
create policy "stars can be added"
  on public.stars for insert
  to anon, authenticated
  with check (char_length(text) between 1 and 280);

drop policy if exists "stars can be rewritten" on public.stars;
create policy "stars can be rewritten"
  on public.stars for update
  to anon, authenticated
  using (true)
  with check (char_length(text) between 1 and 280);

drop policy if exists "stars can be taken out" on public.stars;
create policy "stars can be taken out"
  on public.stars for delete
  to anon, authenticated
  using (true);
