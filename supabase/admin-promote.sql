-- Replace the email before running in the Supabase SQL editor.
-- Use this after creating your first account through /signup.

update public.users
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';

select id, email, full_name, role, created_at
from public.users
where email = 'YOUR_ADMIN_EMAIL@example.com';
