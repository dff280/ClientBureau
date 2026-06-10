-- Client Bureau graph backfill step: project reporter joins
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
  cr.reporter_profile_id,
  'reporter'::public.project_profile_role,
  cr.relationship_type::text,
  true,
  cr.created_at
from public.client_reports cr
where cr.project_job_id is not null
  and cr.reporter_profile_id is not null
on conflict (project_job_id, profile_id, role) do nothing;
