-- Client Bureau graph backfill step: project job records
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

insert into public.project_jobs (
  id,
  owner_user_id,
  title,
  project_type,
  status,
  city,
  state,
  start_date,
  completion_date,
  contract_amount,
  amount_due,
  primary_client_profile_id,
  primary_contractor_profile_id,
  public_summary,
  private_notes,
  is_public_summary_allowed,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  contractor_profiles.user_id,
  concat(cr.project_type, ' - ', cr.project_city, ', ', cr.project_state),
  cr.project_type,
  case
    when cr.status = 'disputed' then 'disputed'::public.project_job_status
    when cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified') then 'resolved'::public.project_job_status
    when cr.amount_unpaid > 0 then 'payment_issue'::public.project_job_status
    when cr.job_status = 'Completed' then 'completed'::public.project_job_status
    else 'active'::public.project_job_status
  end,
  cr.project_city,
  upper(cr.project_state),
  cr.job_start_date,
  cr.job_completion_date,
  cr.contract_amount,
  cr.amount_unpaid,
  subject.id,
  reporter.id,
  cr.public_summary,
  cr.detailed_timeline_private,
  false,
  cr.created_at,
  coalesce(cr.approved_at, cr.created_at)
from public.client_reports cr
left join public.contractor_profiles on contractor_profiles.id = cr.contractor_id
left join public.entity_profiles subject on subject.id = cr.subject_profile_id
left join public.entity_profiles reporter on reporter.id = cr.reporter_profile_id
where cr.project_job_id is null;
