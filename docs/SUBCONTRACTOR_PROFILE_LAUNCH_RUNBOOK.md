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
   - moderator note for the publication decision
6. Open the public profile preview from the readiness card.
7. Confirm the public page reads as a trade-partner dossier, not a generic contractor page.
8. Publish only after the profile passes privacy and moderation review.

## Supabase Review Query

Use this read-only query to find possible candidates:

```sql
select
  id,
  display_name,
  business_name,
  profile_type,
  account_capabilities,
  city,
  state,
  profile_subtype,
  claimed_status,
  is_public,
  rating_score,
  rating_band,
  report_count,
  evidence_on_file_count,
  updated_at
from public.entity_profiles
where profile_type = 'subcontractor'
   or account_capabilities @> array['subcontractor']::text[]
order by is_public desc, updated_at desc;
```

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
