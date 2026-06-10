-- Client Bureau graph repair chunk: missing graph columns and indexes
-- Run chunks 01 through 05 in order in Supabase SQL Editor.

alter table public.entity_profiles
  add column if not exists profile_subtype text,
  add column if not exists verification_level public.verification_level,
  add column if not exists verification_badges text[] not null default '{}',
  add column if not exists duplicate_group_key text,
  add column if not exists merged_into_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists public_field_redactions jsonb not null default '{}'::jsonb,
  add column if not exists redaction_note text;

alter table public.client_reports
  add column if not exists reporter_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists subject_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists subject_profile_type public.profile_type not null default 'client',
  add column if not exists relationship_type public.report_relationship_type not null default 'contractor_to_client',
  add column if not exists legacy_client_name text,
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists report_confidence_level public.report_confidence_level not null default 'basic_report',
  add column if not exists redaction_note text;

alter table public.report_evidence
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists public_summary_label text;

alter table public.client_responses
  alter column client_id drop not null,
  add column if not exists entity_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists request_type text,
  add column if not exists verification_method text,
  add column if not exists attachment_reference_private text;

create index if not exists entity_profiles_subtype_idx
  on public.entity_profiles(profile_type, profile_subtype)
  where profile_subtype is not null;

create index if not exists entity_profiles_duplicate_group_idx
  on public.entity_profiles(duplicate_group_key)
  where duplicate_group_key is not null;

create index if not exists client_reports_subject_profile_idx
  on public.client_reports(subject_profile_id, status, created_at desc)
  where subject_profile_id is not null;

create index if not exists client_reports_reporter_profile_idx
  on public.client_reports(reporter_profile_id, status, created_at desc)
  where reporter_profile_id is not null;

create index if not exists client_reports_project_job_idx
  on public.client_reports(project_job_id, status, created_at desc)
  where project_job_id is not null;

create index if not exists report_evidence_project_job_idx
  on public.report_evidence(project_job_id)
  where project_job_id is not null;

create index if not exists client_responses_entity_profile_idx
  on public.client_responses(entity_profile_id, status, created_at desc)
  where entity_profile_id is not null;

create index if not exists client_responses_project_job_idx
  on public.client_responses(project_job_id, status, created_at desc)
  where project_job_id is not null;
