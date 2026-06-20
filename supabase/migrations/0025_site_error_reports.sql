-- Admin-visible runtime and user-reported site issue log.
-- This table is intentionally separate from audit_logs so staff decisions stay distinct from bug telemetry.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'site_error_severity') then
    create type public.site_error_severity as enum ('info', 'low', 'medium', 'high', 'critical');
  end if;

  if not exists (select 1 from pg_type where typname = 'site_error_status') then
    create type public.site_error_status as enum ('new', 'triaged', 'in_progress', 'resolved', 'ignored');
  end if;
end $$;

create table if not exists public.site_error_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references public.users(id) on delete set null,
  reporter_role text,
  severity public.site_error_severity not null default 'medium',
  status public.site_error_status not null default 'new',
  source text not null default 'manual',
  route text not null default '/',
  page_title text,
  message text not null,
  notes text,
  user_agent text,
  browser_language text,
  viewport_width integer,
  viewport_height integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists site_error_reports_status_idx
  on public.site_error_reports(status, severity, created_at desc);

create index if not exists site_error_reports_route_idx
  on public.site_error_reports(route, created_at desc);

drop trigger if exists site_error_reports_set_updated_at on public.site_error_reports;
create trigger site_error_reports_set_updated_at
before update on public.site_error_reports
for each row execute function public.set_updated_at();

alter table public.site_error_reports enable row level security;

drop policy if exists "Anyone can create site error reports" on public.site_error_reports;
create policy "Anyone can create site error reports"
on public.site_error_reports for insert
with check (true);

drop policy if exists "Admins manage site error reports" on public.site_error_reports;
create policy "Admins manage site error reports"
on public.site_error_reports for all
using (public.is_admin())
with check (public.is_admin());

comment on table public.site_error_reports is
  'Internal bug and runtime issue reports. Do not store passwords, raw evidence, private contract snapshots, or sensitive request bodies.';
