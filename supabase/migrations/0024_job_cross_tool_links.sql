-- Link private project/job files to the contractor tools that are created from them.
-- These columns are nullable so existing live records and mock-safe flows continue to work.

alter table if exists public.report_drafts
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.payment_recovery_cases
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.managed_recovery_cases
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.lien_notice_drafts
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.florida_lien_cases
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.contract_workspace_items
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.contract_packets
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

alter table if exists public.evidence_vault_items
  add column if not exists project_job_id uuid references public.project_jobs(id) on delete set null;

create index if not exists report_drafts_project_job_idx
  on public.report_drafts(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists payment_recovery_cases_project_job_idx
  on public.payment_recovery_cases(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists managed_recovery_cases_project_job_idx
  on public.managed_recovery_cases(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists lien_notice_drafts_project_job_idx
  on public.lien_notice_drafts(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists florida_lien_cases_project_job_idx
  on public.florida_lien_cases(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists contract_workspace_items_project_job_idx
  on public.contract_workspace_items(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists contract_packets_project_job_idx
  on public.contract_packets(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

create index if not exists evidence_vault_items_project_job_idx
  on public.evidence_vault_items(project_job_id, contractor_id, updated_at desc)
  where project_job_id is not null;

comment on column public.report_drafts.project_job_id is
  'Private project/job file link. Never expose job address, access notes, or private job notes publicly.';

comment on column public.payment_recovery_cases.project_job_id is
  'Private project/job file link for contractor payment recovery workflow.';

comment on column public.managed_recovery_cases.project_job_id is
  'Private project/job file link for managed Resolution Desk workflow.';

comment on column public.lien_notice_drafts.project_job_id is
  'Private project/job file link for lien notice readiness workflow.';

comment on column public.florida_lien_cases.project_job_id is
  'Private project/job file link for Florida lien service workflow.';

comment on column public.contract_workspace_items.project_job_id is
  'Private project/job file link for contract drafting workspace records.';

comment on column public.contract_packets.project_job_id is
  'Private project/job file link for agreement packet records.';

comment on column public.evidence_vault_items.project_job_id is
  'Private project/job file link for evidence vault records.';
