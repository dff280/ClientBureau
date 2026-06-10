-- Client Bureau graph repair chunk: types and enum values
-- Run chunks 01 through 05 in order in Supabase SQL Editor.

-- Client Bureau reputation graph column repair.
-- Use this if /api/health shows graph tables exist but graph columns are missing.
-- This avoids re-running the full profile_claims table creation block.

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
