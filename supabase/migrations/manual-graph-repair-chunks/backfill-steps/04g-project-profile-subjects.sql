-- Client Bureau graph backfill step: project subject joins
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

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
