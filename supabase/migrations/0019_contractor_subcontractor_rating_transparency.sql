-- Client Bureau contractor/subcontractor rating transparency.
-- Additive and safe: existing report/profile flows continue working if this migration has not been applied yet.

alter table public.entity_profiles
  add column if not exists rating_model text,
  add column if not exists rating_version text,
  add column if not exists rating_confidence text,
  add column if not exists rating_factors jsonb not null default '[]'::jsonb,
  add column if not exists rating_public_note text,
  add column if not exists rating_last_calculated_at timestamptz;

alter table public.entity_profiles
  drop constraint if exists entity_profiles_rating_model_check;

alter table public.entity_profiles
  add constraint entity_profiles_rating_model_check
  check (
    rating_model is null
    or rating_model in (
      'client_risk',
      'contractor_business_reliability',
      'subcontractor_trade_partner_reliability'
    )
  );

create index if not exists entity_profiles_rating_model_idx
  on public.entity_profiles(profile_type, rating_model, rating_score desc)
  where is_public = true;

create index if not exists entity_profiles_rating_calculated_idx
  on public.entity_profiles(rating_last_calculated_at desc)
  where rating_last_calculated_at is not null;

create table if not exists public.profile_rating_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.entity_profiles(id) on delete cascade,
  profile_type public.profile_type not null,
  rating_model text not null,
  rating_version text not null,
  previous_score integer,
  next_score integer not null check (next_score >= 0 and next_score <= 100),
  previous_band text,
  next_band text not null,
  confidence text not null,
  factor_snapshot jsonb not null default '[]'::jsonb,
  source_report_id uuid references public.client_reports(id) on delete set null,
  recalculated_by uuid references auth.users(id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint profile_rating_events_model_check check (
    rating_model in (
      'client_risk',
      'contractor_business_reliability',
      'subcontractor_trade_partner_reliability'
    )
  )
);

create index if not exists profile_rating_events_profile_idx
  on public.profile_rating_events(profile_id, created_at desc);

create index if not exists profile_rating_events_model_idx
  on public.profile_rating_events(rating_model, created_at desc);

alter table public.profile_rating_events enable row level security;

drop policy if exists "Admins can manage profile rating events" on public.profile_rating_events;
create policy "Admins can manage profile rating events"
  on public.profile_rating_events for all
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

drop policy if exists "Public can read rating events for public profiles" on public.profile_rating_events;
create policy "Public can read rating events for public profiles"
  on public.profile_rating_events for select
  using (
    exists (
      select 1
      from public.entity_profiles p
      where p.id = profile_rating_events.profile_id
        and p.is_public = true
    )
  );

alter table public.client_reports
  add column if not exists reported_business_role text,
  add column if not exists counterparty_business_role text,
  add column if not exists hiring_party_name_private text,
  add column if not exists scope_documentation_status text,
  add column if not exists work_authorization_status text,
  add column if not exists retainage_amount numeric,
  add column if not exists payment_application_reference text,
  add column if not exists license_insurance_context text,
  add column if not exists relationship_verification_summary text;

create index if not exists client_reports_business_relationship_idx
  on public.client_reports(subject_profile_type, relationship_type, status, created_at desc);

create index if not exists client_reports_payment_chain_idx
  on public.client_reports(retainage_amount, days_overdue)
  where retainage_amount is not null or days_overdue is not null;

comment on column public.entity_profiles.rating_model is
  'Public-safe rating model identifier. Contractor and subcontractor ratings use different models.';

comment on column public.entity_profiles.rating_factors is
  'Public-safe rating factor snapshot. Do not store private identifiers, raw evidence paths, or staff notes.';

comment on table public.profile_rating_events is
  'Audit history for public-safe profile rating recalculations and factor snapshots.';

comment on column public.client_reports.hiring_party_name_private is
  'Private hiring/prime/general contractor or counterparty context for moderation and matching. Never publish raw private names unless included in an approved public profile identity.';

comment on column public.client_reports.relationship_verification_summary is
  'Private summary explaining how the reporter knows the reported contractor/subcontractor and what documentation supports that relationship.';
