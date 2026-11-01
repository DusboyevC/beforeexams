-- BeforeExams study tracker. Paste into Supabase > SQL Editor and press Run, once.
-- Row level security means each student can only read and change their own rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  level text check (level in ('ig', 'al')),
  subjects text[] not null default '{}',
  exam_session text,
  target_percent int check (target_percent between 1 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject text not null,
  paper text,
  exam_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject text not null,
  kind text not null check (kind in ('paper', 'topical', 'mock')),
  item_id text,
  label text not null,
  topic text,
  marks numeric not null check (marks >= 0),
  total numeric not null check (total > 0),
  minutes int check (minutes >= 0),
  taken_on date not null default current_date,
  created_at timestamptz not null default now(),
  check (marks <= total)
);

create index if not exists exam_dates_user on public.exam_dates (user_id);
create index if not exists scores_user on public.scores (user_id, taken_on desc);

alter table public.profiles enable row level security;
alter table public.exam_dates enable row level security;
alter table public.scores enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own exam dates" on public.exam_dates;
create policy "own exam dates" on public.exam_dates for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own scores" on public.scores;
create policy "own scores" on public.scores for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles, public.exam_dates, public.scores to authenticated;
