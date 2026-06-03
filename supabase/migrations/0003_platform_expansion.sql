-- Client Bureau platform expansion.
-- Supabase-ready tables for Contractor Risk Ops and Admin Moderation CRM.
-- Keep PLATFORM_FEATURE_DATA_MODE=mock until this migration is applied and the adapter is wired.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'watchlist_status') then
    create type public.watchlist_status as enum ('active', 'cleared');
  end if;

  if not exists (select 1 from pg_type where typname = 'watchlist_alert_event_type') then
    create type public.watchlist_alert_event_type as enum (
      'new_report',
      'new_discussion',
      'client_response',
      'dispute_opened',
      'case_resolved',
      'risk_score_changed',
      'payment_status_changed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'report_resolution_status') then
    create type public.report_resolution_status as enum (
      'Unresolved',
      'Partially paid',
      'Paid in full',
      'Settled',
      'Disputed',
      'Resolved',
      'Removed',
      'Admin verified'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'report_draft_status') then
    create type public.report_draft_status as enum ('draft', 'ready_to_submit', 'submitted');
  end if;

  if not exists (select 1 from pg_type where typname = 'evidence_review_status') then
    create type public.evidence_review_status as enum ('missing', 'uploaded', 'review_pending', 'reviewed', 'needs_more_info');
  end if;

  if not exists (select 1 from pg_type where typname = 'moderation_priority') then
    create type public.moderation_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'moderation_case_status') then
    create type public.moderation_case_status as enum ('unassigned', 'assigned', 'escalated', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'moderation_decision_reason') then
    create type public.moderation_decision_reason as enum (
      'approved_with_edits',
      'insufficient_evidence',
      'private_information',
      'neutrality_issue',
      'duplicate_report',
      'policy_rejection'
    );
  end if;
end $$;

alter table public.client_reports
  add column if not exists resolution_status public.report_resolution_status;

create table if not exists public.contractor_watchlist_items (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  status public.watchlist_status not null default 'active',
  watch_reason text not null,
  alert_level public.moderation_priority not null default 'normal',
  last_signal text not null default '',
  private_match boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist_alerts (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_id uuid references public.client_profiles(id) on delete cascade,
  profile_slug text,
  event_type public.watchlist_alert_event_type not null,
  title text not null,
  description text not null,
  severity public.moderation_priority not null default 'normal',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.contractor_verification_badges (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  label text not null,
  verified_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.report_drafts (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  project_type text not null,
  estimated_value numeric not null default 0,
  amount_at_risk numeric not null default 0,
  summary text not null,
  next_step text not null,
  status public.report_draft_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table if not exists public.client_intake_assessments (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_name text not null,
  city text not null,
  state text not null,
  project_value numeric not null default 0,
  deposit_received boolean not null default false,
  contract_signed boolean not null default false,
  private_match_confirmed boolean not null default false,
  recommendation text not null,
  score integer not null check (score >= 0 and score <= 100),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_review_summaries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.client_reports(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  status public.evidence_review_status not null default 'uploaded',
  label text not null,
  file_count integer not null default 0,
  reviewed_count integer not null default 0,
  last_updated_at timestamptz not null default now()
);

create table if not exists public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.client_reports(id) on delete set null,
  discussion_id uuid references public.community_discussions(id) on delete set null,
  client_id uuid references public.client_profiles(id) on delete set null,
  title text not null,
  summary text not null,
  priority public.moderation_priority not null default 'normal',
  status public.moderation_case_status not null default 'unassigned',
  queue_stage text not null default 'triage',
  assigned_to uuid references public.users(id) on delete set null,
  due_at timestamptz not null default now() + interval '3 days',
  decision_reason public.moderation_decision_reason,
  escalation_note text,
  public_summary_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bulk_import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  created_by uuid references public.users(id) on delete set null,
  total_rows integer not null default 0,
  ready_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  imported_rows integer not null default 0,
  status text not null default 'staged',
  created_at timestamptz not null default now()
);

create index if not exists contractor_watchlist_contractor_idx
  on public.contractor_watchlist_items(contractor_id, status, updated_at desc);

create index if not exists watchlist_alerts_contractor_idx
  on public.watchlist_alerts(contractor_id, severity, created_at desc);

create index if not exists contractor_verification_badges_contractor_idx
  on public.contractor_verification_badges(contractor_id, label);

create index if not exists report_drafts_contractor_idx
  on public.report_drafts(contractor_id, status, updated_at desc);

create index if not exists intake_assessments_contractor_idx
  on public.client_intake_assessments(contractor_id, created_at desc);

create index if not exists moderation_cases_queue_idx
  on public.moderation_cases(status, priority, due_at);

create index if not exists moderation_cases_assignee_idx
  on public.moderation_cases(assigned_to, status);

alter table public.contractor_watchlist_items enable row level security;
alter table public.watchlist_alerts enable row level security;
alter table public.contractor_verification_badges enable row level security;
alter table public.report_drafts enable row level security;
alter table public.client_intake_assessments enable row level security;
alter table public.evidence_review_summaries enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.bulk_import_batches enable row level security;

drop policy if exists "Contractors manage their watchlist" on public.contractor_watchlist_items;
create policy "Contractors manage their watchlist"
on public.contractor_watchlist_items for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors read their watchlist alerts" on public.watchlist_alerts;
create policy "Contractors read their watchlist alerts"
on public.watchlist_alerts for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Admins manage watchlist alerts" on public.watchlist_alerts;
create policy "Admins manage watchlist alerts"
on public.watchlist_alerts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read verification badges" on public.contractor_verification_badges;
create policy "Contractors read verification badges"
on public.contractor_verification_badges for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Admins manage verification badges" on public.contractor_verification_badges;
create policy "Admins manage verification badges"
on public.contractor_verification_badges for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors manage their report drafts" on public.report_drafts;
create policy "Contractors manage their report drafts"
on public.report_drafts for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their intake assessments" on public.client_intake_assessments;
create policy "Contractors manage their intake assessments"
on public.client_intake_assessments for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors read their evidence review summaries" on public.evidence_review_summaries;
create policy "Contractors read their evidence review summaries"
on public.evidence_review_summaries for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Admins manage moderation cases" on public.moderation_cases;
create policy "Admins manage moderation cases"
on public.moderation_cases for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage bulk import batches" on public.bulk_import_batches;
create policy "Admins manage bulk import batches"
on public.bulk_import_batches for all
using (public.is_admin())
with check (public.is_admin());
