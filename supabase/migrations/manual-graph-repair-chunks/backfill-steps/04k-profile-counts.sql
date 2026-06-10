-- Client Bureau graph backfill step: profile count refresh
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

update public.entity_profiles ep
set
  report_count = counts.report_count,
  positive_report_count = counts.positive_report_count,
  disputed_report_count = counts.disputed_report_count,
  resolved_report_count = counts.resolved_report_count,
  evidence_on_file_count = counts.evidence_on_file_count,
  updated_at = now()
from (
  select
    subject_profile_id,
    count(*) filter (where status = 'approved') as report_count,
    count(*) filter (where report_category in ('Positive experience', 'Would work with again') and status = 'approved') as positive_report_count,
    count(*) filter (where status = 'disputed') as disputed_report_count,
    count(*) filter (where resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')) as resolved_report_count,
    count(*) filter (where evidence_attached = true and status = 'approved') as evidence_on_file_count
  from public.client_reports
  where subject_profile_id is not null
  group by subject_profile_id
) counts
where ep.id = counts.subject_profile_id;
