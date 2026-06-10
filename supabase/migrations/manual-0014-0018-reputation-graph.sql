-- Client Bureau manual Supabase graph migration bundle
-- Run this in Supabase SQL Editor after migrations 0001 through 0013.
-- Safe to re-run: migrations use idempotent create/add-if-not-exists patterns where possible.


-- ============================================================
-- 0014_multi_profile_schema.sql
-- ============================================================

-- Client Bureau unified public profile layer.
-- This is additive: existing client/contractor tables and routes continue to work.

do $$
begin
  alter type public.account_type add value if not exists 'subcontractor';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_type as enum ('client', 'contractor', 'subcontractor');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.claimed_status as enum ('unclaimed', 'claimed', 'disputed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.profile_claim_status as enum ('pending', 'approved', 'rejected', 'disputed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_relationship_type as enum (
    'contractor_to_client',
    'subcontractor_to_contractor',
    'contractor_to_subcontractor',
    'client_to_contractor',
    'business_to_business'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.entity_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_type public.profile_type not null,
  display_name text not null,
  legal_name_private text,
  business_name text,
  city text not null,
  state text not null,
  slug text not null,
  legacy_client_id uuid references public.client_profiles(id) on delete set null,
  legacy_contractor_id uuid references public.contractor_profiles(id) on delete set null,
  claimed_status public.claimed_status not null default 'unclaimed',
  owner_user_id uuid references auth.users(id) on delete set null,
  rating_score integer not null default 70 check (rating_score >= 0 and rating_score <= 100),
  rating_band text not null default 'Review Pending',
  report_count integer not null default 0,
  positive_report_count integer not null default 0,
  disputed_report_count integer not null default 0,
  resolved_report_count integer not null default 0,
  evidence_on_file_count integer not null default 0,
  response_count integer not null default 0,
  public_summary text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entity_profiles_slug_per_type unique (profile_type, slug),
  constraint entity_profiles_state_code check (char_length(state) = 2 and state = upper(state))
);

create index if not exists entity_profiles_public_idx
  on public.entity_profiles(profile_type, is_public, state, city);

create index if not exists entity_profiles_slug_idx
  on public.entity_profiles(slug);

create index if not exists entity_profiles_legacy_client_idx
  on public.entity_profiles(legacy_client_id)
  where legacy_client_id is not null;

create index if not exists entity_profiles_legacy_contractor_idx
  on public.entity_profiles(legacy_contractor_id)
  where legacy_contractor_id is not null;

create table if not exists public.profile_claims (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  claimant_user_id uuid references auth.users(id) on delete set null,
  claimant_email_hash text not null,
  claimant_name text not null,
  relationship_to_profile text not null,
  verification_summary text not null,
  status public.profile_claim_status not null default 'pending',
  moderator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_claims_profile_status_idx
  on public.profile_claims(profile_id, status, created_at desc);

alter table public.client_reports
  add column if not exists reporter_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists subject_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists subject_profile_type public.profile_type not null default 'client',
  add column if not exists relationship_type public.report_relationship_type not null default 'contractor_to_client',
  add column if not exists legacy_client_name text;

create index if not exists client_reports_subject_profile_idx
  on public.client_reports(subject_profile_id, status, created_at desc)
  where subject_profile_id is not null;

create index if not exists client_reports_reporter_profile_idx
  on public.client_reports(reporter_profile_id, status, created_at desc)
  where reporter_profile_id is not null;

alter table public.entity_profiles enable row level security;
alter table public.profile_claims enable row level security;

drop policy if exists "Public can read approved entity profiles" on public.entity_profiles;
create policy "Public can read approved entity profiles"
  on public.entity_profiles for select
  using (is_public = true);

drop policy if exists "Profile owners can read owned profiles" on public.entity_profiles;
create policy "Profile owners can read owned profiles"
  on public.entity_profiles for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Admins can manage entity profiles" on public.entity_profiles;
create policy "Admins can manage entity profiles"
  on public.entity_profiles for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Claimants can read own profile claims" on public.profile_claims;
create policy "Claimants can read own profile claims"
  on public.profile_claims for select
  using (auth.uid() = claimant_user_id);

drop policy if exists "Authenticated users can create profile claims" on public.profile_claims;
create policy "Authenticated users can create profile claims"
  on public.profile_claims for insert
  with check (auth.uid() = claimant_user_id);

drop policy if exists "Admins can manage profile claims" on public.profile_claims;
create policy "Admins can manage profile claims"
  on public.profile_claims for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

comment on table public.entity_profiles is
  'Unified public profile layer for clients, contractors, and subcontractors. Private identifiers and raw evidence are never public.';

comment on table public.profile_claims is
  'Moderated claims for unclaimed or disputed public profiles.';


-- ============================================================
-- 0015_multi_profile_backfill.sql
-- ============================================================

-- Idempotent backfill from legacy client/contractor records into entity_profiles.

insert into public.entity_profiles (
  profile_type,
  display_name,
  business_name,
  city,
  state,
  slug,
  legacy_client_id,
  claimed_status,
  rating_score,
  rating_band,
  report_count,
  positive_report_count,
  disputed_report_count,
  resolved_report_count,
  evidence_on_file_count,
  response_count,
  public_summary,
  is_public,
  created_at,
  updated_at
)
select
  'client'::public.profile_type,
  trim(concat_ws(' ', cp.first_name, cp.last_name)),
  cp.business_name,
  cp.city,
  upper(cp.state),
  cp.public_slug,
  cp.id,
  'unclaimed'::public.claimed_status,
  cp.client_bureau_score,
  cp.risk_level::text,
  cp.report_count,
  count(cr.id) filter (where cr.report_category in ('Positive experience', 'Would work with again') and cr.status = 'approved'),
  count(cr.id) filter (where cr.status = 'disputed'),
  count(cr.id) filter (where cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')),
  count(cr.id) filter (where cr.evidence_attached = true and cr.status = 'approved'),
  count(resp.id) filter (where resp.status = 'published'),
  'Client Bureau public profile with contractor-submitted, moderated report context.',
  cp.is_public,
  cp.created_at,
  cp.updated_at
from public.client_profiles cp
left join public.client_reports cr on cr.client_id = cp.id
left join public.client_responses resp on resp.client_id = cp.id
group by cp.id
on conflict (profile_type, slug) do update set
  display_name = excluded.display_name,
  business_name = excluded.business_name,
  city = excluded.city,
  state = excluded.state,
  legacy_client_id = excluded.legacy_client_id,
  rating_score = excluded.rating_score,
  rating_band = excluded.rating_band,
  report_count = excluded.report_count,
  positive_report_count = excluded.positive_report_count,
  disputed_report_count = excluded.disputed_report_count,
  resolved_report_count = excluded.resolved_report_count,
  evidence_on_file_count = excluded.evidence_on_file_count,
  response_count = excluded.response_count,
  is_public = excluded.is_public,
  updated_at = now();

insert into public.entity_profiles (
  profile_type,
  display_name,
  business_name,
  city,
  state,
  slug,
  legacy_contractor_id,
  claimed_status,
  owner_user_id,
  rating_score,
  rating_band,
  report_count,
  positive_report_count,
  disputed_report_count,
  resolved_report_count,
  evidence_on_file_count,
  response_count,
  public_summary,
  is_public,
  created_at,
  updated_at
)
select
  case
    when u.account_type = 'subcontractor' then 'subcontractor'::public.profile_type
    else 'contractor'::public.profile_type
  end,
  cp.business_name,
  cp.business_name,
  cp.city,
  upper(cp.state),
  lower(regexp_replace(concat_ws('-', cp.business_name, cp.city, cp.state), '[^a-zA-Z0-9]+', '-', 'g')),
  cp.id,
  'claimed'::public.claimed_status,
  cp.user_id,
  case
    when cp.verification_status = 'verified' then 88
    when cp.verification_status = 'pending' then 76
    else 68
  end,
  case
    when cp.verification_status = 'verified' then 'A'
    when cp.verification_status = 'pending' then 'Review Pending'
    else 'Basic'
  end,
  count(cr.id),
  count(cr.id) filter (where cr.report_category in ('Positive experience', 'Would work with again') and cr.status = 'approved'),
  count(cr.id) filter (where cr.status = 'disputed'),
  count(cr.id) filter (where cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')),
  count(re.id) filter (where cr.status = 'approved'),
  0,
  'Business profile with documented project history, verification context, and moderated public report activity.',
  true,
  cp.created_at,
  now()
from public.contractor_profiles cp
left join public.users u on u.id = cp.user_id
left join public.client_reports cr on cr.contractor_id = cp.id
left join public.report_evidence re on re.report_id = cr.id
group by cp.id, u.account_type
on conflict (profile_type, slug) do update set
  display_name = excluded.display_name,
  business_name = excluded.business_name,
  city = excluded.city,
  state = excluded.state,
  legacy_contractor_id = excluded.legacy_contractor_id,
  owner_user_id = excluded.owner_user_id,
  rating_score = excluded.rating_score,
  rating_band = excluded.rating_band,
  report_count = excluded.report_count,
  positive_report_count = excluded.positive_report_count,
  disputed_report_count = excluded.disputed_report_count,
  resolved_report_count = excluded.resolved_report_count,
  evidence_on_file_count = excluded.evidence_on_file_count,
  public_summary = excluded.public_summary,
  is_public = excluded.is_public,
  updated_at = now();

update public.client_reports cr
set
  reporter_profile_id = coalesce(
    cr.reporter_profile_id,
    (
      select reporter.id
      from public.entity_profiles reporter
      where reporter.legacy_contractor_id = cr.contractor_id
      order by reporter.updated_at desc
      limit 1
    )
  ),
  subject_profile_id = coalesce(
    cr.subject_profile_id,
    (
      select subject.id
      from public.entity_profiles subject
      where subject.legacy_client_id = cr.client_id
        and subject.profile_type = 'client'
      order by subject.updated_at desc
      limit 1
    )
  ),
  subject_profile_type = 'client',
  relationship_type = 'contractor_to_client',
  legacy_client_name = coalesce(
    nullif(cr.legacy_client_name, ''),
    (
      select trim(concat_ws(' ', cp.first_name, cp.last_name))
      from public.client_profiles cp
      where cp.id = cr.client_id
      limit 1
    )
  )
where exists (select 1 from public.client_profiles cp where cp.id = cr.client_id)
  and (cr.subject_profile_id is null or cr.reporter_profile_id is null);

update public.entity_profiles ep
set
  report_count = counts.report_count,
  positive_report_count = counts.positive_report_count,
  disputed_report_count = counts.disputed_report_count,
  resolved_report_count = counts.resolved_report_count,
  evidence_on_file_count = counts.evidence_on_file_count,
  updated_at = now()
from (
  select
    subject_profile_id,
    count(*) filter (where status = 'approved') as report_count,
    count(*) filter (where report_category in ('Positive experience', 'Would work with again') and status = 'approved') as positive_report_count,
    count(*) filter (where status = 'disputed') as disputed_report_count,
    count(*) filter (where resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')) as resolved_report_count,
    count(*) filter (where evidence_attached = true and status = 'approved') as evidence_on_file_count
  from public.client_reports
  where subject_profile_id is not null
  group by subject_profile_id
) counts
where ep.id = counts.subject_profile_id;


-- ============================================================
-- 0016_project_job_reputation_graph.sql
-- ============================================================

-- Client Bureau project/job reputation graph layer.
-- Projects/jobs become the central connection between profiles, reports, evidence, relationships, and claims.

do $$
begin
  alter type public.claimed_status add value if not exists 'claim_pending';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.claimed_status add value if not exists 'verified';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_confidence_level as enum (
    'basic_report',
    'documented_report',
    'evidence_reviewed',
    'response_available',
    'resolved_report'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_level as enum (
    'email_verified',
    'phone_verified',
    'business_verified',
    'license_verified',
    'insurance_verified',
    'admin_verified'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_job_status as enum (
    'draft',
    'screening',
    'contract_pending',
    'active',
    'completed',
    'payment_issue',
    'disputed',
    'resolved',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_profile_role as enum (
    'client',
    'contractor',
    'subcontractor',
    'owner',
    'property_manager',
    'reporter',
    'subject',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.entity_profiles
  add column if not exists profile_subtype text,
  add column if not exists verification_level public.verification_level,
  add column if not exists verification_badges text[] not null default '{}',
  add column if not exists duplicate_group_key text,
  add column if not exists merged_into_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists public_field_redactions jsonb not null default '{}'::jsonb,
  add column if not exists redaction_note text;

create index if not exists entity_profiles_subtype_idx
  on public.entity_profiles(profile_type, profile_subtype)
  where profile_subtype is not null;

create index if not exists entity_profiles_duplicate_group_idx
  on public.entity_profiles(duplicate_group_key)
  where duplicate_group_key is not null;

create table if not exists public.project_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  project_type text not null,
  status public.project_job_status not null default 'draft',
  city text not null,
  state text not null,
  project_address_private text,
  start_date date,
  completion_date date,
  contract_amount numeric not null default 0,
  amount_due numeric not null default 0,
  primary_client_profile_id uuid references public.entity_profiles(id) on delete set null,
  primary_contractor_profile_id uuid references public.entity_profiles(id) on delete set null,
  public_summary text,
  private_notes text,
  is_public_summary_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_jobs_state_code check (char_length(state) = 2 and state = upper(state))
);

create index if not exists project_jobs_owner_idx
  on public.project_jobs(owner_user_id, updated_at desc);

create index if not exists project_jobs_market_idx
  on public.project_jobs(state, city, status);

create table if not exists public.project_job_profiles (
  id uuid primary key default gen_random_uuid(),
  project_job_id uuid not null references public.project_jobs(id) on delete cascade,
  profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  role public.project_profile_role not null,
  relationship_label text,
  is_primary boolean not null default false,
  private_notes text,
  created_at timestamptz not null default now(),
  unique (project_job_id, profile_id, role)
);

create index if not exists project_job_profiles_profile_idx
  on public.project_job_profiles(profile_id, created_at desc);

create table if not exists public.profile_relationships (
  id uuid primary key default gen_random_uuid(),
  source_profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  target_profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  project_job_id uuid references public.project_jobs(id) on delete set null,
  relationship_type public.report_relationship_type not null,
  status text not null default 'active',
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_relationships_source_target_idx
  on public.profile_relationships(source_profile_id, target_profile_id, relationship_type);

alter table public.client_reports
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists report_confidence_level public.report_confidence_level not null default 'basic_report',
  add column if not exists redaction_note text;

alter table public.report_evidence
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists public_summary_label text;

create index if not exists client_reports_project_job_idx
  on public.client_reports(project_job_id, status, created_at desc)
  where project_job_id is not null;

create index if not exists report_evidence_project_job_idx
  on public.report_evidence(project_job_id)
  where project_job_id is not null;

create table if not exists public.profile_merge_events (
  id uuid primary key default gen_random_uuid(),
  source_profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  target_profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  merged_by uuid references auth.users(id) on delete set null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.report_reassignment_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.client_reports(id) on delete cascade,
  previous_subject_profile_id uuid references public.entity_profiles(id) on delete set null,
  next_subject_profile_id uuid references public.entity_profiles(id) on delete set null,
  previous_project_job_id uuid references public.project_jobs(id) on delete set null,
  next_project_job_id uuid references public.project_jobs(id) on delete set null,
  reassigned_by uuid references auth.users(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_redaction_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  field_name text not null,
  previous_public_value_hash text,
  redacted_by uuid references auth.users(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.project_jobs enable row level security;
alter table public.project_job_profiles enable row level security;
alter table public.profile_relationships enable row level security;
alter table public.profile_merge_events enable row level security;
alter table public.report_reassignment_events enable row level security;
alter table public.profile_redaction_events enable row level security;

drop policy if exists "Users can read own project jobs" on public.project_jobs;
create policy "Users can read own project jobs"
  on public.project_jobs for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Users can manage own project jobs" on public.project_jobs;
create policy "Users can manage own project jobs"
  on public.project_jobs for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "Admins can manage project jobs" on public.project_jobs;
create policy "Admins can manage project jobs"
  on public.project_jobs for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Admins can manage project graph joins" on public.project_job_profiles;
create policy "Admins can manage project graph joins"
  on public.project_job_profiles for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Admins can manage profile relationships" on public.profile_relationships;
create policy "Admins can manage profile relationships"
  on public.profile_relationships for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Admins can read merge audit" on public.profile_merge_events;
create policy "Admins can read merge audit"
  on public.profile_merge_events for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Admins can read reassignment audit" on public.report_reassignment_events;
create policy "Admins can read reassignment audit"
  on public.report_reassignment_events for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Admins can read redaction audit" on public.profile_redaction_events;
create policy "Admins can read redaction audit"
  on public.profile_redaction_events for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

comment on table public.project_jobs is
  'Private project/job records that connect clients, contractors, subcontractors, reports, evidence, and relationships.';

comment on column public.project_jobs.project_address_private is
  'Street address and precise location are private and must not appear on public profile pages.';

comment on table public.profile_merge_events is
  'Admin audit records for duplicate profile merge decisions.';

comment on table public.report_reassignment_events is
  'Admin audit records for moving reports between subject profiles or project/job records.';

comment on table public.profile_redaction_events is
  'Admin audit records for public/private field redaction decisions.';


-- ============================================================
-- 0017_project_job_graph_backfill.sql
-- ============================================================

-- Backfill project/job graph records from existing approved and pending report data.

update public.entity_profiles
set
  profile_subtype = case
    when profile_type = 'client' and profile_subtype is null then 'Other'
    when profile_type = 'contractor' and profile_subtype is null then 'Service business'
    when profile_type = 'subcontractor' and profile_subtype is null then 'Other'
    else profile_subtype
  end,
  verification_level = case
    when claimed_status = 'verified' then 'admin_verified'::public.verification_level
    when claimed_status = 'claimed' then coalesce(verification_level, 'email_verified'::public.verification_level)
    else verification_level
  end,
  duplicate_group_key = coalesce(
    duplicate_group_key,
    lower(regexp_replace(concat_ws('|', profile_type::text, display_name, city, state), '[^a-zA-Z0-9|]+', '-', 'g'))
  ),
  updated_at = now();

insert into public.project_jobs (
  id,
  owner_user_id,
  title,
  project_type,
  status,
  city,
  state,
  start_date,
  completion_date,
  contract_amount,
  amount_due,
  primary_client_profile_id,
  primary_contractor_profile_id,
  public_summary,
  private_notes,
  is_public_summary_allowed,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  contractor_profiles.user_id,
  concat(cr.project_type, ' - ', cr.project_city, ', ', cr.project_state),
  cr.project_type,
  case
    when cr.status = 'disputed' then 'disputed'::public.project_job_status
    when cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified') then 'resolved'::public.project_job_status
    when cr.amount_unpaid > 0 then 'payment_issue'::public.project_job_status
    when cr.job_status = 'Completed' then 'completed'::public.project_job_status
    else 'active'::public.project_job_status
  end,
  cr.project_city,
  upper(cr.project_state),
  cr.job_start_date,
  cr.job_completion_date,
  cr.contract_amount,
  cr.amount_unpaid,
  subject.id,
  reporter.id,
  cr.public_summary,
  cr.detailed_timeline_private,
  false,
  cr.created_at,
  coalesce(cr.approved_at, cr.created_at)
from public.client_reports cr
left join public.contractor_profiles on contractor_profiles.id = cr.contractor_id
left join public.entity_profiles subject on subject.id = cr.subject_profile_id
left join public.entity_profiles reporter on reporter.id = cr.reporter_profile_id
where cr.project_job_id is null;

with unmatched_reports as (
  select
    cr.id as report_id,
    pj.id as project_job_id
  from public.client_reports cr
  join public.project_jobs pj
    on pj.title = concat(cr.project_type, ' - ', cr.project_city, ', ', cr.project_state)
   and pj.contract_amount = cr.contract_amount
   and pj.amount_due = cr.amount_unpaid
   and pj.created_at = cr.created_at
  where cr.project_job_id is null
)
update public.client_reports cr
set
  project_job_id = unmatched_reports.project_job_id,
  report_confidence_level = case
    when cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified') then 'resolved_report'::public.report_confidence_level
    when cr.response_status in ('Response published', 'Disputed', 'Resolved') then 'response_available'::public.report_confidence_level
    when cr.evidence_attached = true then 'evidence_reviewed'::public.report_confidence_level
    when cr.signed_contract = true or cr.detailed_timeline_private is not null then 'documented_report'::public.report_confidence_level
    else 'basic_report'::public.report_confidence_level
  end
from unmatched_reports
where cr.id = unmatched_reports.report_id;

insert into public.project_job_profiles (
  project_job_id,
  profile_id,
  role,
  relationship_label,
  is_primary,
  created_at
)
select distinct
  cr.project_job_id,
  cr.subject_profile_id,
  'subject'::public.project_profile_role,
  cr.relationship_type::text,
  true,
  cr.created_at
from public.client_reports cr
where cr.project_job_id is not null
  and cr.subject_profile_id is not null
on conflict (project_job_id, profile_id, role) do nothing;

insert into public.project_job_profiles (
  project_job_id,
  profile_id,
  role,
  relationship_label,
  is_primary,
  created_at
)
select distinct
  cr.project_job_id,
  cr.reporter_profile_id,
  'reporter'::public.project_profile_role,
  cr.relationship_type::text,
  true,
  cr.created_at
from public.client_reports cr
where cr.project_job_id is not null
  and cr.reporter_profile_id is not null
on conflict (project_job_id, profile_id, role) do nothing;

insert into public.profile_relationships (
  source_profile_id,
  target_profile_id,
  project_job_id,
  relationship_type,
  status,
  private_notes,
  created_at,
  updated_at
)
select distinct
  cr.reporter_profile_id,
  cr.subject_profile_id,
  cr.project_job_id,
  cr.relationship_type,
  'active',
  'Backfilled from existing report relationship.',
  cr.created_at,
  coalesce(cr.approved_at, cr.created_at)
from public.client_reports cr
where cr.reporter_profile_id is not null
  and cr.subject_profile_id is not null
  and cr.project_job_id is not null;

update public.report_evidence re
set
  project_job_id = cr.project_job_id,
  public_summary_label = case
    when lower(re.file_name || ' ' || re.file_type) like '%invoice%' then 'Invoice evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%contract%' then 'Contract evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%photo%' then 'Photo evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%screenshot%' then 'Screenshot evidence on file'
    else 'Evidence on file'
  end
from public.client_reports cr
where re.report_id = cr.id
  and cr.project_job_id is not null;


-- ============================================================
-- 0018_response_graph_links.sql
-- ============================================================

-- Client Bureau response/correction graph links.
-- Keeps legacy client responses working while allowing responses to attach to unified profiles and project/job records.

alter table public.client_responses
  alter column client_id drop not null,
  add column if not exists entity_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists request_type text,
  add column if not exists verification_method text,
  add column if not exists attachment_reference_private text;

create index if not exists client_responses_entity_profile_idx
  on public.client_responses(entity_profile_id, status, created_at desc)
  where entity_profile_id is not null;

create index if not exists client_responses_project_job_idx
  on public.client_responses(project_job_id, status, created_at desc)
  where project_job_id is not null;

comment on column public.client_responses.entity_profile_id is
  'Optional unified profile target for responses, disputes, corrections, and resolution updates.';

comment on column public.client_responses.project_job_id is
  'Optional private project/job context for response moderation. Public pages show only approved response summaries.';

comment on column public.client_responses.attachment_reference_private is
  'Private documentation reference for moderator review. Raw files, URLs, and sensitive documents must not be rendered publicly.';

