-- Client Bureau graph backfill step: client entity profile backfill
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

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
