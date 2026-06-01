# Client Bureau VPS Deployment

This guide deploys Client Bureau on an Ubuntu VPS with Docker Compose and Caddy. Caddy owns ports `80` and `443` and provisions HTTPS automatically.

Production target:

```text
Domain: clientbureau.com
VPS IP: 5.78.231.192
```

## 1. DNS

In your DNS provider, point the web records to the VPS public IP:

```text
A @   -> 5.78.231.192
A www -> 5.78.231.192
```

Keep existing `MX`, `TXT`, SPF, DKIM, and DMARC records if cPanel or another provider handles email.

## 2. Supabase

1. Create a fresh Supabase project.
2. Open SQL Editor and run `supabase/migrations/0001_client_bureau_schema.sql`.
3. Confirm the private Storage bucket `report-evidence` exists.
4. Copy these values for `.env.production`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` or service role key
5. Create the first admin by signing up normally, then update the `users.role` value to `admin` in Supabase.

Admin promotion SQL:

```sql
update public.users
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

Then log out and log back in. The admin panel is:

```text
https://clientbureau.com/admin/reviews
```

## 3. Stripe Test Mode

1. In Stripe test mode, create products for Pro Contractor and Bureau Team.
2. Create recurring monthly prices and copy them into:
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_TEAM_MONTHLY`
3. Copy the test secret key into `STRIPE_SECRET_KEY`.
4. Add a webhook endpoint:

```text
https://clientbureau.com/api/stripe/webhook
```

Subscribe to:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## 4. Upload Source Through GitHub

Install Git for Windows locally if needed, then from the project folder:

```bash
git init
git add .
git commit -m "Launch Client Bureau MVP"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/client-bureau.git
git push -u origin main
```

Use a private GitHub repository until legal copy, moderation workflow, and test billing are verified.

## 5. Prepare The VPS

SSH into the VPS as a sudo user:

```bash
ssh root@5.78.231.192
```

Install Docker and Compose on Ubuntu:

```bash
apt update
apt install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Clone the repo:

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/dff280/ClientBureau.git
cd /opt/client-bureau
```

Create the production environment file:

```bash
cp .env.production.example .env.production
nano .env.production
```

Minimum production values:

```text
DATA_MODE=supabase
NEXT_PUBLIC_SITE_URL=https://clientbureau.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=...
```

Generate the server action encryption key:

```bash
openssl rand -base64 32
```

## 6. Start The App

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f caddy
```

Caddy should request certificates for `clientbureau.com` and `www.clientbureau.com`.

## 7. Updates

After pushing code changes to GitHub:

```bash
ssh root@5.78.231.192
cd /opt/client-bureau
git pull
docker compose up -d --build
docker image prune -f
```

## 8. Launch Checklist

Run locally before pushing:

```bash
npm run lint
npm test
npm run build
```

Verify on the VPS:

```bash
docker compose ps
curl -I https://clientbureau.com
curl https://clientbureau.com/robots.txt
curl https://clientbureau.com/sitemap.xml
```

From your local Windows machine, this repository also includes:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-launch.ps1
```

Browser-check these routes on desktop and mobile:

```text
/
/pricing
/how-it-works
/search
/submit-report
/dashboard
/admin/reviews
/client/john-smith-orlando-fl
/terms
/privacy
/report-policy
/dispute-policy
/moderation-policy
```

Before allowing Google to index real client reports, confirm:

- Public pages never show raw phone numbers or email addresses.
- Pending and rejected reports do not appear on public profiles.
- Client response and dispute links are visible on public profiles.
- Admin approval publishes or updates the client profile.
- Stripe test checkout completes and webhooks update subscription status.
- cPanel or any existing web server is not bound to ports `80` or `443` for this domain.

## 9. Admin Approval Smoke Test

After creating a contractor account and submitting a test report:

1. Promote your admin account in Supabase:

```sql
update public.users
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

2. Open `https://clientbureau.com/admin/reviews`.
3. Edit the public summary so it uses reported-experience language.
4. Check:
   - Evidence reviewed
   - Public summary is neutral and fact-based
   - Phone and email are not visible publicly
5. Click `Approve and publish`.
6. Use the `Public profile` link shown in the admin panel.
7. Confirm the public profile loads at:

```text
https://clientbureau.com/client/generated-client-slug
```

8. Confirm the profile is listed in the sitemap:

```bash
curl https://clientbureau.com/sitemap.xml | grep /client/
```

Useful Supabase checks:

```sql
select
  cp.first_name,
  cp.last_name,
  cp.public_slug,
  cp.is_public,
  cp.client_bureau_score,
  cp.risk_level,
  cp.report_count,
  cr.status,
  cr.public_summary
from public.client_reports cr
join public.client_profiles cp on cp.id = cr.client_id
order by cr.created_at desc
limit 20;
```
