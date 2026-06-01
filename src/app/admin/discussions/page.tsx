import type { Metadata } from "next"

import { DiscussionModerationPanel } from "@/components/admin/discussion-moderation-panel"
import { requireRole } from "@/lib/auth"
import { getAdminWorkspaceDataService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Discussions",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminDiscussionsPage() {
  await requireRole("admin")
  const data = await getAdminWorkspaceDataService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Community moderation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Discussion queue
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Create, approve, reject, delete, verify, and assign community discussion entries before they appear publicly.
          </p>
        </header>
        <DiscussionModerationPanel discussions={data.discussions} clients={data.clients} reports={data.reports} />
      </div>
    </section>
  )
}
