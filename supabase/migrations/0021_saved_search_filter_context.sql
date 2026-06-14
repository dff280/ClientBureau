-- Client Bureau saved-search filter context.
-- Keeps contractor/subcontractor/client and trade-category filters attached to saved searches and analytics.

alter table public.saved_client_searches
  add column if not exists profile_type public.profile_type,
  add column if not exists trade_category text;

alter table public.search_analytics_events
  add column if not exists profile_type public.profile_type,
  add column if not exists trade_category text;

drop index if exists public.saved_client_searches_unique_contractor_query;

create unique index if not exists saved_client_searches_unique_contractor_query_context
  on public.saved_client_searches (
    contractor_id,
    lower(query),
    coalesce(state, ''),
    coalesce(risk_level::text, ''),
    coalesce(category::text, ''),
    coalesce(profile_type::text, ''),
    coalesce(trade_category, '')
  );

create index if not exists saved_client_searches_filter_context_idx
  on public.saved_client_searches (contractor_id, profile_type, trade_category, created_at desc);

create index if not exists search_analytics_events_filter_context_idx
  on public.search_analytics_events (contractor_id, profile_type, trade_category, created_at desc);
