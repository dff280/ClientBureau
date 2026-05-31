-- Client Bureau MVP schema. This migration is designed for Supabase Postgres.
-- Public client pages must only expose admin-approved report summaries.

create type public.user_role as enum ('contractor', 'admin');
create type public.verification_status as enum ('unverified', 'pending', 'verified');
create type public.risk_level as enum ('Low', 'Moderate', 'Elevated', 'High');
create type public.report_status as enum ('pending', 'approved', 'rejected', 'disputed');
create type public.subscription_tier as enum ('free', 'pro', 'bureau_team');
create type public.admin_review_status as enum ('queued', 'approved', 'rejected', 'needs_dispute_review');
create type public.client_response_status as enum ('pending', 'published', 'rejected');
create type public.report_category as enum (
  'Non-payment',
  'Late payment',
  'Scope creep',
  'Chargeback',
  'False complaint',
  'Abusive behavior',
  'No-show / cancellation',
  'Positive experience',
  'Would work with again',
  'Other'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'contractor',
  created_at timestamptz not null default now()
);

create table public.contractor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  business_name text not null,
  trade text not null,
  city text not null,
  state text not null,
  license_number text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  business_name text,
  city text not null,
  state text not null,
  zip text,
  phone_hash text not null,
  email_hash text not null,
  public_slug text not null unique,
  client_bureau_score integer not null default 78 check (client_bureau_score between 0 and 100),
  risk_level public.risk_level not null default 'Moderate',
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_public boolean not null default false
);

create table public.client_reports (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.contractor_profiles(id) on delete cascade,
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  project_type text not null,
  project_city text not null,
  project_state text not null,
  contract_amount numeric(12, 2) not null default 0,
  amount_unpaid numeric(12, 2) not null default 0,
  report_category public.report_category not null,
  payment_status text not null,
  report_summary text not null,
  detailed_experience text not null,
  public_summary text not null default '',
  evidence_attached boolean not null default false,
  status public.report_status not null default 'pending',
  moderation_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.client_reports(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);

create table public.client_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  report_id uuid references public.client_reports(id) on delete set null,
  response_summary text not null,
  status public.client_response_status not null default 'pending',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null unique references public.contractor_profiles(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  status text not null default 'mock',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz
);

create table public.admin_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.client_reports(id) on delete cascade,
  reviewer_id uuid references public.users(id) on delete set null,
  status public.admin_review_status not null default 'queued',
  edited_public_summary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_profiles_public_slug_idx on public.client_profiles(public_slug);
create index client_profiles_identity_hash_idx on public.client_profiles(phone_hash, email_hash);
create index client_profiles_public_search_idx on public.client_profiles(is_public, first_name, last_name, city, state);
create index client_reports_status_client_idx on public.client_reports(status, client_id);
create index client_reports_contractor_idx on public.client_reports(contractor_id);
create index report_evidence_report_idx on public.report_evidence(report_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger client_profiles_set_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();

create trigger admin_reviews_set_updated_at
before update on public.admin_reviews
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.contractor_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_reports enable row level security;
alter table public.report_evidence enable row level security;
alter table public.client_responses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.admin_reviews enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  );
$$;

create policy "Users can read own profile"
on public.users for select
using (id = auth.uid() or public.is_admin());

create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "Contractors manage own profile"
on public.contractor_profiles for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Public can read public client profiles"
on public.client_profiles for select
using (is_public = true);

create policy "Authenticated contractors can create private client profiles"
on public.client_profiles for insert
to authenticated
with check (true);

create policy "Admins manage client profiles"
on public.client_profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Contractors read own reports and public approved reports"
on public.client_reports for select
using (
  public.is_admin()
  or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  or (
    status in ('approved', 'disputed')
    and client_id in (select id from public.client_profiles where is_public = true)
  )
);

create policy "Contractors create own reports"
on public.client_reports for insert
to authenticated
with check (
  contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
);

create policy "Admins update reports"
on public.client_reports for update
using (public.is_admin())
with check (public.is_admin());

create policy "Evidence visible to owner contractor and admins"
on public.report_evidence for select
using (
  public.is_admin()
  or report_id in (
    select client_reports.id
    from public.client_reports
    join public.contractor_profiles on contractor_profiles.id = client_reports.contractor_id
    where contractor_profiles.user_id = auth.uid()
  )
);

create policy "Contractors upload evidence for own reports"
on public.report_evidence for insert
to authenticated
with check (
  report_id in (
    select client_reports.id
    from public.client_reports
    join public.contractor_profiles on contractor_profiles.id = client_reports.contractor_id
    where contractor_profiles.user_id = auth.uid()
  )
);

create policy "Published client responses are public"
on public.client_responses for select
using (status = 'published' or public.is_admin());

create policy "Anyone can submit a pending client response"
on public.client_responses for insert
with check (status = 'pending');

create policy "Admins update client responses"
on public.client_responses for update
using (public.is_admin())
with check (public.is_admin());

create policy "Contractors read own subscription"
on public.subscriptions for select
using (
  public.is_admin()
  or contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
);

create policy "Admins manage subscriptions"
on public.subscriptions for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage reviews"
on public.admin_reviews for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('report-evidence', 'report-evidence', false)
on conflict (id) do nothing;

create policy "Evidence objects visible to owner contractor and admins"
on storage.objects for select
using (
  bucket_id = 'report-evidence'
  and (
    public.is_admin()
    or name in (
      select report_evidence.storage_path
      from public.report_evidence
      join public.client_reports on client_reports.id = report_evidence.report_id
      join public.contractor_profiles on contractor_profiles.id = client_reports.contractor_id
      where contractor_profiles.user_id = auth.uid()
    )
  )
);

create policy "Contractors upload report evidence objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'report-evidence'
  and (storage.foldername(name))[1] = 'report-evidence'
);
