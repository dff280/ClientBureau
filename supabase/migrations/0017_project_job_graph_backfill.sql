-- Backfill project/job graph records from existing approved and pending report data.

update public.entity_profiles
set
  profile_subtype = case
    when profile_type = 'client' and profile_subtype is null then 'Other'
    when profile_type = 'contractor' and profile_subtype is null then 'Service business'
    when profile_type = 'subcontractor' and profile_subtype is null then 'Other'
    else profile_subtype
  end,
  verification_level = case
    when claimed_status = 'verified' then 'admin_verified'::public.verification_level
    when claimed_status = 'claimed' then coalesce(verification_level, 'email_verified'::public.verification_level)
    else verification_level
  end,
  duplicate_group_key = coalesce(
    duplicate_group_key,
    lower(regexp_replace(concat_ws('|', profile_type::text, display_name, city, state), '[^a-zA-Z0-9|]+', '-', 'g'))
  ),
  updated_at = now();

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

update public.report_evidence re
set
  project_job_id = cr.project_job_id,
  public_summary_label = case
    when lower(re.file_name || ' ' || re.file_type) like '%invoice%' then 'Invoice evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%contract%' then 'Contract evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%photo%' then 'Photo evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%screenshot%' then 'Screenshot evidence on file'
    else 'Evidence on file'
  end
from public.client_reports cr
where re.report_id = cr.id
  and cr.project_job_id is not null;
