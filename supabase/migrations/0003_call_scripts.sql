-- Phase 5: per-university call scripts. course_id is ON DELETE SET NULL
-- (not cascade) because scripts/scrape/run.ts deletes+reinserts a
-- university's courses on every scrape (see scrapeOne()) — a saved script
-- must survive its source course row disappearing on a rescrape.
-- course_name is a snapshot at save time for that same reason.

create table if not exists call_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id uuid not null references universities(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  course_name text,
  script_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, university_id)
);

create index if not exists call_scripts_user_id_idx on call_scripts(user_id);

-- RLS follows the 0002 hardened pattern: `to authenticated` explicitly
-- (not relying solely on auth.uid() returning null for anon), and UPDATE
-- has both USING and WITH CHECK so a user can't reassign a row's user_id.
alter table call_scripts enable row level security;

create policy "call_scripts_select_own" on call_scripts
  for select to authenticated
  using (auth.uid() = user_id);

create policy "call_scripts_insert_own" on call_scripts
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "call_scripts_update_own" on call_scripts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "call_scripts_delete_own" on call_scripts
  for delete to authenticated
  using (auth.uid() = user_id);
