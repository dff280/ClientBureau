# Public Inquiry Intake Runbook

Client Bureau uses the public inquiry intake for short support-routing and enterprise-review requests. It is not a place for raw evidence, private client identifiers, contracts, invoices, screenshots, banking details, access codes, threats, or detailed dispute records.

## Public Paths

- `/contact` handles general support routing.
- `/enterprise` handles scoped team and enterprise review requests.
- `/client-response`, `/claim-profile`, `/submit-report`, and authenticated dashboard tools remain the right paths for detailed records and documentation.

## Private Storage

Apply `supabase/migrations/0023_public_inquiry_intake.sql` before enabling the release in Supabase mode.

Submissions are stored in `public.public_inquiries` with:

- inquiry type and topic
- name and optional business name
- private reply email
- masked and hashed email values
- short routing message
- source page
- private status and admin note

The table has RLS enabled. Public users do not read the queue. Submissions are created by the server action through the service client, and admins review the queue in `/admin/settings#public-inquiries`.

## Admin Handling

1. Open `/admin/settings#public-inquiries`.
2. Triage `new` and `reviewing` inquiries first.
3. Reply through the private contact email shown in the admin-only card.
4. Route evidence, profile ownership, response, correction, report, recovery, lien, or contract issues into the dedicated workflow.
5. Do not copy raw evidence or sensitive identifiers into public summaries, analytics URLs, screenshots, or crawler-visible pages.

## Release Gate

Public copy checks fail if contact pages expose placeholder wording such as:

- `configured in production`
- `contact details appear here`
- `appear here when configured`
- `coming soon`

The public site should either show verified public contact information from configured env values or route visitors through the inquiry form and guided workflows.
