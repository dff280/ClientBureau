import type { Metadata } from "next"

import { DiscussionModerationPanel } from "@/components/admin/discussion-moderation-panel"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Discussions",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminDiscussionsPage() {
  const data = await getAdminWorkspaceDataService()
  const pending = data.discussions.filter((item) => item.status === "pending").length
  const approved = data.discussions.filter((item) => item.status === "approved").length
  const verified = data.discussions.filter((item) => item.isVerified).length

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Discussions moderation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Discussions
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Create, approve, reject, delete, verify, and assign discussion entries before they appear publicly.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Pending" value={pending} />
          <Metric label="Approved" value={approved} />
          <Metric label="Verified" value={verified} />
          <Metric label="Total entries" value={data.discussions.length} />
        </div>
        <DiscussionModerationPanel discussions={data.discussions} clients={data.clients} reports={data.reports} />
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
