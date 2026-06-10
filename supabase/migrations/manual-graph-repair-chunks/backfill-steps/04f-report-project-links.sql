-- Client Bureau graph backfill step: report project links and confidence
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

with unmatched_reports as (
  select
    cr.id as report_id,
    pj.id as project_job_id
  from public.client_reports cr
  join public.project_jobs pj
    on pj.title = concat(cr.project_type, ' - ', cr.project_city, ', ', cr.project_state)
   and pj.contract_amount = cr.contract_amount
   and pj.amount_due = cr.amount_unpaid
   and pj.created_at = cr.created_at
  where cr.project_job_id is null
)
update public.client_reports cr
set
  project_job_id = unmatched_reports.project_job_id,
  report_confidence_level = case
    when cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified') then 'resolved_report'::public.report_confidence_level
    when cr.response_status in ('Response published', 'Disputed', 'Resolved') then 'response_available'::public.report_confidence_level
    when cr.evidence_attached = true then 'evidence_reviewed'::public.report_confidence_level
    when cr.signed_contract = true or cr.detailed_timeline_private is not null then 'documented_report'::public.report_confidence_level
    else 'basic_report'::public.report_confidence_level
  end
from unmatched_reports
where cr.id = unmatched_reports.report_id;
