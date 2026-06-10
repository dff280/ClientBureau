-- Client Bureau graph backfill step: report profile links
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

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
