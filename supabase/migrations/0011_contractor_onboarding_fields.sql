-- Client Bureau contractor onboarding enrichment.
-- Nullable fields keep existing contractor profiles and signup flows backward-compatible.

alter table public.contractor_profiles
  add column if not exists business_type text,
  add column if not exists business_phone text,
  add column if not exists website_url text,
  add column if not exists service_area text,
  add column if not exists company_size text,
  add column if not exists years_in_business text,
  add column if not exists primary_goal text;

create index if not exists contractor_profiles_business_type_idx
  on public.contractor_profiles (business_type);

create index if not exists contractor_profiles_state_city_idx
  on public.contractor_profiles (state, city);
