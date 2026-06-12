-- Client Bureau flexible job participants.
-- Jobs are private project records. Accounts/profiles can play different roles on different jobs.

do $$
begin
  alter type public.project_job_status add value if not exists 'lead';
  alter type public.project_job_status add value if not exists 'estimate';
  alter type public.project_job_status add value if not exists 'scheduled';
  alter type public.project_job_status add value if not exists 'in_progress';
  alter type public.project_job_status add value if not exists 'on_hold';
  alter type public.project_job_status add value if not exists 'cancelled';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.project_profile_role add value if not exists 'property_owner';
  alter type public.project_profile_role add value if not exists 'primary_contact';
  alter type public.project_profile_role add value if not exists 'prime_contractor';
  alter type public.project_profile_role add value if not exists 'hiring_contractor';
  alter type public.project_profile_role add value if not exists 'sub_subcontractor';
  alter type public.project_profile_role add value if not exists 'vendor';
  alter type public.project_profile_role add value if not exists 'supplier';
  alter type public.project_profile_role add value if not exists 'project_manager';
  alter type public.project_profile_role add value if not exists 'estimator';
  alter type public.project_profile_role add value if not exists 'internal_crew';
exception
  when duplicate_object then null;
end $$;

alter table public.entity_profiles
  add column if not exists account_capabilities public.profile_type[] not null default '{}'::public.profile_type[];

update public.entity_profiles
set account_capabilities = array[profile_type]::public.profile_type[]
where account_capabilities = '{}'::public.profile_type[];

alter table public.project_jobs
  add column if not exists job_number text,
  add column if not exists job_type text,
  add column if not exists priority text not null default 'normal',
  add column if not exists short_description text,
  add column if not exists detailed_scope_of_work text,
  add column if not exists trade_category text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists postal_code text,
  add column if not exists county text,
  add column if not exists property_type text,
  add column if not exists access_instructions text,
  add column if not exists private_access_code text,
  add column if not exists parking_instructions text,
  add column if not exists site_warnings text,
  add column if not exists target_completion_date date,
  add column if not exists customer_facing_notes text;

alter table public.project_jobs
  drop constraint if exists project_jobs_job_type_check,
  drop constraint if exists project_jobs_priority_check,
  drop constraint if exists project_jobs_property_type_check;

alter table public.project_jobs
  add constraint project_jobs_job_type_check check (
    job_type is null or job_type in (
      'direct_client_job',
      'contractor_managed_job',
      'subcontracted_work',
      'internal_project',
      'warranty_callback',
      'other'
    )
  ),
  add constraint project_jobs_priority_check check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  add constraint project_jobs_property_type_check check (
    property_type is null or property_type in (
      'residential',
      'commercial',
      'multi_family',
      'hoa_community',
      'industrial',
      'other'
    )
  );

create unique index if not exists project_jobs_job_number_idx
  on public.project_jobs(job_number)
  where job_number is not null;

create index if not exists project_jobs_job_type_status_idx
  on public.project_jobs(owner_user_id, job_type, status, updated_at desc);

alter table public.project_job_profiles
  add column if not exists hired_by_profile_id uuid references public.entity_profiles(id) on delete set null,
  add column if not exists reports_to_participant_id uuid references public.project_job_profiles(id) on delete set null,
  add column if not exists billing_relationship text,
  add column if not exists participant_status text not null default 'active',
  add column if not exists scope_assigned text,
  add column if not exists contract_amount numeric,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.project_job_profiles
  drop constraint if exists project_job_profiles_billing_relationship_check,
  drop constraint if exists project_job_profiles_participant_status_check;

alter table public.project_job_profiles
  add constraint project_job_profiles_billing_relationship_check check (
    billing_relationship is null or billing_relationship in (
      'client_pays_contractor',
      'contractor_pays_subcontractor',
      'contractor_pays_vendor',
      'direct_owner_payment',
      'internal',
      'other'
    )
  ),
  add constraint project_job_profiles_participant_status_check check (
    participant_status in ('active', 'pending', 'completed', 'removed')
  );

create index if not exists project_job_profiles_job_status_idx
  on public.project_job_profiles(project_job_id, participant_status, role);

create index if not exists project_job_profiles_hired_by_idx
  on public.project_job_profiles(hired_by_profile_id)
  where hired_by_profile_id is not null;

drop trigger if exists project_job_profiles_set_updated_at on public.project_job_profiles;
create trigger project_job_profiles_set_updated_at
before update on public.project_job_profiles
for each row execute function public.set_updated_at();

drop policy if exists "Users can read own project graph joins" on public.project_job_profiles;
create policy "Users can read own project graph joins"
  on public.project_job_profiles for select
  using (
    exists (
      select 1
      from public.project_jobs pj
      where pj.id = project_job_profiles.project_job_id
        and pj.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage own project graph joins" on public.project_job_profiles;
create policy "Users can manage own project graph joins"
  on public.project_job_profiles for all
  using (
    exists (
      select 1
      from public.project_jobs pj
      where pj.id = project_job_profiles.project_job_id
        and pj.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.project_jobs pj
      where pj.id = project_job_profiles.project_job_id
        and pj.owner_user_id = auth.uid()
    )
  );

comment on column public.entity_profiles.account_capabilities is
  'General account/profile capabilities. Job-specific roles belong on project_job_profiles, not on the account itself.';

comment on column public.project_jobs.private_access_code is
  'Private gate, lockbox, or access code. Never expose on public profile pages.';

comment on table public.project_job_profiles is
  'Job participant join table. A single account/profile can hold different roles on different jobs.';
