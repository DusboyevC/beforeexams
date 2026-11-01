-- BeforeExams fix: adds the study plan columns to the older profiles table. Keeps all existing rows.
-- Paste into Supabase > SQL Editor and press Run, once.

alter table public.profiles add column if not exists level text;
alter table public.profiles add column if not exists exam_session text;
alter table public.profiles add column if not exists target_percent int;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles alter column email drop not null;

alter table public.profiles drop constraint if exists profiles_level_check;
alter table public.profiles add constraint profiles_level_check check (level in ('ig', 'al'));
alter table public.profiles drop constraint if exists profiles_target_percent_check;
alter table public.profiles add constraint profiles_target_percent_check check (target_percent between 1 and 100);

alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

grant select, insert, update, delete on public.profiles to authenticated;

notify pgrst, 'reload schema';

-- This last part lists the table's columns and access rules so they can be checked.
select 'column' as what, column_name as name, data_type as detail, is_nullable as extra
from information_schema.columns where table_schema = 'public' and table_name = 'profiles'
union all
select 'rule', policyname, cmd, roles::text from pg_policies where schemaname = 'public' and tablename = 'profiles';
