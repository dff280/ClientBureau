import type { Metadata } from "next"
import { BriefcaseBusiness, Search } from "lucide-react"

import { ClientDashboardShell } from "@/components/dashboard/client-dashboard-shell"
import { JobsWorkspace } from "@/components/dashboard/jobs-workspace"
import { getClientDashboardData } from "@/lib/dashboard-data"
import {
  getProjectJobsService,
  searchJobAccountsService,
} from "@/lib/repositories/client-bureau-service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Jobs Dashboard",
  description: "Create private jobs, track property details, scope, and job-specific participants.",
  robots: { index: false, follow: false },
}

export default async function DashboardJobsPage() {
  const { user } = await getClientDashboardData("/dashboard/jobs")
  const [jobs, accounts] = await Promise.all([
    getProjectJobsService(user.id),
    searchJobAccountsService(),
  ])

  return (
    <ClientDashboardShell
      activeHref="/dashboard/jobs"
      badge="Jobs"
      description="Create private job records, document the property and scope, and assign clients, contractors, subcontractors, vendors, or crews to the role they play on that job."
      primaryAction={{ href: "/dashboard/jobs", label: "Create job", icon: BriefcaseBusiness }}
      secondaryAction={{ href: "/search", label: "Check a Client", icon: Search }}
      title="Jobs"
    >
      <JobsWorkspace jobs={jobs} accounts={accounts} />
    </ClientDashboardShell>
  )
}
