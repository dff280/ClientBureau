-- Client Bureau graph repair chunk: profile, project, relationship, and evidence backfill
-- Run chunks 01 through 05 in order in Supabase SQL Editor.

update public.entity_profiles
set
  profile_subtype = case
    when profile_type = 'client' and profile_subtype is null then 'Other'
    when profile_type = 'contractor' and profile_subtype is null then 'Service business'
    when profile_type = 'subcontractor' and profile_subtype is null then 'Other'
    else profile_subtype
  end,
  verification_level = case
    when claimed_status::text = 'verified' then 'admin_verified'::public.verification_level
    when claimed_status::text = 'claimed' then coalesce(verification_level, 'email_verified'::public.verification_level)
    else verification_level
  end,
  duplicate_group_key = coalesce(
    duplicate_group_key,
    lower(regexp_replace(concat_ws('|', profile_type::text, display_name, city, state), '[^a-zA-Z0-9|]+', '-', 'g'))
  ),
  updated_at = now();

insert into public.entity_profiles (
  profile_type,
  display_name,
  business_name,
  city,
  state,
  slug,
  legacy_client_id,
  claimed_status,
  rating_score,
  rating_band,
  report_count,
  positive_report_count,
  disputed_report_count,
  resolved_report_count,
  evidence_on_file_count,
  response_count,
  public_summary,
  is_public,
  created_at,
  updated_at
)
select
  'client'::public.profile_type,
  trim(concat_ws(' ', cp.first_name, cp.last_name)),
  cp.business_name,
  cp.city,
  upper(cp.state),
  cp.public_slug,
  cp.id,
  'unclaimed'::public.claimed_status,
  cp.client_bureau_score,
  cp.risk_level::text,
  cp.report_count,
  count(cr.id) filter (where cr.report_category in ('Positive experience', 'Would work with again') and cr.status = 'approved'),
  count(cr.id) filter (where cr.status = 'disputed'),
  count(cr.id) filter (where cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')),
  count(cr.id) filter (where cr.evidence_attached = true and cr.status = 'approved'),
  count(resp.id) filter (where resp.status = 'published'),
  'Client Bureau public profile with contractor-submitted, moderated report context.',
  cp.is_public,
  cp.created_at,
  cp.updated_at
from public.client_profiles cp
left join public.client_reports cr on cr.client_id = cp.id
left join public.client_responses resp on resp.client_id = cp.id
group by cp.id
on conflict (profile_type, slug) do update set
  display_name = excluded.display_name,
  business_name = excluded.business_name,
  city = excluded.city,
  state = excluded.state,
  legacy_client_id = excluded.legacy_client_id,
  rating_score = excluded.rating_score,
  rating_band = excluded.rating_band,
  report_count = excluded.report_count,
  positive_report_count = excluded.positive_report_count,
  disputed_report_count = excluded.disputed_report_count,
  resolved_report_count = excluded.resolved_report_count,
  evidence_on_file_count = excluded.evidence_on_file_count,
  response_count = excluded.response_count,
  is_public = excluded.is_public,
  updated_at = now();

insert into public.entity_profiles (
  profile_type,
  display_name,
  business_name,
  city,
  state,
  slug,
  legacy_contractor_id,
  claimed_status,
  owner_user_id,
  rating_score,
  rating_band,
  report_count,
  positive_report_count,
  disputed_report_count,
  resolved_report_count,
  evidence_on_file_count,
  response_count,
  public_summary,
  is_public,
  created_at,
  updated_at
)
select
  case
    when u.account_type::text = 'subcontractor' then 'subcontractor'::public.profile_type
    else 'contractor'::public.profile_type
  end,
  cp.business_name,
  cp.business_name,
  cp.city,
  upper(cp.state),
  lower(regexp_replace(concat_ws('-', cp.business_name, cp.city, cp.state), '[^a-zA-Z0-9]+', '-', 'g')),
  cp.id,
  'claimed'::public.claimed_status,
  cp.user_id,
  case
    when cp.verification_status = 'verified' then 88
    when cp.verification_status = 'pending' then 76
    else 68
  end,
  case
    when cp.verification_status = 'verified' then 'A'
    when cp.verification_status = 'pending' then 'Review Pending'
    else 'Basic'
  end,
  count(cr.id),
  count(cr.id) filter (where cr.report_category in ('Positive experience', 'Would work with again') and cr.status = 'approved'),
  count(cr.id) filter (where cr.status = 'disputed'),
  count(cr.id) filter (where cr.resolution_status in ('Resolved', 'Paid in full', 'Settled', 'Admin verified')),
  count(re.id) filter (where cr.status = 'approved'),
  0,
  'Business profile with documented project history, verification context, and moderated public report activity.',
  true,
  cp.created_at,
  now()
from public.contractor_profiles cp
left join public.users u on u.id = cp.user_id
left join public.client_reports cr on cr.contractor_id = cp.id
left join public.report_evidence re on re.report_id = cr.id
group by cp.id, u.account_type
on conflict (profile_type, slug) do update set
  display_name = excluded.display_name,
  business_name = excluded.business_name,
  city = excluded.city,
  state = excluded.state,
  legacy_contractor_id = excluded.legacy_contractor_id,
  owner_user_id = excluded.owner_user_id,
  rating_score = excluded.rating_score,
  rating_band = excluded.rating_band,
  report_count = excluded.report_count,
  positive_report_count = excluded.positive_report_count,
  disputed_report_count = excluded.disputed_report_count,
  resolved_report_count = excluded.resolved_report_count,
  evidence_on_file_count = excluded.evidence_on_file_count,
  public_summary = excluded.public_summary,
  is_public = excluded.is_public,
  updated_at = now();

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

