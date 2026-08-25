-- Phase 1 schema: universities, courses, profiles
-- Access to all app features is never gated on ucas_status; that field is
-- informational only (feeds the call script), per the app spec.

create extension if not exists "pgcrypto";

create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clearing_phone text,
  website_url text,
  last_scraped_at timestamptz,
  scrape_status text not null default 'ok'
    check (scrape_status in ('ok', 'manual_fallback')),
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  name text not null,
  subject_area text,
  entry_requirements text,
  vacancy_status text not null default 'unclear'
    check (vacancy_status in ('open', 'closed', 'unclear')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists courses_university_id_idx on courses(university_id);
create index if not exists courses_subject_area_idx on courses(subject_area);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  grades jsonb not null default '[]',
  top_3_universities jsonb not null default '[]',
  backup_courses jsonb not null default '[]',
  ucas_status text not null default 'not_confirmed'
    check (ucas_status in (
      'confirmed_firm',
      'confirmed_insurance',
      'not_confirmed',
      'self_releasing',
      'waiting'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: a user can only read/write their own profile.
-- universities/courses are public read data (no RLS needed beyond default
-- deny-all-writes from the anon key; scraper writes via service role).
alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = user_id);

alter table universities enable row level security;
alter table courses enable row level security;

create policy "universities_public_read" on universities
  for select using (true);

create policy "courses_public_read" on courses
  for select using (true);
