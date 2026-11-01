-- BeforeExams admin panel: counts visits and gives the owner private stats.
-- Paste into Supabase > SQL Editor and press Run, once. Safe to run again.
-- If you log in to the site with a different email, change it on the line marked OWNER EMAIL.

-- Daily totals only. No names, emails or IP addresses are stored here.
create table if not exists public.site_stats (
  day date primary key,
  visits bigint not null default 0,
  visitors bigint not null default 0
);
alter table public.site_stats enable row level security;

-- Who may open the admin page. Nobody can read or change this table from the website.
create table if not exists public.be_admins (email text primary key);
alter table public.be_admins enable row level security;
insert into public.be_admins (email) values ('dusboyevc@gmail.com') on conflict do nothing; -- OWNER EMAIL

-- Stops anyone giving themselves a higher role by editing their own profile.
create or replace function public.be_keep_role() returns trigger language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    if tg_op = 'UPDATE' then new.role := old.role;
    elsif new.role in ('owner', 'admin') then raise exception 'role not allowed';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists be_keep_role on public.profiles;
create trigger be_keep_role before insert or update on public.profiles
  for each row execute function public.be_keep_role();

create or replace function public.be_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u join public.be_admins a on lower(a.email) = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;

create or replace function public.be_log_visit(new_visitor boolean) returns void
language sql security definer set search_path = '' as $$
  insert into public.site_stats (day, visits, visitors)
  values ((now() at time zone 'Asia/Tashkent')::date, 1, case when new_visitor then 1 else 0 end)
  on conflict (day) do update set
    visits = public.site_stats.visits + 1,
    visitors = public.site_stats.visitors + excluded.visitors;
$$;

create or replace function public.be_admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Tashkent')::date;
begin
  if not public.be_is_admin() then raise exception 'not allowed'; end if;
  return jsonb_build_object(
    'accounts', (select count(*) from auth.users where email_confirmed_at is not null),
    'unconfirmed', (select count(*) from auth.users where email_confirmed_at is null),
    'new7', (select count(*) from auth.users where email_confirmed_at is not null and created_at > now() - interval '7 days'),
    'new30', (select count(*) from auth.users where email_confirmed_at is not null and created_at > now() - interval '30 days'),
    'active7', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'igcse', (select count(*) from public.profiles where level = 'ig'),
    'alevel', (select count(*) from public.profiles where level = 'al'),
    'visits', (select coalesce(sum(visits), 0) from public.site_stats),
    'today', (select coalesce(sum(visits), 0) from public.site_stats where day = today),
    'visitors_today', (select coalesce(sum(visitors), 0) from public.site_stats where day = today),
    'visits7', (select coalesce(sum(visits), 0) from public.site_stats where day > today - 7),
    'first_day', (select min(day) from public.site_stats),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'visits', coalesce(s.visits, 0), 'visitors', coalesce(s.visitors, 0)) order by d), '[]'::jsonb)
             from generate_series(today - 29, today, interval '1 day') g(d0)
             cross join lateral (select g.d0::date as d) x
             left join public.site_stats s on s.day = x.d)
  );
end $$;

revoke all on function public.be_is_admin() from public;
revoke all on function public.be_log_visit(boolean) from public;
revoke all on function public.be_admin_stats() from public;
grant execute on function public.be_is_admin() to authenticated;
grant execute on function public.be_log_visit(boolean) to anon, authenticated;
grant execute on function public.be_admin_stats() to authenticated;

-- Mistake reports from students. Only the owner can read them.
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  item_id text not null,
  title text not null,
  kind text not null,
  question text,
  note text,
  done boolean not null default false
);
alter table public.reports enable row level security;

create or replace function public.be_report(item text, item_title text, report_kind text, q text, msg text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.reports where created_at > now() - interval '1 day') >= 300 then
    raise exception 'too many reports today';
  end if;
  insert into public.reports (item_id, title, kind, question, note)
  values (left(item, 20), left(item_title, 200), left(report_kind, 40), left(q, 20), left(msg, 500));
end $$;

create or replace function public.be_admin_reports() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.be_is_admin() then raise exception 'not allowed'; end if;
  return coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc)
    from (select * from public.reports where not done order by created_at desc limit 100) r), '[]'::jsonb);
end $$;

create or replace function public.be_report_done(report bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.be_is_admin() then raise exception 'not allowed'; end if;
  update public.reports set done = true where id = report;
end $$;

revoke all on function public.be_report(text, text, text, text, text) from public;
revoke all on function public.be_admin_reports() from public;
revoke all on function public.be_report_done(bigint) from public;
grant execute on function public.be_report(text, text, text, text, text) to anon, authenticated;
grant execute on function public.be_admin_reports() to authenticated;
grant execute on function public.be_report_done(bigint) to authenticated;

notify pgrst, 'reload schema';

-- This last part shows whether the owner email has a confirmed account.
select a.email, u.email_confirmed_at is not null as account_ready
from public.be_admins a left join auth.users u on lower(u.email) = lower(a.email);
