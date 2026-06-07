-- Client Bureau search activation tables.
-- Optional launch migration: search and profile UI continues to work without these tables.

create table if not exists public.saved_client_searches (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references public.contractor_profiles(id) on delete cascade,
  query text not null default '',
  city text,
  state text,
  risk_level public.risk_level,
  category public.report_category,
  result_count integer not null default 0 check (result_count >= 0),
  source text not null default 'supabase' check (source in ('local', 'mock', 'supabase')),
  created_at timestamptz not null default now(),
  last_run_at timestamptz
);

create unique index if not exists saved_client_searches_unique_contractor_query
  on public.saved_client_searches (
    contractor_id,
    lower(query),
    coalesce(state, ''),
    coalesce(risk_level::text, ''),
    coalesce(category::text, '')
  );

create index if not exists saved_client_searches_contractor_created_idx
  on public.saved_client_searches (contractor_id, created_at desc);

create table if not exists public.search_analytics_events (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references public.contractor_profiles(id) on delete set null,
  query text,
  state text,
  risk_level public.risk_level,
  category public.report_category,
  result_count integer check (result_count is null or result_count >= 0),
  event_type text not null check (
    event_type in (
      'search_submitted',
      'suggestion_clicked',
      'result_viewed',
      'save_search',
      'private_identifier_check',
      'no_result'
    )
  ),
  source text not null default 'search_page' check (
    source in ('search_page', 'profile_page', 'directory', 'dashboard')
  ),
  created_at timestamptz not null default now()
);

create index if not exists search_analytics_events_created_idx
  on public.search_analytics_events (created_at desc);

create index if not exists search_analytics_events_contractor_idx
  on public.search_analytics_events (contractor_id, created_at desc);

create table if not exists public.profile_share_events (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references public.contractor_profiles(id) on delete set null,
  profile_slug text not null,
  channel text not null check (channel in ('copy_link', 'profile_card', 'referral_badge', 'social')),
  source text not null default 'profile_page' check (
    source in ('profile_page', 'directory', 'dashboard')
  ),
  created_at timestamptz not null default now()
);

create index if not exists profile_share_events_profile_idx
  on public.profile_share_events (profile_slug, created_at desc);

create index if not exists profile_share_events_contractor_idx
  on public.profile_share_events (contractor_id, created_at desc);

alter table public.saved_client_searches enable row level security;
alter table public.search_analytics_events enable row level security;
alter table public.profile_share_events enable row level security;

drop policy if exists "Contractors manage own saved searches" on public.saved_client_searches;
create policy "Contractors manage own saved searches"
  on public.saved_client_searches
  for all
  using (
    exists (
      select 1
      from public.contractor_profiles cp
      where cp.id = saved_client_searches.contractor_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.contractor_profiles cp
      where cp.id = saved_client_searches.contractor_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Admins read saved searches" on public.saved_client_searches;
create policy "Admins read saved searches"
  on public.saved_client_searches
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'admin'
    )
  );

drop policy if exists "Contractors insert own search events" on public.search_analytics_events;
create policy "Contractors insert own search events"
  on public.search_analytics_events
  for insert
  with check (
    contractor_id is null
    or exists (
      select 1
      from public.contractor_profiles cp
      where cp.id = search_analytics_events.contractor_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Admins read search events" on public.search_analytics_events;
create policy "Admins read search events"
  on public.search_analytics_events
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'admin'
    )
  );

drop policy if exists "Contractors insert own profile share events" on public.profile_share_events;
create policy "Contractors insert own profile share events"
  on public.profile_share_events
  for insert
  with check (
    contractor_id is null
    or exists (
      select 1
      from public.contractor_profiles cp
      where cp.id = profile_share_events.contractor_id
        and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Admins read profile share events" on public.profile_share_events;
create policy "Admins read profile share events"
  on public.profile_share_events
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.role = 'admin'
    )
  );
