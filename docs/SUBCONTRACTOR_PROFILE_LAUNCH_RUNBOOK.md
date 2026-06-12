# Subcontractor Profile Launch Runbook

Use this runbook before pointing acquisition, SEO, or outreach campaigns at the public subcontractor directory.

Client Bureau should publish real subcontractor and trade-professional profiles only. Do not create fake, placeholder, or keyword-only subcontractor records to satisfy SEO checks.

## Publish Readiness

A public subcontractor profile is ready when staff can confirm:

- The record represents a real subcontractor, installer, crew, labor provider, specialty trade, or trade business.
- `profile_type` is `subcontractor`.
- The public display name, city, state, and subtype are accurate.
- The subtype clearly describes the trade role, such as licensed subcontractor, installer, crew, labor provider, or specialty trade.
- Claim status, verification status, or moderator notes support why the record can be public.
- The public summary is neutral, factual, and free of private identifiers.
- Any report context is admin-approved and public-safe.
- Evidence is summarized only as evidence-on-file indicators, never raw files or storage paths.
- Public preview shows no raw email, phone number, street address, private contract detail, private payment record, pending/rejected content, or admin note.

## Admin Workflow

1. Open `/admin/profiles`.
2. Filter profile type to `Subcontractor / trade pro`.
3. Review the “Subcontractor launch readiness” section.
4. Confirm the record has:
   - trade subtype
   - city/state
   - public-safe profile summary
   - claim or verification context
   - rating model set to Trade Partner Reliability
   - moderator note for the publication decision
5. Preview the public profile.
6. Publish only after the profile passes privacy and moderation review.

## Supabase Review Query

Use this read-only query to find possible candidates:

```sql
select
  id,
  display_name,
  business_name,
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

