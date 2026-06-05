-- Client Bureau revenue workflow hardening
-- Adds private readiness/precheck fields for managed recovery and Florida lien service.

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

alter table public.managed_recovery_cases
  add column if not exists readiness_status public.service_readiness_status,
  add column if not exists readiness_score integer check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  add column if not exists readiness_checked_at timestamptz,
  add column if not exists fee_paid_at timestamptz,
  add column if not exists submitted_for_review_at timestamptz;

alter table public.florida_lien_cases
  add column if not exists readiness_status public.service_readiness_status,
  add column if not exists readiness_score integer check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  add column if not exists readiness_checked_at timestamptz,
  add column if not exists fee_paid_at timestamptz,
  add column if not exists submitted_for_review_at timestamptz;

create table if not exists public.case_document_links (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('managed_recovery', 'florida_lien')),
  entity_id uuid not null,
  evidence_vault_item_id uuid not null references public.evidence_vault_items(id) on delete cascade,
  document_label text not null,
  document_category text not null check (document_category in ('invoice', 'screenshot', 'contract', 'photo', 'pdf', 'other')),
  public_summary text not null default 'Document reviewed privately.',
  created_at timestamptz not null default now()
);

create index if not exists idx_case_document_links_contractor
  on public.case_document_links(contractor_id, created_at desc);

create index if not exists idx_case_document_links_entity
  on public.case_document_links(entity_type, entity_id);

create index if not exists idx_managed_recovery_readiness
  on public.managed_recovery_cases(contractor_id, readiness_status, updated_at desc);

create index if not exists idx_florida_lien_readiness
  on public.florida_lien_cases(contractor_id, readiness_status, updated_at desc);

alter table public.case_document_links enable row level security;

drop policy if exists "Contractors can read their case document links" on public.case_document_links;
create policy "Contractors can read their case document links"
  on public.case_document_links for select
  using (
    contractor_id in (
      select id from public.contractor_profiles
      where user_id = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

drop policy if exists "Contractors can create their case document links" on public.case_document_links;
create policy "Contractors can create their case document links"
  on public.case_document_links for insert
  with check (
    contractor_id in (
      select id from public.contractor_profiles
      where user_id = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

drop policy if exists "Admins can manage case document links" on public.case_document_links;
create policy "Admins can manage case document links"
  on public.case_document_links for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

