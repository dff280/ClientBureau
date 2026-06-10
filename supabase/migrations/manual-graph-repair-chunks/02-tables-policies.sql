-- Client Bureau graph repair chunk: graph tables, indexes, and RLS policies
-- Run chunks 01 through 05 in order in Supabase SQL Editor.

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
  profile_subtype text,
  verification_level public.verification_level,
  verification_badges text[] not null default '{}',
  duplicate_group_key text,
  merged_into_profile_id uuid references public.entity_profiles(id) on delete set null,
  public_field_redactions jsonb not null default '{}'::jsonb,
  redaction_note text,
  constraint entity_profiles_slug_per_type unique (profile_type, slug),
  constraint entity_profiles_state_code check (char_length(state) = 2 and state = upper(state))
);

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

create index if not exists profile_claims_profile_status_idx
  on public.profile_claims(profile_id, status, created_at desc);

create index if not exists project_jobs_owner_idx
  on public.project_jobs(owner_user_id, updated_at desc);

create index if not exists project_jobs_market_idx
  on public.project_jobs(state, city, status);

create index if not exists project_job_profiles_profile_idx
  on public.project_job_profiles(profile_id, created_at desc);

create index if not exists profile_relationships_source_target_idx
  on public.profile_relationships(source_profile_id, target_profile_id, relationship_type);

alter table public.entity_profiles enable row level security;
alter table public.profile_claims enable row level security;
alter table public.project_jobs enable row level security;
alter table public.project_job_profiles enable row level security;
alter table public.profile_relationships enable row level security;
alter table public.profile_merge_events enable row level security;
alter table public.report_reassignment_events enable row level security;
alter table public.profile_redaction_events enable row level security;

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
