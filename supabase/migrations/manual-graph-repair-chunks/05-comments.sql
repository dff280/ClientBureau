-- Client Bureau graph repair chunk: privacy comments
-- Run chunks 01 through 05 in order in Supabase SQL Editor.

comment on column public.project_jobs.project_address_private is
  'Street address and precise location are private and must not appear on public profile pages.';

comment on column public.client_responses.entity_profile_id is
  'Optional unified profile target for responses, disputes, corrections, and resolution updates.';

comment on column public.client_responses.project_job_id is
  'Optional private project/job context for response moderation. Public pages show only approved response summaries.';

comment on column public.client_responses.attachment_reference_private is
  'Private documentation reference for moderator review. Raw files, URLs, and sensitive documents must not be rendered publicly.';
