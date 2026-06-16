# Client Bureau Launch Finishing Roadmap

Use this roadmap as the product-quality bar for moving Client Bureau from "working platform" to "public launch candidate." It is intentionally practical: every item should either make the product easier to understand, safer to operate, more trustworthy, or more useful to contractors, subcontractors, service businesses, and clients.

Current production posture:

- Core and advanced Supabase mode are live and healthy when `/api/health` reports `coreLiveReady: true` and `platformCanUseSupabase: true`.
- Stripe remains deferred until product QA is stable.
- Android builds remain paused until a planned app checkpoint.
- Public positioning is database-first: Client Database, Contractor Database, Subcontractor Database.
- Public pages must never publish raw emails, phone numbers, street addresses, private job data, raw evidence paths, pending/rejected content, admin notes, or private contract snapshots.

## Finished Product Standard

Client Bureau should feel like a serious business-protection bureau, not a complaint board, generic SaaS template, or loose directory.

A new visitor should understand within five seconds:

- What it is: a business-protection and trust platform with three moderated public databases.
- Who it is for: contractors, subcontractors, service businesses, and clients who need response/correction paths.
- What to do first: check a client, browse a database, report a documented experience, claim/correct a profile, or log in.
- What is public: moderated summaries, profile context, rating signals, response status, and approved public records.
- What stays private: evidence files, raw identifiers, job addresses, staff notes, private contracts, private recovery/lien details, and pending/rejected material.

Visual standard:

- Premium simple: spacious, official, fast to scan, strong typography, restrained navy/gold/white system.
- Three database identities:
  - Clients: amber/black, client checks, reported experiences, response rights.
  - Contractors: emerald/navy, business trust, verification, public-readiness.
  - Subcontractors: blue/navy, trade partner context, payment-chain documentation.
- Every page should have one obvious primary action and no unnecessary button clusters.
- Mobile web should feel deliberately designed, not compressed desktop.

## 1. Deployment And Release Truth

Finish this before doing another broad visual sprint.

- Deploy the latest `origin/main` to the VPS.
- Confirm live `/api/version` matches the latest GitHub commit.
- Run:

```powershell
$env:LIVE_BASE_URL="https://clientbureau.com"
npm run verify:live
Remove-Item Env:LIVE_BASE_URL

$env:SEO_BASE_URL="https://clientbureau.com"
npm run seo:check
Remove-Item Env:SEO_BASE_URL
```

- When disposable QA credentials exist, run:

```powershell
npm run verify:live:release-candidate
```

Manual VPS deploy block:

```bash
APP_DIR=/opt/ClientBureau
[ -d "$APP_DIR/.git" ] || APP_DIR=/opt/client-bureau

cd "$APP_DIR"
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose up -d --build
docker image prune -f
```

Do not paste root passwords into scripts, logs, docs, or committed files. Use interactive SSH, a password manager, or restore key-based deploy access.

## 2. Public Site Finish

Goal: the public site feels simple, authoritative, and database-first.

Must finish:

- Homepage remains short: hero search, three database pillars, before/during/after workflow, trust guardrails, final CTA.
- `/clients` feels like the official Client Database hub.
- `/profiles/contractor` feels like the Contractor Business Database.
- `/profiles/subcontractor` feels like the Subcontractor and Trade Partner Database.
- `/search` feels fast and product-like, but remains crawlable `noindex, follow`.
- `/client/[slug]` reads like a careful public dossier, not an accusation page.
- `/profiles/[profileType]/[slug]` uses profile-type-specific language and clear claim/correction paths.
- Resources and service pages support the three databases instead of competing with them.

Improve next:

- Add "how to read this record" modules to client, contractor, and subcontractor detail pages.
- Reduce any remaining dense feature grids on public pages into short proof strips and simple workflow sections.
- Make every public CTA map to one of five actions: check, browse, report, claim/correct, respond.
- Add stronger internal links between database hubs, methodology, evidence privacy, response/correction rights, and relevant service pages.
- Keep Search Console exclusions intentional: private routes blocked, utility pages noindex-follow, public canonical pages indexable.

## 3. Database Product Completion

Goal: the three databases feel like the lifeline of the platform.

Client Database:

- Search by name/business and state should be frictionless.
- Result cards should show name, location, context rating, report mix, evidence/response signal, and one action.
- Positive records should never show misleading `$0 unpaid` framing.
- Limited-history profiles should say limited history clearly instead of implying a negative finding.

Contractor Database:

- Profiles should emphasize business verification, service area, readiness, documentation habits, response/correction rights, and public trust.
- Admin classification must safely support contractor-only and contractor-plus-subcontractor capabilities.
- Public details should not reveal private verification phone, raw contact data, or internal notes.

Subcontractor Database:

- Publish only real verified subcontractor/trade profiles.
- The first verified profile must include trade category, city/state, public-safe summary, verification or claim status, visibility enabled, and moderator note.
- Result/detail pages should emphasize trade specialization, GC/sub relationship context, payment-chain documentation, retainage/pay-application context, evidence indicators, and correction paths.

Florida Location Coverage:

- Florida state and county pages should be useful and internally linked.
- Empty or thin city/CDP pages should remain noindex unless intentionally enabled with enough useful content or real profile/report inventory.
- Future states should roll out only when there is enough profile, report, or service context to avoid doorway-style pages.

## 4. Contractor Dashboard Finish

Goal: a day-to-day business owner opens the dashboard and immediately knows what to do.

Dashboard home should prioritize:

- Check a Client.
- Today's Work.
- Alerts.
- Recent Jobs.
- Recent Reports.
- Active Recovery/Lien/Contract items.
- Clear empty states when the account is new.

Jobs should become the private project file:

- Job identity, job number, status, priority, address/site info, scope, participants, contracts, evidence, reports, recovery, lien service, and activity should connect naturally.
- Participant role copy must explain "role on this job" versus account/profile type.
- Adding/removing a participant must never delete or duplicate the underlying profile/account.

Tool pages should finish with:

- One primary action.
- Current records first.
- Collapsed create/edit panels.
- Clear success states after each mutation.
- Plain-English "what happens next."
- No blank pages when Supabase returns empty data.

Highest-value contractor QA:

- Sign up.
- Log in.
- Create a Job.
- Add participants.
- Save/watch a client search.
- Submit positive and payment-issue reports.
- Create a contract packet.
- Open Payment Recovery.
- Open Florida Lien Service.
- Update evidence status.
- Confirm refresh persistence.

## 5. Admin CRM Finish

Goal: admin feels like an operations control room, not a collection of internal pages.

Admin command center should show:

- What needs action today.
- Pending reports, discussions, claims, profile readiness, evidence, recovery/lien, contracts, uploads, audit events.
- Live health/readiness.
- Direct links to the correct queue.

Admin profiles should become the master identity surface:

- Account classification: client, contractor, subcontractor, or multiple capabilities.
- Readiness score.
- Missing required fields.
- Public preview links.
- Verification/claim status.
- Rating model.
- Moderator note requirement.
- Safe visibility controls.

Report moderation should feel complete:

- Evidence status.
- Safety checklist.
- Edited public summary preview.
- Decision presets.
- Moderator/audit note.
- Approve/reject/delete updates the queue without stale cards.

Admin QA must prove:

- Admin stays signed in while moving between admin pages.
- Contractor users cannot access `/admin`.
- Profile edits persist and do not leak private identifiers.
- Public previews stay privacy-safe.
- Audit notes are required where expected.

## 6. SEO And Crawl Finish

Goal: Google sees a clean, intentional, useful public architecture.

Keep:

- Public database/profile/resource/service pages indexable.
- `/search`, login, signup, submit-report, and similar utility routes crawlable noindex-follow unless they are truly private.
- Dashboard, admin, API, tokenized contracts, and private workspace routes blocked/protected.
- Sitemap limited to canonical, useful, indexable URLs.

Finish:

- Resubmit `https://clientbureau.com/sitemap.xml` after the latest deploy.
- Use Search Console exports with:

```powershell
npm run seo:indexability -- --input=<search-console-export.csv>
```

- Review "Blocked by robots.txt" and separate intentional private blocks from accidental public blocks.
- Review "Alternate page with proper canonical tag" and confirm duplicates are intentional.
- Strengthen thin but useful public pages with unique content, internal links, and clear next actions.

Do not:

- Use fake profiles or fake reports for SEO.
- Add fake review stars or `AggregateRating`.
- Use blacklist language, guarantees, legal-advice claims, or fake urgency.

## 7. Revenue Readiness Later

Stripe should wait until signed-in QA is stable.

Before launch billing:

- Configure Stripe test mode env values.
- Test subscription checkout.
- Test webhook subscription updates.
- Test service-fee checkout for Payment Recovery and Florida Lien Service.
- Confirm billing copy is conservative and does not imply guaranteed collection, legal outcome, lien priority, or payment enforcement.

## 8. Mobile Finish Later

Mobile web comes before native app release.

Mobile web finish:

- Homepage and all database hubs have no horizontal overflow.
- Header/menu is simple and thumb-friendly.
- Search and profile pages are easy to scan.
- Forms do not bury primary submit buttons.

Android app checkpoint:

- Continue app polish only after web launch confidence improves.
- Do not build APK/AAB until explicitly requested.
- App should mirror the three-database product story and make Check a Client the dominant action.

## Launch Candidate Order

1. Deploy latest GitHub `main`.
2. Run public live verification and SEO.
3. Publish one real verified subcontractor profile if available.
4. Configure disposable contractor/admin QA accounts.
5. Run strict authenticated release-candidate verification.
6. Fix any session, stale-card, blank-state, mutation-feedback, or mobile layout issues found.
7. Do one final public-page simplification pass based on browser QA.
8. Freeze scope for launch.
9. Configure Stripe test mode only when ready for revenue testing.
10. Tag the launch candidate.

## Definition Of Done

Client Bureau is launch-ready when:

- GitHub and production serve the same verified commit.
- `/api/health` is green.
- Local checks pass: lint, test, build, route inventory, workspace quality, SEO local, mobile readiness.
- Live checks pass: release verification, SEO, and authenticated release-candidate QA.
- A new visitor understands the three databases in under five seconds.
- Contractor dashboard workflows work with clear feedback.
- Admin workflows work without session loss.
- Public pages pass privacy and copy-safety checks.
- Search Console issues are either fixed or intentionally documented as private/noindex/canonical exclusions.
- No fake profiles, fake reviews, unsafe schema, private data leaks, or overpromising legal/payment language exist.
