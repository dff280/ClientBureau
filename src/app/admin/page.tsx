import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import {
  ClipboardCheck,
  Landmark,
  MessageSquareText,
  PhoneCall,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
} from "lucide-react"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { countOpenRecoveryCases } from "@/lib/platform-features"

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
  const firstContractorUserId = data.contractors[0]?.userId ?? data.users.find((item) => item.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined
  const pendingReports = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status),
  ).length
  const pendingDiscussions = data.discussions.filter((item) => item.status === "pending").length
  const publicClients = data.clients.filter((item) => item.isPublic).length
  const escalatedCases = moderationCrm?.cases.filter((item) => item.status === "escalated").length ?? 0
  const recoveryCases = riskOps ? countOpenRecoveryCases(riskOps.paymentRecoveryCases) : 0
  const lienPackets = riskOps?.lienNoticeDrafts.filter((item) => item.requiredReview).length ?? 0
  const contractPackets = riskOps?.contractDocuments.filter((item) => item.status !== "archived").length ?? 0

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

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Metric label="Pending reports" value={pendingReports} />
          <Metric label="Pending discussions" value={pendingDiscussions} />
          <Metric label="Public clients" value={publicClients} />
          <Metric label="Escalations" value={escalatedCases} />
          <Metric label="Recovery cases" value={recoveryCases} />
          <Metric label="Notice review" value={lienPackets} />
          <Metric label="Contracts" value={contractPackets} />
        </div>

        <Tabs defaultValue="overview" className="space-y-5">
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="overview" className="px-3 py-2">Overview</TabsTrigger>
              <TabsTrigger value="moderation" className="px-3 py-2">Moderation</TabsTrigger>
              <TabsTrigger value="safeguards" className="px-3 py-2">Safeguards</TabsTrigger>
              <TabsTrigger value="system" className="px-3 py-2">System</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5">
            <AdminModuleIntro
              title="Today's operating view"
              text="Start with the moderation queue, then move into client, contractor, upload, or safeguard workflows as needed."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink
                href="/admin/reports"
                icon={<ShieldCheck className="size-5" />}
                title="Report queue"
                text="Approve, reject, bulk update, or delete contractor-submitted reports."
                badge={`${pendingReports} pending`}
              />
              <QuickLink
                href="/admin/discussions"
                icon={<MessageSquareText className="size-5" />}
                title="Community discussion"
                text="Verify context, approve public comments, and remove unsafe submissions."
                badge={`${pendingDiscussions} pending`}
              />
              <QuickLink
                href="/admin/clients"
                icon={<ClipboardCheck className="size-5" />}
                title="Client records"
                text="Review public visibility, duplicate signals, profile health, and SEO summaries."
                badge={`${publicClients} public`}
              />
              <QuickLink
                href="/admin/settings"
                icon={<Settings className="size-5" />}
                title="Safeguard settings"
                text="Review recovery, lien-readiness, evidence privacy, and audit defaults."
                badge="Rules"
              />
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-5">
            <AdminModuleIntro
              title="Moderation CRM"
              text="Reviewer assignment, queue state, decision reasons, public-summary preview, bulk upload, and discussion review live here."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink
                href="/admin/reports"
                icon={<ShieldCheck className="size-5" />}
                title="Reports"
                text="Approve, reject, edit summaries, and keep pending content private."
                badge={`${pendingReports} pending`}
              />
              <QuickLink
                href="/admin/discussions"
                icon={<MessageSquareText className="size-5" />}
                title="Discussions"
                text="Moderate community entries, verification context, responses, and corrections."
                badge={`${pendingDiscussions} pending`}
              />
              <QuickLink
                href="/admin/uploads"
                icon={<UploadCloud className="size-5" />}
                title="Bulk intake"
                text="Preview CSV rows, flag duplicates, validate fields, and import selected records."
                badge="CSV"
              />
            </div>
            {moderationCrm ? <AdminModerationCrm data={moderationCrm} users={data.users} compact /> : null}
          </TabsContent>

          <TabsContent value="safeguards" className="space-y-5">
            <AdminModuleIntro
              title="Recovery, lien, and contract safeguards"
              text="These workflows stay private and operational. Admin review keeps public profiles neutral, documented, and response-aware."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink
                href="/admin/settings"
                icon={<PhoneCall className="size-5" />}
                title="Payment recovery"
                text="Monitor documented outreach, call logging, response windows, and resolution status."
                badge={`${recoveryCases} open`}
              />
              <QuickLink
                href="/admin/settings"
                icon={<Landmark className="size-5" />}
                title="Lien readiness"
                text="Keep notice packets private until deadlines, recipients, and documents are reviewed."
                badge={`${lienPackets} review`}
              />
              <QuickLink
                href="/admin/settings"
                icon={<Signature className="size-5" />}
                title="Contract controls"
                text="Track agreement templates, change orders, payment plans, completion records, and packet status."
                badge={`${contractPackets} active`}
              />
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-5">
            <AdminModuleIntro
              title="Records, users, and audit trail"
              text="Use these internal views for profile management, account review, upload oversight, and action history."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink
                href="/admin/clients"
                icon={<ClipboardCheck className="size-5" />}
                title="Clients"
                text="Edit client profiles, risk display, visibility, and public-summary context."
                badge={`${data.clients.length} records`}
              />
              <QuickLink
                href="/admin/contractors"
                icon={<ShieldCheck className="size-5" />}
                title="Contractors"
                text="Review verification status, plan status, account health, and report volume."
                badge={`${data.contractors.length} accounts`}
              />
              <QuickLink
                href="/admin/uploads"
                icon={<UploadCloud className="size-5" />}
                title="Uploads"
                text="Review staged imports, duplicate groups, selected rows, and import status."
                badge="Batches"
              />
              <QuickLink
                href="/admin/audit-log"
                icon={<Settings className="size-5" />}
                title="Audit log"
                text="Filter admin action history by actor, entity, action, date, and severity."
                badge={`${data.auditLog.length} events`}
              />
            </div>
          </TabsContent>
        </Tabs>
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

function AdminModuleIntro({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-amber-700">Admin workspace</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
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
