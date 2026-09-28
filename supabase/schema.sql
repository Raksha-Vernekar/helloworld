-- ============================================================
-- Konkani Quest — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ============================================================

-- ---------- users ----------
-- Profile row for every auth user. Mirrors auth.users via trigger.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null unique,
  points integer not null default 0,
  streak integer not null default 0,
  last_active_date date,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- words ----------
create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  english_word text not null,
  konkani_word text not null,
  pronunciation text not null default '',
  category text not null default 'general',
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  mnemonic text not null default '',
  image_prompt text not null default '',
  image_url text not null default '',
  example_sentence text not null default '',
  fun_fact_trigger uuid,
  created_at timestamptz not null default now()
);

-- ---------- progress ----------
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  word_id uuid not null references public.words (id) on delete cascade,
  status text not null default 'new'
    check (status in ('new', 'learning', 'mastered')),
  attempts integer not null default 0,
  last_seen timestamptz not null default now(),
  unique (user_id, word_id)
);

-- ---------- fun_facts ----------
create table if not exists public.fun_facts (
  id uuid primary key default gen_random_uuid(),
  fact_text text not null,
  unlock_points integer not null default 50,
  created_at timestamptz not null default now()
);

-- Optional FK from words.fun_fact_trigger -> fun_facts
alter table public.words
  drop constraint if exists words_fun_fact_trigger_fkey;
alter table public.words
  add constraint words_fun_fact_trigger_fkey
  foreign key (fun_fact_trigger) references public.fun_facts (id) on delete set null;

-- ============================================================
-- Auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.users enable row level security;
alter table public.words enable row level security;
alter table public.progress enable row level security;
alter table public.fun_facts enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  );
$$;

-- users: read/update own row; admins read all
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- words: anyone signed in can read; only admins write
drop policy if exists "words_select_all" on public.words;
create policy "words_select_all" on public.words
  for select using (true);

drop policy if exists "words_admin_write" on public.words;
create policy "words_admin_write" on public.words
  for all using (public.is_admin()) with check (public.is_admin());

-- progress: users manage their own rows
drop policy if exists "progress_own" on public.progress;
create policy "progress_own" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- fun_facts: anyone signed in can read; only admins write
drop policy if exists "fun_facts_select_all" on public.fun_facts;
create policy "fun_facts_select_all" on public.fun_facts
  for select using (true);

drop policy if exists "fun_facts_admin_write" on public.fun_facts;
create policy "fun_facts_admin_write" on public.fun_facts
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- To make a user an admin, run:
--   update public.users set is_admin = true where email = 'you@example.com';
-- ============================================================
