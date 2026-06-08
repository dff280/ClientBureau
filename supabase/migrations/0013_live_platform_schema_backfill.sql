-- Client Bureau live platform schema backfill.
-- Apply after 0012 if /api/health reports missing platform columns.
-- This migration is intentionally idempotent and only adds private ops fields.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_readiness_status') then
    create type public.service_readiness_status as enum (
      'incomplete',
      'ready_for_checkout',
      'fee_due',
      'submitted',
      'under_review',
      'needs_more_info',
      'blocked',
      'closed'
    );
  end if;
end $$;

alter type public.service_readiness_status add value if not exists 'incomplete';
alter type public.service_readiness_status add value if not exists 'ready_for_checkout';
alter type public.service_readiness_status add value if not exists 'fee_due';
alter type public.service_readiness_status add value if not exists 'submitted';
alter type public.service_readiness_status add value if not exists 'under_review';
alter type public.service_readiness_status add value if not exists 'needs_more_info';
alter type public.service_readiness_status add value if not exists 'blocked';
alter type public.service_readiness_status add value if not exists 'closed';

alter table if exists public.contract_packets
  add column if not exists client_legal_name text,
  add column if not exists contractor_legal_name text,
  add column if not exists scope_summary text not null default 'Agreement scope will be confirmed before signing.',
  add column if not exists included_work text not null default 'Included work will be confirmed before signing.',
  add column if not exists excluded_work text not null default 'Excluded work requires written approval or change order.',
  add column if not exists payment_terms text not null default 'Payment terms will be confirmed before signing.',
  add column if not exists milestone_schedule jsonb not null default '[]'::jsonb,
  add column if not exists change_order_policy text not null default 'Change orders should be reviewed and approved in writing before additional work begins.',
  add column if not exists cancellation_policy text not null default 'Cancellation, pause, and rescheduling terms should be documented in writing.',
  add column if not exists project_start_date date,
  add column if not exists project_end_date date,
  add column if not exists signer_name text,
  add column if not exists signature_name_hash text,
  add column if not exists signer_email_hash text,
  add column if not exists signer_ip_hash text,
  add column if not exists signer_user_agent_hash text,
  add column if not exists signed_snapshot jsonb,
  add column if not exists signed_digest text,
  add column if not exists signed_recorded_at timestamptz;

alter table if exists public.managed_recovery_cases
  add column if not exists readiness_status public.service_readiness_status,
  add column if not exists readiness_score integer check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  add column if not exists readiness_checked_at timestamptz,
  add column if not exists fee_paid_at timestamptz,
  add column if not exists submitted_for_review_at timestamptz;

alter table if exists public.florida_lien_cases
  add column if not exists readiness_status public.service_readiness_status,
  add column if not exists readiness_score integer check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  add column if not exists readiness_checked_at timestamptz,
  add column if not exists fee_paid_at timestamptz,
  add column if not exists submitted_for_review_at timestamptz;

create index if not exists contract_packets_signed_recorded_idx
  on public.contract_packets(contractor_id, signed_recorded_at desc)
  where signed_recorded_at is not null;

create index if not exists contract_packets_signed_digest_idx
  on public.contract_packets(signed_digest)
  where signed_digest is not null;

create index if not exists idx_managed_recovery_readiness
  on public.managed_recovery_cases(contractor_id, readiness_status, updated_at desc);

create index if not exists idx_florida_lien_readiness
  on public.florida_lien_cases(contractor_id, readiness_status, updated_at desc);
