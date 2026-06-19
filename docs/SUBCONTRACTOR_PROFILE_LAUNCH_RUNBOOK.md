# Subcontractor Profile Launch Runbook

Use this runbook before pointing acquisition, SEO, or outreach campaigns at the public subcontractor directory.

Client Bureau should publish real subcontractor and trade-professional profiles only. Do not create fake, placeholder, or keyword-only subcontractor records to satisfy SEO checks.

## Publish Readiness

A public subcontractor profile is ready when staff can confirm:

- The record represents a real subcontractor, installer, crew, labor provider, specialty trade, or trade business.
- `profile_type` is `subcontractor`, or `account_capabilities` includes `subcontractor` when the same business legitimately works as both a contractor and subcontractor.
- The public display name, city, state, and subtype are accurate.
- The canonical trade category is selected from the shared trade/service taxonomy when available.
- The subtype clearly describes the trade role, such as licensed subcontractor, installer, crew, labor provider, or specialty trade.
- Claim status, verification status, or moderator notes support why the record can be public.
- The public summary is neutral, factual, and free of private identifiers.
- Public text has no raw email, phone number, street address, private evidence path, admin note, staff note, lockbox, gate code, or private access detail.
- Duplicate or similar-identity records are reviewed before publication.
- Any report context is admin-approved and public-safe.
- Evidence is summarized only as evidence-on-file indicators, never raw files or storage paths.
- Public preview shows no raw email, phone number, street address, private contract detail, private payment record, pending/rejected content, or admin note.

## Admin Workflow

1. Open `/admin/profiles`.
2. Filter profile type to `Subcontractor / trade pro`.
3. Use the trade category, visibility, claim status, and verification filters to narrow candidate records.
4. Review the "Subcontractor launch readiness" section and the "First verified profile queue".
5. Confirm the record has:
   - real trade/business name
   - trade subtype
   - canonical trade category when available
   - city/state
   - public-safe profile summary
   - claim or verification context
   - profile type or account capability set for subcontractor/trade work
   - rating model set to Trade Partner Reliability when the public view is a subcontractor/trade profile
   - duplicate identity signals resolved or documented
   - no private markers in the public summary
   - moderator note for the publication decision
6. Open the public profile preview from the readiness card.
7. Confirm the public page reads as a trade-partner dossier, not a generic contractor page.
8. Publish only after the profile passes privacy and moderation review.

## Supabase Readiness Query

Use this read-only query to find possible candidates and understand why a record is not ready yet:

```sql
with candidates as (
  select
    id,
    slug,
    display_name,
    business_name,
    profile_type,
    account_capabilities,
    city,
    state,
    profile_subtype,
    trade_category,
    claimed_status,
    verification_level,
    verification_badges,
    is_public,
    public_summary,
    duplicate_group_key,
    public_field_redactions,
    redaction_note,
    rating_model,
    rating_score,
    rating_band,
    report_count,
    evidence_on_file_count,
    updated_at
  from public.entity_profiles
  where profile_type = 'subcontractor'
     or coalesce(account_capabilities, array[]::text[]) @> array['subcontractor']::text[]
),
scored as (
  select
    *,
    array_remove(array[
      case when coalesce(display_name, business_name) is null then 'real business or trade display name' end,
      case when city is null or state is null then 'city and state' end,
      case when profile_subtype is null then 'subcontractor subtype' end,
      case when trade_category is null and profile_subtype is null then 'trade category or clear subtype' end,
      case when public_summary is null or length(trim(public_summary)) < 40 then 'neutral public-safe summary' end,
      case
        when public_summary ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
          or public_summary ~* '(\\+?1[\\s.-]?)?(\\(?[0-9]{3}\\)?[\\s.-]?)?[0-9]{3}[\\s.-]?[0-9]{4}'
          or public_summary ~* '(storage/v1|s3://|evidence/|uploads/|admin note|internal note|staff note|gate code|lockbox)'
        then 'public summary must remove private identifiers or internal markers'
      end,
      case
        when claimed_status not in ('claimed', 'verified')
         and coalesce(array_length(verification_badges, 1), 0) = 0
         and coalesce(verification_level, '') not in ('business_verified', 'license_verified', 'insurance_verified', 'admin_verified')
        then 'claim, verification, or documented moderator context'
      end,
      case when is_public is not true then 'public visibility enabled after review' end,
      case when rating_model not in ('subcontractor_trade_partner_reliability', 'subcontractor_trade_partner_reliability_v3') then 'rating model set to Trade Partner Reliability' end,
      case when coalesce(rating_score, 0) <= 0 then 'Trade Partner Reliability Rating' end,
      case when claimed_status = 'disputed' then 'dispute resolved or clearly moderated before launch' end,
      case when duplicate_group_key is not null then 'duplicate identity group reviewed or resolved' end
    ], null) as missing_fields
  from candidates
)
select
  id,
  slug,
  coalesce(display_name, business_name) as public_name,
  city,
  state,
  profile_subtype,
  trade_category,
  claimed_status,
  verification_level,
  is_public,
  rating_model,
  rating_score,
  rating_band,
  report_count,
  evidence_on_file_count,
  duplicate_group_key,
  redaction_note,
  greatest(0, 100 - (coalesce(array_length(missing_fields, 1), 0) * 12)) as readiness_score,
  missing_fields,
  updated_at
from scored
order by readiness_score desc, is_public desc, updated_at desc;
```

## Publication Update Guardrails

Prefer the admin UI for publication because it keeps staff in the moderation workflow. If a record must be adjusted in Supabase, update only the real verified record after reviewing the fields above:

```sql
-- Replace <profile_id> with the real entity_profiles.id after staff review.
-- Do not run this for sample, fake, placeholder, or unverified records.
update public.entity_profiles
set
  profile_type = 'subcontractor',
  account_capabilities = (
    select array(
      select distinct value
      from unnest(coalesce(account_capabilities, array[]::text[]) || array['subcontractor']) as capability(value)
    )
  ),
  rating_model = 'subcontractor_trade_partner_reliability_v3',
  is_public = true,
  updated_at = now()
where id = '<profile_id>'
  and coalesce(display_name, business_name) is not null
  and city is not null
  and state is not null
  and public_summary is not null
  and length(trim(public_summary)) >= 40
  and coalesce(rating_score, 0) > 0
  and (
    claimed_status in ('claimed', 'verified')
    or coalesce(array_length(verification_badges, 1), 0) > 0
    or coalesce(verification_level, '') in ('business_verified', 'license_verified', 'insurance_verified', 'admin_verified')
  );
```

After any direct database adjustment, add or confirm an admin audit note in the Admin CRM explaining why the profile is safe to publish.

## Post-Publication Checks

After one real subcontractor profile is public:

```bash
SEO_BASE_URL=https://clientbureau.com npm run seo:check
LIVE_BASE_URL=https://clientbureau.com npm run verify:live
```

Expected outcome:

- `/profiles/subcontractor` links to at least one real public subcontractor detail page.
- `/profiles/subcontractor/[slug]` returns `200`.
- The profile has safe `WebPage`, `ProfilePage`, `Organization`, `BreadcrumbList`, and `ItemList` schema.
- There is no `AggregateRating`, fake review star markup, raw evidence, private identifier, pending content, rejected content, or admin note.
