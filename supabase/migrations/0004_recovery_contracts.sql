-- Client Bureau recovery and contract operations.
-- Apply after 0003 when PLATFORM_FEATURE_DATA_MODE is ready to move from mock to supabase.
-- These tables are private contractor/admin operations records and must never render on public profiles.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_recovery_status') then
    create type public.payment_recovery_status as enum (
      'draft',
      'ready_to_contact',
      'contacted',
      'payment_plan',
      'resolved',
      'paused'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'recovery_channel') then
    create type public.recovery_channel as enum ('email', 'phone', 'letter', 'client_portal');
  end if;

  if not exists (select 1 from pg_type where typname = 'lien_notice_status') then
    create type public.lien_notice_status as enum (
      'deadline_review',
      'draft',
      'ready_for_review',
      'sent',
      'released',
      'not_eligible'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_template_type') then
    create type public.contract_template_type as enum (
      'service_agreement',
      'change_order',
      'payment_plan',
      'completion_certificate',
      'notice_of_nonpayment'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contract_document_status') then
    create type public.contract_document_status as enum ('draft', 'sent', 'signed', 'expired', 'archived');
  end if;
end $$;

create table if not exists public.payment_recovery_cases (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  city text not null,
  state text not null,
  amount_due numeric not null default 0,
  invoice_age_days integer not null default 0,
  preferred_channel public.recovery_channel not null default 'email',
  status public.payment_recovery_status not null default 'draft',
  priority public.moderation_priority not null default 'normal',
  last_contact_at timestamptz,
  next_action text not null,
  summary text not null,
  compliance_flags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lien_notice_drafts (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  project_type text not null,
  property_city text not null,
  state text not null,
  amount_due numeric not null default 0,
  last_work_date date not null,
  target_send_date date,
  status public.lien_notice_status not null default 'deadline_review',
  required_review boolean not null default true,
  next_step text not null,
  jurisdiction_note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contract_workspace_items (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  project_type text not null,
  template_type public.contract_template_type not null,
  contract_value numeric not null default 0,
  deposit_required numeric not null default 0,
  milestone_billing boolean not null default false,
  status public.contract_document_status not null default 'draft',
  next_step text not null,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_recovery_contractor_idx
  on public.payment_recovery_cases(contractor_id, status, priority, updated_at desc);

create index if not exists lien_notice_contractor_idx
  on public.lien_notice_drafts(contractor_id, status, updated_at desc);

create index if not exists contract_workspace_contractor_idx
  on public.contract_workspace_items(contractor_id, status, updated_at desc);

alter table public.payment_recovery_cases enable row level security;
alter table public.lien_notice_drafts enable row level security;
alter table public.contract_workspace_items enable row level security;

drop policy if exists "Contractors manage their payment recovery cases" on public.payment_recovery_cases;
create policy "Contractors manage their payment recovery cases"
on public.payment_recovery_cases for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their lien notice drafts" on public.lien_notice_drafts;
create policy "Contractors manage their lien notice drafts"
on public.lien_notice_drafts for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage their contract workspace items" on public.contract_workspace_items;
create policy "Contractors manage their contract workspace items"
on public.contract_workspace_items for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
