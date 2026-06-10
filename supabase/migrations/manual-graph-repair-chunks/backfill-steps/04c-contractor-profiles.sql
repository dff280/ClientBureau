-- Client Bureau graph backfill step: contractor entity profile backfill
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

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
