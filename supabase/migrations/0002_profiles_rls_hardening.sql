-- Harden profiles RLS: the update policy from 0001 had no WITH CHECK, so a
-- user could UPDATE their own row and reassign its user_id to someone else's
-- (USING is only checked against the row's state before the update). Also
-- scope all profiles policies explicitly `to authenticated` rather than
-- relying solely on auth.uid() returning null for anon.

drop policy "profiles_select_own" on profiles;
drop policy "profiles_insert_own" on profiles;
drop policy "profiles_update_own" on profiles;

create policy "profiles_select_own" on profiles
  for select to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own" on profiles
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
