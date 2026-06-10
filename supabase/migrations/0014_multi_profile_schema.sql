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
