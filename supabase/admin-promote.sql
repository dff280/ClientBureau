-- Replace the email, then run this in Supabase SQL Editor.
-- This repairs both cases:
-- 1. public.users row exists but role is still contractor
-- 2. auth.users exists but public.users row was never created

with target_auth_user as (
  select
    id,
    email,
    coalesce(
      raw_user_meta_data ->> 'full_name',
      raw_user_meta_data ->> 'fullName',
      email
    ) as full_name
  from auth.users
  where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com')
  limit 1
)
insert into public.users (id, email, full_name, role)
select id, email, full_name, 'admin'::public.user_role
from target_auth_user
on conflict (id)
do update set
  email = excluded.email,
  full_name = coalesce(nullif(public.users.full_name, ''), excluded.full_name),
  role = 'admin'::public.user_role;

select
  public.users.id,
  public.users.email,
  public.users.full_name,
  public.users.role,
  auth.users.last_sign_in_at,
  auth.users.email_confirmed_at
from public.users
join auth.users on auth.users.id = public.users.id
where lower(public.users.email) = lower('YOUR_ADMIN_EMAIL@example.com');
