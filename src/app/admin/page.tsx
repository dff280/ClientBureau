import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import { ClipboardCheck, MessageSquareText, ShieldCheck, UploadCloud } from "lucide-react"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
} from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Admin Command",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const [data, moderationCrm] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
  ])
  const pendingReports = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status),
  ).length
  const pendingDiscussions = data.discussions.filter((item) => item.status === "pending").length
  const publicClients = data.clients.filter((item) => item.isPublic).length
  const escalatedCases = moderationCrm?.cases.filter((item) => item.status === "escalated").length ?? 0

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-amber-700">Internal command</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Client Bureau admin
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Moderate reports, manage public client records, review community submissions, and
              track operational audit history from a separate internal workspace.
            </p>
          </div>
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/admin/reports" prefetch={false}>
              <ClipboardCheck aria-hidden="true" />
              Open report queue
            </Link>
          </Button>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Pending reports" value={pendingReports} />
          <Metric label="Pending discussions" value={pendingDiscussions} />
          <Metric label="Public clients" value={publicClients} />
          <Metric label="Escalations" value={escalatedCases} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <QuickLink
            href="/admin/reports"
            icon={<ShieldCheck className="size-5" />}
            title="Moderation first"
            text="Approve, reject, bulk update, or delete contractor-submitted reports."
            badge={`${pendingReports} pending`}
          />
          <QuickLink
            href="/admin/discussions"
            icon={<MessageSquareText className="size-5" />}
            title="Community discussion"
            text="Approve public comments, verify context, and remove unsafe content."
            badge={`${pendingDiscussions} pending`}
          />
          <QuickLink
            href="/admin/uploads"
            icon={<UploadCloud className="size-5" />}
            title="Bulk intake"
            text="Preview CSV rows, flag duplicates, validate required fields, and import selected records."
            badge="CSV"
          />
        </div>

        {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={data.users} compact /> : null}
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

function QuickLink({
  href,
  icon,
  title,
  text,
  badge,
}: {
  href: string
  icon: React.ReactNode
  title: string
  text: string
  badge: string
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">{icon}</div>
        <Badge variant="outline" className="rounded-md">
          {badge}
        </Badge>
      </div>
      <h2 className="mt-4 font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Link>
  )
}
