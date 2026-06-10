-- Client Bureau graph backfill step: report profile links
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

update public.client_reports cr
set
  reporter_profile_id = reporter.id,
  subject_profile_id = subject.id,
  subject_profile_type = 'client',
  relationship_type = 'contractor_to_client',
  legacy_client_name = trim(concat_ws(' ', cp.first_name, cp.last_name))
from public.client_profiles cp
left join public.entity_profiles subject
  on subject.legacy_client_id = cp.id and subject.profile_type = 'client'
left join public.entity_profiles reporter
  on reporter.legacy_contractor_id = cr.contractor_id
where cr.client_id = cp.id
  and (cr.subject_profile_id is null or cr.reporter_profile_id is null);
