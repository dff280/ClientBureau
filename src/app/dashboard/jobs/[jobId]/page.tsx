import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BriefcaseBusiness, Search } from "lucide-react"

import { ClientDashboardShell } from "@/components/dashboard/client-dashboard-shell"
import { JobDetailWorkspace } from "@/components/dashboard/jobs-workspace"
import { Badge } from "@/components/ui/badge"
import { getClientDashboardData } from "@/lib/dashboard-data"
import {
  getProjectJobDetailService,
  searchJobAccountsService,
} from "@/lib/repositories/client-bureau-service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Job Details",
  description: "Manage private job details, property information, scope, and job-specific participants.",
  robots: { index: false, follow: false },
}

function labelize(value?: string) {
  if (!value) return "Not set"
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default async function DashboardJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const { user } = await getClientDashboardData(`/dashboard/jobs/${jobId}`)
  const [job, accounts] = await Promise.all([
    getProjectJobDetailService(user.id, jobId),
    searchJobAccountsService(),
  ])

  if (!job) notFound()

  const address = [job.addressLine1, job.addressLine2, job.city, job.state, job.postalCode]
    .filter(Boolean)
    .join(", ")

  return (
    <ClientDashboardShell
      activeHref="/dashboard/jobs"
      badge="Job details"
      description="A job is the actual work record. The same account can be a direct contractor on one job and a subcontractor on another."
      primaryAction={{ href: "/dashboard/jobs", label: "All jobs", icon: BriefcaseBusiness }}
      secondaryAction={{ href: "/search", label: "Check a Client", icon: Search }}
      title={job.title}
    >
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-md bg-slate-950 text-white">{labelize(job.status)}</Badge>
              <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-amber-900">
                {labelize(job.priority)}
              </Badge>
              <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-slate-700">
                {labelize(job.jobType)}
              </Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{job.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{job.shortDescription}</p>
            <p className="mt-3 text-sm font-medium text-slate-800">{address || `${job.city}, ${job.state}`}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-950">{job.jobNumber ?? job.id}</p>
            <p className="mt-1">{job.projectType}</p>
            <p className="mt-1">Private job record. Public pages do not show address, access codes, internal notes, or participant notes.</p>
          </div>
        </div>
      </section>

      <JobDetailWorkspace job={job} accounts={accounts} />
    </ClientDashboardShell>
  )
}
