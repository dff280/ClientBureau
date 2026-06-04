-- Client Bureau launch ops hardening.
-- Apply after 0001-0005 before setting PLATFORM_FEATURE_DATA_MODE=supabase.
-- These changes keep advanced ops private while making live health checks and audit records reliable.

alter type public.admin_entity_type add value if not exists 'recovery';
alter type public.admin_entity_type add value if not exists 'lien_readiness';
alter type public.admin_entity_type add value if not exists 'contract';
alter type public.admin_entity_type add value if not exists 'contract_packet';
alter type public.admin_entity_type add value if not exists 'risk_room';
alter type public.admin_entity_type add value if not exists 'pipeline';
alter type public.admin_entity_type add value if not exists 'evidence_vault';
alter type public.admin_entity_type add value if not exists 'saved_view';
alter type public.admin_entity_type add value if not exists 'assignment';
alter type public.admin_entity_type add value if not exists 'compliance_review';

create or replace view public.client_bureau_required_tables as
select table_name, to_regclass('public.' || table_name) is not null as exists
from (
  values
    ('users'),
    ('contractor_profiles'),
    ('client_profiles'),
    ('client_reports'),
    ('report_evidence'),
    ('client_responses'),
    ('subscriptions'),
    ('admin_reviews'),
    ('community_discussions'),
    ('audit_logs'),
    ('contractor_watchlist_items'),
    ('watchlist_alerts'),
    ('report_drafts'),
    ('client_intake_assessments'),
    ('evidence_review_summaries'),
    ('moderation_cases'),
    ('bulk_import_batches'),
    ('payment_recovery_cases'),
    ('lien_notice_drafts'),
    ('contract_workspace_items'),
    ('client_pipeline_items'),
    ('client_risk_rooms'),
    ('payment_recovery_attempts'),
    ('payment_plans'),
    ('contract_packets'),
    ('evidence_vault_items'),
    ('admin_saved_views'),
    ('admin_queue_assignments'),
    ('recovery_compliance_reviews')
) as required(table_name);

drop trigger if exists contractor_watchlist_items_set_updated_at on public.contractor_watchlist_items;
create trigger contractor_watchlist_items_set_updated_at
before update on public.contractor_watchlist_items
for each row execute function public.set_updated_at();

drop trigger if exists moderation_cases_set_updated_at on public.moderation_cases;
create trigger moderation_cases_set_updated_at
before update on public.moderation_cases
for each row execute function public.set_updated_at();

drop trigger if exists payment_recovery_cases_set_updated_at on public.payment_recovery_cases;
create trigger payment_recovery_cases_set_updated_at
before update on public.payment_recovery_cases
for each row execute function public.set_updated_at();

drop trigger if exists lien_notice_drafts_set_updated_at on public.lien_notice_drafts;
create trigger lien_notice_drafts_set_updated_at
before update on public.lien_notice_drafts
for each row execute function public.set_updated_at();

drop trigger if exists contract_workspace_items_set_updated_at on public.contract_workspace_items;
create trigger contract_workspace_items_set_updated_at
before update on public.contract_workspace_items
for each row execute function public.set_updated_at();

drop trigger if exists client_pipeline_items_set_updated_at on public.client_pipeline_items;
create trigger client_pipeline_items_set_updated_at
before update on public.client_pipeline_items
for each row execute function public.set_updated_at();

drop trigger if exists payment_plans_set_updated_at on public.payment_plans;
create trigger payment_plans_set_updated_at
before update on public.payment_plans
for each row execute function public.set_updated_at();

drop trigger if exists contract_packets_set_updated_at on public.contract_packets;
create trigger contract_packets_set_updated_at
before update on public.contract_packets
for each row execute function public.set_updated_at();

drop trigger if exists evidence_vault_items_set_updated_at on public.evidence_vault_items;
create trigger evidence_vault_items_set_updated_at
before update on public.evidence_vault_items
for each row execute function public.set_updated_at();

drop trigger if exists admin_queue_assignments_set_updated_at on public.admin_queue_assignments;
create trigger admin_queue_assignments_set_updated_at
before update on public.admin_queue_assignments
for each row execute function public.set_updated_at();

drop trigger if exists recovery_compliance_reviews_set_updated_at on public.recovery_compliance_reviews;
create trigger recovery_compliance_reviews_set_updated_at
before update on public.recovery_compliance_reviews
for each row execute function public.set_updated_at();

create unique index if not exists contract_packets_share_token_unique_idx
  on public.contract_packets(share_token)
  where share_token is not null;

create index if not exists contract_packets_share_status_idx
  on public.contract_packets(contractor_id, share_status, signature_status, updated_at desc);

create index if not exists evidence_vault_report_idx
  on public.evidence_vault_items(report_id)
  where report_id is not null;

create index if not exists admin_queue_assignments_entity_idx
  on public.admin_queue_assignments(entity_type, entity_id);

create index if not exists recovery_compliance_reviews_lookup_idx
  on public.recovery_compliance_reviews(recovery_case_id, lien_notice_draft_id, contract_packet_id);

drop policy if exists "Admins manage saved views" on public.admin_saved_views;
create policy "Admins manage saved views"
on public.admin_saved_views for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage queue assignments" on public.admin_queue_assignments;
create policy "Admins manage queue assignments"
on public.admin_queue_assignments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage recovery compliance reviews" on public.recovery_compliance_reviews;
create policy "Admins manage recovery compliance reviews"
on public.recovery_compliance_reviews for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contractors read recovery compliance reviews for own records" on public.recovery_compliance_reviews;
create policy "Contractors read recovery compliance reviews for own records"
on public.recovery_compliance_reviews for select
using (
  public.is_admin()
  or recovery_case_id in (
    select id from public.payment_recovery_cases
    where contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  )
  or lien_notice_draft_id in (
    select id from public.lien_notice_drafts
    where contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  )
  or contract_packet_id in (
    select id from public.contract_packets
    where contractor_id in (select id from public.contractor_profiles where user_id = auth.uid())
  )
);

comment on view public.client_bureau_required_tables is
  'Non-secret launch readiness view used by service-role health checks to confirm required Client Bureau tables exist.';
