-- Client Bureau graph backfill step: profile relationships
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

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
