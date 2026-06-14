# Client Bureau Product Expansion Plan

Client Bureau should feel like a contractor trust operations platform, not a complaint site. The core promise is simple: help contractors screen clients before accepting work, document project experiences responsibly, manage client-facing agreement links, and keep public records moderated, fair, and privacy-safe.

## Product Positioning

- Primary message: Check the client before you take the job.
- Product category: moderated client-risk intelligence and contractor workflow records.
- Avoid: blacklist, shaming, automated debt collection, legal filing, public exposure of private identifiers.
- Use: documented contractor experiences, private matching, evidence reviewed privately, client response, moderated summaries, agreement links, payment follow-up records.

## Core Operating Model

1. Public trust layer
   - SEO-ready public client profiles.
   - Only admin-approved reports, responses, and discussion entries.
   - No raw phone, email, address, private evidence, internal notes, pending content, or rejected content.

2. Contractor command center
   - Three plain-language workflows: Screen & decide, Agree & sign, Document & resolve.
   - Client pipeline tracks where each potential or active job sits.
   - Job Files connect client checks, reports, evidence, contracts, payment follow-up, and resolution history.

3. Client agreement and invite path
   - Contractors create private agreement links.
   - Clients review terms, confirm identity, sign electronically, and can be invited into a limited client portal.
   - Payment timing can be tracked now; payment handling should stay limited until Stripe/payment compliance is fully designed.

4. Admin moderation CRM
   - One internal command center for report moderation, public profile edits, discussion review, uploads, contract oversight, recovery safeguards, and audit history.
   - Every status change, publication decision, deletion, visibility change, and safeguard review should be auditable.

## Feature Direction

### Phase 1: Clarity And Daily Use

- Keep the dashboard organized around contractor questions:
  - Should I accept this job?
  - Is the agreement signed before scheduling?
  - What documentation or follow-up needs attention?
- Make advanced tools collapsible or tabbed so contractors are not forced into long-scroll workflows.
- Keep admin pages dense but grouped by queue, record type, safeguard, and audit trail.

### Phase 2: Job Files

- Make Job Files the central private record for each important client or project.
- Each file should show:
  - Search/match history.
  - Watchlist alerts.
  - Intake assessment.
  - Agreement links and signature status.
  - Evidence summaries.
  - Report drafts/submissions.
  - Payment follow-up timeline.
  - Resolution/dispute status.

### Phase 3: Agreement Links And Client Portal

- Add reusable contract templates for service agreements, change orders, payment plans, completion certificates, and notice-of-nonpayment records.
- Add client link states: created, sent, viewed, identity confirmed, signed, countersigned, expired.
- Add a client portal invitation path from the signing link.
- Keep agreement records private unless both sides explicitly publish a resolution update or approved response.

### Phase 4: Payment Coordination

- Start with invoice timeline, deposit request status, milestone schedule, and payment-plan tracking.
- Stripe can support checkout/payment links after test-mode verification.
- Do not market escrow, fund holding, automatic calls, or legal collection until those workflows are reviewed by qualified payment/compliance counsel and implemented with the right provider controls.

### Phase 5: Recovery And Notice Readiness

- Keep recovery as private documentation: invoice timeline, respectful outreach log, response window, payment plan, and resolution status.
- Keep lien-related workflows as readiness checklists: deadline, jurisdiction note, contract context, evidence list, required review, and admin audit.
- Any actual notice sending, legal filing, or third-party collection handoff should be a separately reviewed partner workflow.

## UI Rules

- Contractors should see plain workflow names first and tool names second.
- Admins should see queues, assignments, statuses, decision reasons, and audit events.
- Public users should see careful, neutral wording and clear right-of-response paths.
- Forms should explain why each field matters without sounding like a legal threat.
- Empty states should tell users the next safe action.

## Launch Readiness Checks

- Contractor can search, submit a report, create a work file, create a signing link, and track evidence.
- Client can open a signing link, sign, and understand it is private.
- Admin can approve/reject/edit/delete records without stale UI.
- Approved reports update public profile counts and pages.
- Public pages do not leak private identifiers, raw evidence, pending content, rejected content, or internal notes.
- Sitemap includes only public marketing/legal/methodology pages and approved public client profiles.
