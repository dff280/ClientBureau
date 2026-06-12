# Client Bureau SEO Launch Checklist

Use this after each production deploy and before re-running SEOptimer.

## On-Site

- Confirm `https://clientbureau.com` returns one canonical homepage with a 50-60 character title.
- Confirm homepage meta description stays between 120 and 160 characters.
- Confirm `/llms.txt`, `/robots.txt`, and `/sitemap.xml` return `200`.
- Confirm `/api/version` includes the current release date and `/sitemap.xml` uses that date for static public-page `lastmod` values.
- Confirm homepage source includes Organization, WebSite, SoftwareApplication, and FAQPage JSON-LD.
- Confirm contractor and subcontractor profile pages include WebPage, ProfilePage, Organization, BreadcrumbList, and ItemList JSON-LD without AggregateRating or fake review markup.
- Confirm LocalBusiness schema appears only after verified public phone and address env vars are set.
- Confirm public client profiles do not show raw client email, phone, street address, raw evidence, internal notes, or unapproved content.

## Environment

- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` for GA4 tracking.
- Set `NEXT_PUBLIC_META_PIXEL_ID` only when Meta retargeting is ready.
- Set public social profile URLs when official profiles exist.
- Set public phone and mailing address only after they are verified for public display.
- Let `scripts/vps-deploy.sh` stamp `RELEASE_DATE`, or set it manually in ISO format during manual deploys.

## DNS Email Records

If domain email is handled by MX/cPanel, start with:

```txt
SPF:   v=spf1 mx ~all
DMARC: v=DMARC1; p=none; rua=mailto:dmarc@clientbureau.com
```

Tighten DMARC after mail flow is verified.

## Off-Site Link Building

- Create official LinkedIn, Facebook, X, Instagram, and YouTube profiles as needed.
- Link those profiles back to `https://clientbureau.com`.
- Pursue contractor association listings, trade directories, vendor partner pages, and relevant local business citations.
