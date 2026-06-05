-- Client Bureau contract signing packet hardening.
-- Apply after 0006 before treating contracts as a flagship live workflow.
-- Contract packet fields remain private contractor/admin records and must not render on public profiles.

alter table public.contract_packets
  add column if not exists client_legal_name text,
  add column if not exists contractor_legal_name text,
  add column if not exists scope_summary text not null default 'Agreement scope will be confirmed before signing.',
  add column if not exists included_work text not null default 'Included work will be confirmed before signing.',
  add column if not exists excluded_work text not null default 'Excluded work requires written approval or change order.',
  add column if not exists payment_terms text not null default 'Payment terms will be confirmed before signing.',
  add column if not exists milestone_schedule jsonb not null default '[]'::jsonb,
  add column if not exists change_order_policy text not null default 'Change orders should be reviewed and approved in writing before additional work begins.',
  add column if not exists cancellation_policy text not null default 'Cancellation, pause, and rescheduling terms should be documented in writing.',
  add column if not exists project_start_date date,
  add column if not exists project_end_date date,
  add column if not exists signer_name text,
  add column if not exists signature_name_hash text,
  add column if not exists signer_email_hash text,
  add column if not exists signer_ip_hash text,
  add column if not exists signer_user_agent_hash text,
  add column if not exists signed_snapshot jsonb,
  add column if not exists signed_digest text,
  add column if not exists signed_recorded_at timestamptz;

create index if not exists contract_packets_signed_recorded_idx
  on public.contract_packets(contractor_id, signed_recorded_at desc)
  where signed_recorded_at is not null;

create index if not exists contract_packets_signed_digest_idx
  on public.contract_packets(signed_digest)
  where signed_digest is not null;

comment on column public.contract_packets.scope_summary is
  'Private agreement packet scope summary shown on token-protected signing links.';

comment on column public.contract_packets.signed_snapshot is
  'Private immutable signing snapshot captured when a client signs the agreement packet.';

comment on column public.contract_packets.signed_digest is
  'Tamper-evident digest of the signed agreement snapshot.';
