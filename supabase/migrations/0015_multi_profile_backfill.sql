-- Idempotent backfill from legacy client/contractor records into entity_profiles.

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
    when u.account_type = 'subcontractor' then 'subcontractor'::public.profile_type
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
