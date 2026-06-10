-- Client Bureau graph backfill step: profile defaults
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

update public.entity_profiles
set
  profile_subtype = case
    when profile_type = 'client' and profile_subtype is null then 'Other'
    when profile_type = 'contractor' and profile_subtype is null then 'Service business'
    when profile_type = 'subcontractor' and profile_subtype is null then 'Other'
    else profile_subtype
  end,
  verification_level = case
    when claimed_status::text = 'verified' then 'admin_verified'::public.verification_level
    when claimed_status::text = 'claimed' then coalesce(verification_level, 'email_verified'::public.verification_level)
    else verification_level
  end,
  duplicate_group_key = coalesce(
    duplicate_group_key,
    lower(regexp_replace(concat_ws('|', profile_type::text, display_name, city, state), '[^a-zA-Z0-9|]+', '-', 'g'))
  ),
  updated_at = now();
