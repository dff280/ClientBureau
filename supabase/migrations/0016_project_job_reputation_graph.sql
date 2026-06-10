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
