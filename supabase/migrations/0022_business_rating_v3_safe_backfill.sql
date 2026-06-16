-- Client Bureau Business Rating v3.
-- Adds v3 contractor/subcontractor rating model identifiers and safely lifts clean
-- no-history business profiles out of low/Review Pending starter scores.

alter table public.entity_profiles
  drop constraint if exists entity_profiles_rating_model_check;

alter table public.entity_profiles
  add constraint entity_profiles_rating_model_check
  check (
    rating_model is null
    or rating_model in (
      'client_risk',
      'contractor_business_reliability',
      'subcontractor_trade_partner_reliability',
      'contractor_business_reliability_v3',
      'subcontractor_trade_partner_reliability_v3'
    )
  );

alter table public.profile_rating_events
  drop constraint if exists profile_rating_events_model_check;

alter table public.profile_rating_events
  add constraint profile_rating_events_model_check
  check (
    rating_model in (
      'client_risk',
      'contractor_business_reliability',
      'subcontractor_trade_partner_reliability',
      'contractor_business_reliability_v3',
      'subcontractor_trade_partner_reliability_v3'
    )
  );

with eligible as (
  select
    ep.id,
    ep.profile_type,
    ep.rating_score as previous_score,
    ep.rating_band as previous_band,
    cp.verification_status,
    (
      case when coalesce(cp.business_name, ep.business_name, ep.display_name) is not null then 10 else 0 end +
      case when cp.trade is not null then 15 else 0 end +
      case when cp.city is not null and cp.state is not null then 10 else 0 end +
      case when cp.business_type is not null then 10 else 0 end +
      case when cp.service_area is not null then 10 else 0 end +
      case when cp.business_phone is not null then 8 else 0 end +
      case when cp.website_url is not null then 8 else 0 end +
      case when cp.license_number is not null then 10 else 0 end +
      case when cp.years_in_business is not null then 8 else 0 end +
      case when cp.company_size is not null then 6 else 0 end +
      case when cp.primary_goal is not null then 5 else 0 end
    ) as completeness_score
  from public.entity_profiles ep
  join public.contractor_profiles cp
    on cp.id = ep.legacy_contractor_id
  where ep.profile_type in ('contractor', 'subcontractor')
    and (
      ep.rating_score < 78
      or ep.rating_band = 'Review Pending'
      or ep.rating_version is distinct from 'business-rating-v3'
    )
    and not exists (
      select 1
      from public.client_reports cr
      where cr.subject_profile_id = ep.id
        and cr.status = 'approved'
        and cr.report_category not in ('Positive experience', 'Would work with again')
    )
),
scored as (
  select
    *,
    case
      when verification_status = 'verified' and completeness_score >= 75 then 92
      when verification_status = 'verified' then 88
      when completeness_score >= 75 then 86
      when completeness_score >= 55 then 82
      else 78
    end as next_score
  from eligible
),
updated as (
  update public.entity_profiles ep
  set
    rating_score = scored.next_score,
    rating_band = case
      when scored.next_score >= 92 then 'A+'
      when scored.next_score >= 82 then 'A'
      when scored.next_score >= 68 then 'B'
      when scored.next_score >= 50 then 'C'
      else 'Review Pending'
    end,
    rating_model = case
      when scored.profile_type = 'subcontractor' then 'subcontractor_trade_partner_reliability_v3'
      else 'contractor_business_reliability_v3'
    end,
    rating_version = 'business-rating-v3',
    rating_confidence = 'Basic',
    rating_factors = jsonb_build_array(
      jsonb_build_object(
        'label', 'Information completeness baseline',
        'score', scored.next_score,
        'maxScore', 100,
        'status', case when scored.next_score >= 82 then 'strong' else 'good' end,
        'description', 'Good-standing starter rating based on public-safe business information and no approved adverse subject-history.'
      )
    ),
    rating_public_note = case
      when scored.profile_type = 'subcontractor' then 'Client Bureau Trade Partner Reliability Rating reflects trade credential readiness, scope documentation, GC/sub relationship history, payment-chain context, evidence, and resolution posture. New trade profiles are not penalized for limited public history.'
      else 'Client Bureau Business Reliability Rating reflects verified business identity, service readiness, client-facing project history, contracts and evidence discipline, payment resolution posture, and account readiness. New businesses are not penalized for having limited public history.'
    end,
    rating_last_calculated_at = now(),
    updated_at = now()
  from scored
  where ep.id = scored.id
  returning
    ep.id,
    scored.profile_type,
    scored.previous_score,
    ep.rating_score as next_score,
    scored.previous_band,
    ep.rating_band as next_band,
    ep.rating_model,
    ep.rating_version,
    ep.rating_confidence,
    ep.rating_factors
)
insert into public.profile_rating_events (
  profile_id,
  profile_type,
  rating_model,
  rating_version,
  previous_score,
  next_score,
  previous_band,
  next_band,
  confidence,
  factor_snapshot,
  reason
)
select
  id,
  profile_type,
  rating_model,
  rating_version,
  previous_score,
  next_score,
  previous_band,
  next_band,
  coalesce(rating_confidence, 'Basic'),
  rating_factors,
  'business_rating_v3_safe_backfill'
from updated
where previous_score is distinct from next_score
   or previous_band is distinct from next_band;

comment on column public.entity_profiles.rating_model is
  'Public-safe rating model identifier. Business Rating v3 uses protected good-standing baselines and separate contractor/subcontractor models.';
