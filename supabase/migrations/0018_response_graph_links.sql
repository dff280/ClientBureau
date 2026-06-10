-- Client Bureau response/correction graph links.
-- Keeps legacy client responses working while allowing responses to attach to unified profiles and project/job records.

alter table public.client_responses
  alter column client_id drop not null,
  add column if not exists entity_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null,
  add column if not exists request_type text,
  add column if not exists verification_method text,
  add column if not exists attachment_reference_private text;

create index if not exists client_responses_entity_profile_idx
  on public.client_responses(entity_profile_id, status, created_at desc)
  where entity_profile_id is not null;

create index if not exists client_responses_project_job_idx
  on public.client_responses(project_job_id, status, created_at desc)
  where project_job_id is not null;

comment on column public.client_responses.entity_profile_id is
  'Optional unified profile target for responses, disputes, corrections, and resolution updates.';

comment on column public.client_responses.project_job_id is
  'Optional private project/job context for response moderation. Public pages show only approved response summaries.';

comment on column public.client_responses.attachment_reference_private is
  'Private documentation reference for moderator review. Raw files, URLs, and sensitive documents must not be rendered publicly.';
