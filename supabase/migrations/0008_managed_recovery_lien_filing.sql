-- Client Bureau managed recovery and Florida lien filing service.
-- Apply after 0007. These records are private contractor/admin service records.
-- Public client profiles must never expose raw lien filings, recovery communications,
-- staff notes, contractor signatures, client contact details, or private evidence paths.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'managed_recovery_status') then
    create type public.managed_recovery_status as enum (
      'draft',
      'fee_due',
      'submitted',
      'under_review',
      'needs_more_info',
      'contact_in_progress',
      'client_responded',
      'payment_plan_offered',
      'resolved',
      'unresolved',
      'paused',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'florida_lien_workflow_type') then
    create type public.florida_lien_workflow_type as enum ('notice_packet', 'claim_of_lien_filing');
  end if;

  if not exists (select 1 from pg_type where typname = 'florida_lien_case_status') then
    create type public.florida_lien_case_status as enum (
      'draft',
      'fee_due',
      'document_review',
      'needs_more_info',
      'contractor_signature_required',
      'attorney_vendor_review',
      'approved_to_send',
      'notice_sent',
      'approved_to_file',
      'filed',
      'recording_confirmed',
      'release_pending',
      'released',
      'blocked',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'lien_delivery_method') then
    create type public.lien_delivery_method as enum (
      'certified_mail',
      'process_server',
      'e_recording_vendor',
      'attorney_vendor',
      'manual_admin'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'lien_filing_method') then
    create type public.lien_filing_method as enum (
      'attorney_vendor',
      'e_recording_vendor',
      'county_clerk_manual'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'service_fee_kind') then
    create type public.service_fee_kind as enum (
      'managed_recovery',
      'florida_lien_notice',
      'florida_lien_filing'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'service_fee_status') then
    create type public.service_fee_status as enum (
      'draft',
      'checkout_ready',
      'paid',
      'failed',
      'refunded',
      'waived'
    );
  end if;
end $$;

alter type public.admin_entity_type add value if not exists 'managed_recovery';
alter type public.admin_entity_type add value if not exists 'florida_lien';
alter type public.admin_entity_type add value if not exists 'service_fee';

create table if not exists public.service_fee_orders (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  kind public.service_fee_kind not null,
  entity_id uuid not null,
  status public.service_fee_status not null default 'draft',
  client_bureau_fee_cents integer not null default 0 check (client_bureau_fee_cents >= 0),
  pass_through_fee_cents integer not null default 0 check (pass_through_fee_cents >= 0),
  currency text not null default 'usd',
  stripe_checkout_url text,
  stripe_session_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.managed_recovery_cases (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  client_name text not null,
  client_email_hash text,
  client_email_masked text,
  city text not null,
  state text not null,
  amount_due numeric not null default 0,
  invoice_age_days integer not null default 0,
  preferred_channel public.recovery_channel not null default 'email',
  status public.managed_recovery_status not null default 'fee_due',
  priority public.moderation_priority not null default 'normal',
  service_fee_order_id uuid references public.service_fee_orders(id) on delete set null,
  evidence_vault_item_ids uuid[] not null default array[]::uuid[],
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_to_name text,
  next_action text not null,
  summary text not null,
  contractor_direct_payment boolean not null default true,
  compliance_flags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recovery_communications (
  id uuid primary key default gen_random_uuid(),
  managed_recovery_case_id uuid not null references public.managed_recovery_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  channel public.recovery_channel not null,
  direction text not null check (direction in ('outbound', 'inbound', 'internal')),
  subject text not null,
  note text not null,
  outcome public.payment_recovery_attempt_outcome not null,
  contacted_at timestamptz not null,
  logged_by uuid references auth.users(id) on delete set null,
  logged_by_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_resolution_offers (
  id uuid primary key default gen_random_uuid(),
  managed_recovery_case_id uuid not null references public.managed_recovery_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  amount_offered numeric not null default 0,
  payment_due_date date,
  terms_summary text not null,
  status text not null default 'draft' check (status in ('draft', 'offered', 'accepted', 'rejected', 'expired', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.florida_lien_cases (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_profile_id uuid references public.client_profiles(id) on delete set null,
  workflow_type public.florida_lien_workflow_type not null,
  client_name text not null,
  owner_name text not null,
  property_county text not null,
  property_city text not null,
  state text not null default 'FL' check (state = 'FL'),
  parcel_number text,
  legal_description text,
  contractor_role text not null check (contractor_role in ('direct_contractor', 'subcontractor', 'supplier', 'laborer', 'other')),
  project_type text not null,
  contract_amount numeric not null default 0,
  amount_due numeric not null default 0,
  first_work_date date,
  last_work_date date not null,
  notice_history text not null,
  filing_deadline date,
  target_send_date date,
  status public.florida_lien_case_status not null default 'fee_due',
  delivery_method public.lien_delivery_method,
  filing_method public.lien_filing_method,
  recording_vendor text,
  service_fee_order_id uuid references public.service_fee_orders(id) on delete set null,
  contractor_signed_at timestamptz,
  contractor_signature_name text,
  contractor_signature_hash text,
  attorney_vendor_status text not null default 'not_started' check (attorney_vendor_status in ('not_started', 'queued', 'in_review', 'approved', 'rejected')),
  next_action text not null,
  private_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_due <= contract_amount)
);

create table if not exists public.lien_notice_deliveries (
  id uuid primary key default gen_random_uuid(),
  florida_lien_case_id uuid not null references public.florida_lien_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  delivery_method public.lien_delivery_method not null,
  recipient_name text not null,
  sent_at timestamptz,
  tracking_number text,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'failed', 'returned')),
  proof_summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lien_filing_records (
  id uuid primary key default gen_random_uuid(),
  florida_lien_case_id uuid not null references public.florida_lien_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  filing_method public.lien_filing_method not null,
  recording_vendor text,
  clerk_county text not null,
  clerk_reference text,
  official_record_book text,
  official_record_page text,
  instrument_number text,
  filed_at timestamptz,
  recording_confirmed_at timestamptz,
  filing_receipt_path text,
  status text not null default 'queued' check (status in ('queued', 'submitted', 'filed', 'recording_confirmed', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lien_release_records (
  id uuid primary key default gen_random_uuid(),
  florida_lien_case_id uuid not null references public.florida_lien_cases(id) on delete cascade,
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  release_reason text not null check (release_reason in ('paid', 'settled', 'expired', 'withdrawn', 'error_correction')),
  release_status text not null default 'draft' check (release_status in ('draft', 'sent_for_signature', 'recorded', 'blocked')),
  release_recorded_at timestamptz,
  release_instrument_number text,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('managed_recovery', 'florida_lien')),
  entity_id uuid not null,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_to_name text not null,
  priority public.moderation_priority not null default 'normal',
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('managed_recovery', 'florida_lien', 'service_fee')),
  entity_id uuid not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null,
  action text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists managed_recovery_contractor_idx
  on public.managed_recovery_cases(contractor_id, status, priority, updated_at desc);
create index if not exists florida_lien_contractor_idx
  on public.florida_lien_cases(contractor_id, status, property_county, updated_at desc);
create index if not exists service_fee_entity_idx
  on public.service_fee_orders(kind, entity_id, status);
create index if not exists lien_filing_case_idx
  on public.lien_filing_records(florida_lien_case_id, status);
create index if not exists recovery_communications_case_idx
  on public.recovery_communications(managed_recovery_case_id, contacted_at desc);
create index if not exists case_audit_entity_idx
  on public.case_audit_events(entity_type, entity_id, created_at desc);

alter table public.service_fee_orders enable row level security;
alter table public.managed_recovery_cases enable row level security;
alter table public.recovery_communications enable row level security;
alter table public.recovery_resolution_offers enable row level security;
alter table public.florida_lien_cases enable row level security;
alter table public.lien_notice_deliveries enable row level security;
alter table public.lien_filing_records enable row level security;
alter table public.lien_release_records enable row level security;
alter table public.case_staff_assignments enable row level security;
alter table public.case_audit_events enable row level security;

drop policy if exists "Contractors manage own service fee orders" on public.service_fee_orders;
create policy "Contractors manage own service fee orders"
on public.service_fee_orders for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors manage own managed recovery cases" on public.managed_recovery_cases;
create policy "Contractors manage own managed recovery cases"
on public.managed_recovery_cases for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors read own recovery communications" on public.recovery_communications;
create policy "Contractors read own recovery communications"
on public.recovery_communications for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
drop policy if exists "Admins manage recovery communications" on public.recovery_communications;
create policy "Admins manage recovery communications"
on public.recovery_communications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read own recovery offers" on public.recovery_resolution_offers;
create policy "Contractors read own recovery offers"
on public.recovery_resolution_offers for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
drop policy if exists "Admins manage recovery offers" on public.recovery_resolution_offers;
create policy "Admins manage recovery offers"
on public.recovery_resolution_offers for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors manage own florida lien cases" on public.florida_lien_cases;
create policy "Contractors manage own florida lien cases"
on public.florida_lien_cases for all
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()))
with check (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));

drop policy if exists "Contractors read own lien deliveries" on public.lien_notice_deliveries;
create policy "Contractors read own lien deliveries"
on public.lien_notice_deliveries for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
drop policy if exists "Admins manage lien deliveries" on public.lien_notice_deliveries;
create policy "Admins manage lien deliveries"
on public.lien_notice_deliveries for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read own lien filing records" on public.lien_filing_records;
create policy "Contractors read own lien filing records"
on public.lien_filing_records for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
drop policy if exists "Admins manage lien filing records" on public.lien_filing_records;
create policy "Admins manage lien filing records"
on public.lien_filing_records for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read own lien release records" on public.lien_release_records;
create policy "Contractors read own lien release records"
on public.lien_release_records for select
using (public.is_admin() or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid()));
drop policy if exists "Admins manage lien release records" on public.lien_release_records;
create policy "Admins manage lien release records"
on public.lien_release_records for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage case staff assignments" on public.case_staff_assignments;
create policy "Admins manage case staff assignments"
on public.case_staff_assignments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read own case audit events" on public.case_audit_events;
create policy "Contractors read own case audit events"
on public.case_audit_events for select
using (
  public.is_admin()
  or exists (
    select 1 from public.managed_recovery_cases m
    where m.id = entity_id and m.contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  )
  or exists (
    select 1 from public.florida_lien_cases f
    where f.id = entity_id and f.contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  )
);
drop policy if exists "Admins manage case audit events" on public.case_audit_events;
create policy "Admins manage case audit events"
on public.case_audit_events for all
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists service_fee_orders_set_updated_at on public.service_fee_orders;
create trigger service_fee_orders_set_updated_at
before update on public.service_fee_orders
for each row execute function public.set_updated_at();

drop trigger if exists managed_recovery_cases_set_updated_at on public.managed_recovery_cases;
create trigger managed_recovery_cases_set_updated_at
before update on public.managed_recovery_cases
for each row execute function public.set_updated_at();

drop trigger if exists florida_lien_cases_set_updated_at on public.florida_lien_cases;
create trigger florida_lien_cases_set_updated_at
before update on public.florida_lien_cases
for each row execute function public.set_updated_at();

drop trigger if exists lien_filing_records_set_updated_at on public.lien_filing_records;
create trigger lien_filing_records_set_updated_at
before update on public.lien_filing_records
for each row execute function public.set_updated_at();

comment on table public.managed_recovery_cases is
  'Private Client Bureau Resolution Desk cases. Payments are contractor-direct; Client Bureau tracks outreach and resolution.';
comment on table public.florida_lien_cases is
  'Private Florida lien notice and claim-of-lien filing cases routed through contractor authorization and attorney/e-recording vendor review.';
