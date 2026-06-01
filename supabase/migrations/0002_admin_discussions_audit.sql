-- Client Bureau admin/discussion upgrade.
-- Adds moderated public discussion entries and immutable admin audit history.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'discussion_category') then
    create type public.discussion_category as enum (
      'Contractor Experience',
      'Client Response',
      'Resolution Update',
      'Supporting Context',
      'Dispute / Correction',
      'Reference / Verification'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'discussion_status') then
    create type public.discussion_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_entity_type') then
    create type public.admin_entity_type as enum (
      'user',
      'contractor',
      'client',
      'report',
      'discussion',
      'evidence',
      'bulk_upload',
      'setting'
    );
  end if;
end $$;

create table if not exists public.community_discussions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  report_id uuid references public.client_reports(id) on delete set null,
  author_name text not null,
  author_email_hash text not null,
  relationship_category public.discussion_category not null,
  comment_body text not null,
  attachment_url text,
  status public.discussion_status not null default 'pending',
  is_verified boolean not null default false,
  moderator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  actor_name text,
  action text not null,
  entity_type public.admin_entity_type not null,
  entity_id text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists community_discussions_public_idx
  on public.community_discussions(client_id, status, created_at desc);

create index if not exists community_discussions_report_idx
  on public.community_discussions(report_id);

create index if not exists audit_logs_created_idx
  on public.audit_logs(created_at desc);

drop trigger if exists community_discussions_set_updated_at on public.community_discussions;
create trigger community_discussions_set_updated_at
before update on public.community_discussions
for each row execute function public.set_updated_at();

alter table public.community_discussions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Approved community discussions are public" on public.community_discussions;
create policy "Approved community discussions are public"
on public.community_discussions for select
using (status = 'approved' or public.is_admin());

drop policy if exists "Anyone can submit pending community discussion" on public.community_discussions;
create policy "Anyone can submit pending community discussion"
on public.community_discussions for insert
with check (status = 'pending');

drop policy if exists "Admins manage community discussions" on public.community_discussions;
create policy "Admins manage community discussions"
on public.community_discussions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs"
on public.audit_logs for select
using (public.is_admin());

drop policy if exists "Admins create audit logs" on public.audit_logs;
create policy "Admins create audit logs"
on public.audit_logs for insert
with check (public.is_admin());
