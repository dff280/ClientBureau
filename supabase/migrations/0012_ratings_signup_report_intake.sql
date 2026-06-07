-- Client Bureau ratings/sign-up/report-intake upgrade.
-- Safe rollout: all columns are nullable and existing role/status behavior is preserved.

do $$ begin
  create type public.account_type as enum ('contractor', 'client');
exception
  when duplicate_object then null;
end $$;

alter table public.users
  add column if not exists account_type public.account_type;

update public.users
set account_type = 'contractor'
where account_type is null
  and role = 'contractor';

create index if not exists users_account_type_idx
  on public.users (account_type);

alter table public.client_reports
  add column if not exists client_type text,
  add column if not exists client_job_address_private text,
  add column if not exists trade_category text,
  add column if not exists job_type text,
  add column if not exists job_start_date date,
  add column if not exists job_completion_date date,
  add column if not exists job_status text,
  add column if not exists deposit_requested numeric,
  add column if not exists deposit_paid numeric,
  add column if not exists final_invoice_amount numeric,
  add column if not exists materials_purchased_amount numeric,
  add column if not exists signed_contract boolean,
  add column if not exists written_change_order boolean,
  add column if not exists secondary_category public.report_category,
  add column if not exists dispute_status text,
  add column if not exists amount_disputed numeric,
  add column if not exists days_overdue integer,
  add column if not exists client_responded boolean,
  add column if not exists issue_resolved boolean,
  add column if not exists resolution_summary text,
  add column if not exists payment_reminder_sent boolean,
  add column if not exists demand_letter_sent boolean,
  add column if not exists lien_notice_started boolean,
  add column if not exists factual_summary_public text,
  add column if not exists detailed_timeline_private text,
  add column if not exists evidence_confidence text,
  add column if not exists response_status text;

create index if not exists client_reports_client_type_idx
  on public.client_reports (client_type);

create index if not exists client_reports_response_status_idx
  on public.client_reports (response_status);

create index if not exists client_reports_job_dates_idx
  on public.client_reports (job_start_date, job_completion_date);

comment on column public.users.account_type is
  'Product account type: contractor/service business user or client/homeowner/customer responder. Authorization still uses role.';

comment on column public.client_reports.client_job_address_private is
  'Private job address context for moderation and matching. Never publish raw street address on public profiles.';

comment on column public.client_reports.detailed_timeline_private is
  'Private structured timeline and intake notes for moderation. Public profiles should use factual_summary_public/public_summary only.';
