-- Client Bureau contractor operations workspace.
-- Apply after 0004 when PLATFORM_FEATURE_DATA_MODE is ready to move from mock to supabase.
-- These tables are private contractor/admin records. They must not be exposed on public profiles.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_pipeline_stage') then
    create type public.client_pipeline_stage as enum (
      'new_lead',
      'screening',
      'contract_pending',
      'active_job',
      'payment_follow_up',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_recovery_attempt_outcome') then
    create type public.payment_recovery_attempt_outcome as enum (
      'no_response',
      'client_responded',
      'payment_promised',
      'payment_received',
      'dispute_raised',
      'needs_follow_up'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_plan_status') then
    create type public.payment_plan_status as enum (
      'proposed',
      'accepted',
      'active',
      'completed',
      'missed',
      'paused'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_packet_status') then
    create type public.contract_packet_status as enum (
      'draft',
      'review_ready',
      'sent',
      'signed',
      'expired',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_share_status') then
    create type public.contract_share_status as enum (
      'draft',
      'sent',
      'viewed',
      'client_joined',
      'signed',
      'payment_pending',
      'completed',
      'expired'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_signature_status') then
    create type public.contract_signature_status as enum (
      'not_sent',
      'awaiting_client',
      'client_signed',
      'contractor_signed',
      'fully_signed',
      'declined'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'client_invite_status') then
    create type public.client_invite_status as enum (
      'not_invited',
      'invited',
      'joined'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_payment_mode') then
    create type public.contract_payment_mode as enum (
      'none',
      'deposit_request',
      'milestone_schedule',
      'platform_review'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'evidence_vault_status') then
    create type public.evidence_vault_status as enum (
      'uploaded',
      'mapped',
      'review_pending',
      'reviewed',
      'needs_more_info',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_saved_view_scope') then
    create type public.admin_saved_view_scope as enum (
      'reports',
      'clients',
      'contractors',
      'discussions',
      'uploads',
      'recovery',
      'contracts',
      'audit'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'recovery_compliance_status') then
    create type public.recovery_compliance_status as enum (
      'pending',
      'approved',
      'needs_changes',
      'blocked'
    );
  end if;
end $$;

create table if not exists public.client_pipeline_items (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  city text not null,
  state text not null,
  stage public.client_pipeline_stage not null default 'new_lead',
  priority public.moderation_priority not null default 'normal',
  estimated_value numeric not null default 0,
  next_action text not null,
  due_at timestamptz,
  private_match boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_risk_rooms (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  city text not null,
  state text not null,
  headline text not null,
  summary text not null,
  linked_search_ids uuid[] not null default array[]::uuid[],
  linked_watchlist_ids uuid[] not null default array[]::uuid[],
  linked_assessment_ids uuid[] not null default array[]::uuid[],
  linked_contract_ids uuid[] not null default array[]::uuid[],
  linked_report_draft_ids uuid[] not null default array[]::uuid[],
  linked_evidence_ids uuid[] not null default array[]::uuid[],
  linked_recovery_ids uuid[] not null default array[]::uuid[],
  linked_resolution_ids uuid[] not null default array[]::uuid[],
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_recovery_attempts (
  id uuid primary key default gen_random_uuid(),
  recovery_case_id uuid not null references public.payment_recovery_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  channel public.recovery_channel not null,
  attempted_at timestamptz not null,
  outcome public.payment_recovery_attempt_outcome not null,
  note text not null,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  recovery_case_id uuid not null references public.payment_recovery_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  total_amount numeric not null default 0,
  installment_amount numeric not null default 0,
  due_day integer not null check (due_day between 1 and 31),
  status public.payment_plan_status not null default 'proposed',
  next_due_date date,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_packets (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_name text not null,
  project_type text not null,
  template_type public.contract_template_type not null,
  status public.contract_packet_status not null default 'draft',
  packet_value numeric not null default 0,
  deposit_required numeric not null default 0,
  milestone_count integer not null default 0,
  required_before_scheduling boolean not null default false,
  next_action text not null,
  share_token text unique,
  share_url text,
  client_email_hash text,
  client_email_masked text,
  client_invite_status public.client_invite_status not null default 'not_invited',
  signature_status public.contract_signature_status not null default 'not_sent',
  share_status public.contract_share_status not null default 'draft',
  payment_mode public.contract_payment_mode not null default 'none',
  payment_summary text,
  client_signed_at timestamptz,
  contractor_signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_vault_items (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  report_id uuid references public.client_reports(id) on delete set null,
  client_name text not null,
  label text not null,
  file_category text not null,
  status public.evidence_vault_status not null default 'uploaded',
  private_storage_path text not null,
  public_summary text not null,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_saved_views (
  id uuid primary key default gen_random_uuid(),
  scope public.admin_saved_view_scope not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_queue_assignments (
  id uuid primary key default gen_random_uuid(),
  entity_type public.admin_saved_view_scope not null,
  entity_id text not null,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_to_name text not null,
  priority public.moderation_priority not null default 'normal',
  due_at timestamptz not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recovery_compliance_reviews (
  id uuid primary key default gen_random_uuid(),
  recovery_case_id uuid references public.payment_recovery_cases(id) on delete cascade,
  lien_notice_draft_id uuid references public.lien_notice_drafts(id) on delete cascade,
  contract_packet_id uuid references public.contract_packets(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  status public.recovery_compliance_status not null default 'pending',
  decision_reason text not null,
  required_changes text[] not null default array[]::text[],
  public_visibility_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    recovery_case_id is not null
    or lien_notice_draft_id is not null
    or contract_packet_id is not null
  )
);

create index if not exists client_pipeline_contractor_idx
  on public.client_pipeline_items(contractor_id, stage, priority, due_at);

create index if not exists risk_rooms_contractor_idx
  on public.client_risk_rooms(contractor_id, last_activity_at desc);

create index if not exists recovery_attempts_case_idx
  on public.payment_recovery_attempts(recovery_case_id, attempted_at desc);

create index if not exists payment_plans_case_idx
  on public.payment_plans(recovery_case_id, status, next_due_date);

create index if not exists contract_packets_contractor_idx
  on public.contract_packets(contractor_id, status, updated_at desc);

create index if not exists contract_packets_share_token_idx
  on public.contract_packets(share_token)
  where share_token is not null;

create index if not exists evidence_vault_contractor_idx
  on public.evidence_vault_items(contractor_id, status, updated_at desc);

alter table public.client_pipeline_items enable row level security;
alter table public.client_risk_rooms enable row level security;
alter table public.payment_recovery_attempts enable row level security;
alter table public.payment_plans enable row level security;
alter table public.contract_packets enable row level security;
alter table public.evidence_vault_items enable row level security;
alter table public.admin_saved_views enable row level security;
alter table public.admin_queue_assignments enable row level security;
alter table public.recovery_compliance_reviews enable row level security;

drop policy if exists "Contractors manage their pipeline items" on public.client_pipeline_items;
create policy "Contractors manage their pipeline items"
on public.client_pipeline_items for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their risk rooms" on public.client_risk_rooms;
create policy "Contractors manage their risk rooms"
on public.client_risk_rooms for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their recovery attempts" on public.payment_recovery_attempts;
create policy "Contractors manage their recovery attempts"
on public.payment_recovery_attempts for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their payment plans" on public.payment_plans;
create policy "Contractors manage their payment plans"
on public.payment_plans for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their contract packets" on public.contract_packets;
create policy "Contractors manage their contract packets"
on public.contract_packets for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their evidence vault" on public.evidence_vault_items;
create policy "Contractors manage their evidence vault"
on public.evidence_vault_items for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Admins manage admin saved views" on public.admin_saved_views;
create policy "Admins manage admin saved views"
on public.admin_saved_views for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage queue assignments" on public.admin_queue_assignments;
create policy "Admins manage queue assignments"
on public.admin_queue_assignments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage recovery compliance reviews" on public.recovery_compliance_reviews;
create policy "Admins manage recovery compliance reviews"
on public.recovery_compliance_reviews for all
using (public.is_admin())
with check (public.is_admin());
