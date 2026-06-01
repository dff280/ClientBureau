import type { Metadata } from "next"

import { AdminReviewPanel } from "@/components/admin/admin-review-panel"
import { requireRole } from "@/lib/auth"
import { getPendingAdminReviewsService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Review Panel",
  description:
    "Client Bureau admin review panel for pending reports, evidence review, public summaries, approvals, rejections, and disputes.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  await requireRole("admin")

  const reviews = await getPendingAdminReviewsService()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-amber-700">Moderation command</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Review queue
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Approve contractor-submitted reports, edit public summaries, and publish client
              profiles from one isolated admin workspace.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold text-slate-950">{reviews.length}</span>{" "}
            <span className="text-slate-600">review records loaded</span>
          </div>
        </header>
        <AdminReviewPanel items={reviews} />
      </div>
    </section>
  )
}
