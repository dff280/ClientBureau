# Client Bureau Error Reporting Runbook

Use this after deploying the admin-visible error log. The goal is to let admins capture useful bug reports without digging through VPS logs or pasting sensitive customer/job data into chat.

## Database Prerequisite

Apply:

```sql
supabase/migrations/0025_site_error_reports.sql
```

The app is tolerant if the table is not installed yet, but production persistence requires the migration.

## Admin Review Flow

1. Open `/admin/error-log`.
2. Filter by status, severity, source, or route.
3. Copy the error ID, route, message, and reproduction notes when reporting a bug to Codex.
4. Move status through:
   - `new`
   - `triaged`
   - `in_progress`
   - `resolved`
   - `ignored`

## Public-Safe Reporting Endpoint

Error reports can be submitted with:

```http
POST /api/error-reports
Content-Type: application/json
```

Expected fields:

- `severity`: `info`, `low`, `medium`, `high`, or `critical`
- `source`: `manual`, `browser`, `server`, or `qa`
- `route`: affected path, such as `/admin/reports`
- `message`: short issue summary
- `notes`: optional reproduction steps
- `pageTitle`, `userAgent`, `browserLanguage`, `viewportWidth`, `viewportHeight`

The server redacts common raw emails, phone numbers, secrets, tokens, and private evidence paths before storage.

## Privacy Rules

Never paste or store:

- passwords
- service keys
- raw emails or phone numbers
- raw evidence paths
- private job addresses
- private contract snapshots
- access codes, gate codes, or lockbox codes
- pending/rejected report content
- admin notes unrelated to the bug

If a report requires private context, refer to the admin record ID and route instead.
