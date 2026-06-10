-- Client Bureau graph backfill step: evidence project links
-- Run after chunks 01, 02, and 03. These steps are optional but recommended for legacy data.

update public.report_evidence re
set
  project_job_id = cr.project_job_id,
  public_summary_label = case
    when lower(re.file_name || ' ' || re.file_type) like '%invoice%' then 'Invoice evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%contract%' then 'Contract evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%photo%' then 'Photo evidence on file'
    when lower(re.file_name || ' ' || re.file_type) like '%screenshot%' then 'Screenshot evidence on file'
    else 'Evidence on file'
  end
from public.client_reports cr
where re.report_id = cr.id
  and cr.project_job_id is not null;
