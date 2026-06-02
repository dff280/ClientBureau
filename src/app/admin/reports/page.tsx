import type { Metadata } from "next"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { AdminReviewPanel } from "@/components/admin/admin-review-panel"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getPendingAdminReviewsService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Reports",
  description:
    "Client Bureau admin report queue for approvals, rejections, bulk moderation, evidence review, and public profile publication.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminReportsPage() {
  const [reviews, workspace, moderationCrm] = await Promise.all([
    getPendingAdminReviewsService(),
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
  ])

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-amber-700">Moderation command</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Report queue
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Approve contractor-submitted reports, edit public summaries, bulk reject/delete unsafe
              records, and publish client profiles without stale cards lingering after action.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold text-slate-950">{reviews.length}</span>{" "}
            <span className="text-slate-600">review records loaded</span>
          </div>
        </header>
        {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={workspace.users} /> : null}
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
  )
}
