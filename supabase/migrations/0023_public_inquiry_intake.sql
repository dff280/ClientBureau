-- Client Bureau public inquiry intake.
-- Stores privacy-safe support and enterprise inquiries in a private admin queue.

create table if not exists public.public_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('general_support', 'enterprise')),
  topic text not null check (
    topic in (
      'account_help',
      'report_or_moderation',
      'client_response_or_correction',
      'profile_claim_or_verification',
      'enterprise_or_team_review',
      'privacy_or_policy',
      'other'
    )
  ),
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  business_name text,
  contact_email text not null,
  contact_email_hash text not null,
  contact_email_masked text not null,
  message text not null check (char_length(trim(message)) between 20 and 1200),
  source_path text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'spam', 'archived')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists public_inquiries_set_updated_at on public.public_inquiries;
create trigger public_inquiries_set_updated_at
before update on public.public_inquiries
for each row execute function public.set_updated_at();

create index if not exists public_inquiries_status_created_idx
  on public.public_inquiries (status, created_at desc);

create index if not exists public_inquiries_email_topic_recent_idx
  on public.public_inquiries (contact_email_hash, topic, created_at desc);

alter table public.public_inquiries enable row level security;

drop policy if exists "Admins read public inquiries" on public.public_inquiries;
create policy "Admins read public inquiries"
on public.public_inquiries for select
using (public.is_admin());

drop policy if exists "Admins manage public inquiries" on public.public_inquiries;
create policy "Admins manage public inquiries"
on public.public_inquiries for update
using (public.is_admin())
with check (public.is_admin());

comment on table public.public_inquiries is
  'Private support and enterprise inquiry queue. Public users submit through server actions; admins review privately.';

comment on column public.public_inquiries.contact_email is
  'Private reply-to email for staff use only. Never expose on public pages, crawler assets, or analytics URLs.';

comment on column public.public_inquiries.message is
  'General inquiry text only. Raw evidence, private identifiers, and sensitive case details belong in dedicated private workflows.';
