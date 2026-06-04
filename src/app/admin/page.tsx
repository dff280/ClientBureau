import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import {
  ClipboardCheck,
  FileText,
  Landmark,
  History,
  MessageSquareText,
  PhoneCall,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
} from "lucide-react"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
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
  title: "Admin Command Center",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

type AdminHomeSearchParams = Promise<{
  workspace?: string | string[]
}>

const adminWorkspaces = new Set([
  "overview",
  "reports",
  "clients",
  "contractors",
  "discussions",
  "uploads",
  "recovery",
  "contracts",
  "audit",
  "settings",
])

function normalizeAdminWorkspace(value: string | string[] | undefined) {
  const workspace = Array.isArray(value) ? value[0] : value

  return workspace && adminWorkspaces.has(workspace) ? workspace : "overview"
}

export default async function AdminHomePage({ searchParams }: { searchParams: AdminHomeSearchParams }) {
  const params = await searchParams
  const activeWorkspace = normalizeAdminWorkspace(params.workspace)
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
  const contractLinks = riskOps?.contractPackets.filter((item) => item.status !== "archived").length ?? 0

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
          <Metric label="Contract links" value={contractLinks} />
        </div>

        <Tabs defaultValue={activeWorkspace} className="space-y-5">
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="overview" className="px-3 py-2">Command Center</TabsTrigger>
              <TabsTrigger value="reports" className="px-3 py-2">Report Queue</TabsTrigger>
              <TabsTrigger value="clients" className="px-3 py-2">Client Profiles</TabsTrigger>
              <TabsTrigger value="contractors" className="px-3 py-2">Contractors</TabsTrigger>
              <TabsTrigger value="discussions" className="px-3 py-2">Discussions</TabsTrigger>
              <TabsTrigger value="uploads" className="px-3 py-2">Uploads</TabsTrigger>
              <TabsTrigger value="recovery" className="px-3 py-2">Recovery</TabsTrigger>
              <TabsTrigger value="contracts" className="px-3 py-2">Contracts</TabsTrigger>
              <TabsTrigger value="audit" className="px-3 py-2">Audit</TabsTrigger>
              <TabsTrigger value="settings" className="px-3 py-2">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-5">
            <AdminModuleIntro
              title="Command center"
              text="Start with the moderation queue, then move into client, contractor, upload, or safeguard workflows as needed."
            />
            <div className="grid gap-4 lg:grid-cols-5">
              {[
                ["Report Queue", "Approve only moderated, documented public summaries."],
                ["Client Profiles", "Control public visibility, profile health, and SEO-safe identity fields."],
                ["Contractors", "Review accounts, verification, plan readiness, and report behavior."],
                ["Contracts", "Oversee private signing links, client invites, and payment coordination status."],
                ["Recovery", "Keep payment follow-up, calls, and notice readiness private until reviewed."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink
                href="/admin/reports"
                icon={<ShieldCheck className="size-5" />}
                title="Report Queue"
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
                title="Client Profiles"
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

          <TabsContent value="reports" className="space-y-5">
            <AdminModuleIntro
              title="Report moderation CRM"
              text="Reviewer assignment, queue state, decision reasons, public-summary preview, and bulk report actions live here."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink
                href="/admin/reports"
                icon={<ShieldCheck className="size-5" />}
                title="Report Queue"
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

          <TabsContent value="clients" className="space-y-5">
            <AdminModuleIntro
              title="Client Profiles"
              text="Manage public visibility, duplicate identity signals, risk display, city/state SEO context, and profile health."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink href="/admin/clients" icon={<ClipboardCheck className="size-5" />} title="Client editor" text="Edit public profile fields, risk score, and visibility." badge={`${data.clients.length} records`} />
              <QuickLink href="/search" icon={<FileText className="size-5" />} title="SEO preview" text="Review how public records appear in search and profile cards." badge={`${publicClients} public`} />
              <QuickLink href="/admin/discussions" icon={<MessageSquareText className="size-5" />} title="Responses" text="Review responses, corrections, and dispute context." badge={`${pendingDiscussions} pending`} />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Visibility audit" text="Track profile edits and publication decisions." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="contractors" className="space-y-5">
            <AdminModuleIntro
              title="Contractor accounts"
              text="Review verification, account health, report volume, plan status, evidence behavior, and platform readiness."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink href="/admin/contractors" icon={<ShieldCheck className="size-5" />} title="Contractor profiles" text="Modify contractor profile, trade, city/state, and verification status." badge={`${data.contractors.length} accounts`} />
              <QuickLink href="/dashboard" icon={<ClipboardCheck className="size-5" />} title="Contractor workspace" text="View the contractor command center as product context." badge="Workspace" />
              <QuickLink href="/pricing" icon={<Settings className="size-5" />} title="Plan controls" text="Review plan positioning and operational limits." badge="Plans" />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Account audit" text="Track admin changes to contractor records." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-5">
            <AdminModuleIntro
              title="Discussion and response moderation"
              text="Moderate community entries, client responses, correction requests, verification context, and public-safe summaries."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/discussions" icon={<MessageSquareText className="size-5" />} title="Discussion queue" text="Approve, reject, verify, or delete public discussion records." badge={`${pendingDiscussions} pending`} />
              <QuickLink href="/client-response" icon={<FileText className="size-5" />} title="Response workflow" text="Review the client-facing response, dispute, correction, and resolution path." badge="Public" />
              <QuickLink href="/moderation-policy" icon={<ShieldCheck className="size-5" />} title="Policy alignment" text="Keep public discussion language neutral and moderated." badge="Policy" />
            </div>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-5">
            <AdminModuleIntro
              title="Bulk upload operations"
              text="Preview CSV rows, flag duplicates, validate staged records, and import selected reports as pending records."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/uploads" icon={<UploadCloud className="size-5" />} title="Upload batches" text="Review staged imports, duplicate groups, selected rows, and import status." badge="CSV" />
              <QuickLink href="/admin/reports" icon={<ClipboardCheck className="size-5" />} title="Imported reports" text="Moderate imported rows before anything can become public." badge={`${pendingReports} pending`} />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Import audit" text="Track who imported, approved, rejected, or deleted records." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-5">
            <AdminModuleIntro
              title="Recovery, lien, and contract safeguards"
              text="Payment recovery and lien-readiness workflows stay private and operational, with compliance review before any sensitive action."
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
                text="Keep notice-readiness checklists private until deadlines, recipients, and documents are reviewed."
                badge={`${lienPackets} review`}
              />
              <QuickLink
                href="/admin/settings"
                icon={<Signature className="size-5" />}
                title="Contract controls"
                text="Track signing links, client invite status, signatures, and payment coordination."
                badge={`${contractLinks} active`}
              />
            </div>
            {moderationCrm ? <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} /> : null}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-5">
            <AdminModuleIntro
              title="Contract signing link oversight"
              text="Track agreement templates, private signing links, client invites, payment coordination, and contracts required before scheduling."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/settings" icon={<Signature className="size-5" />} title="Contract controls" text="Review signing-link defaults and safeguard language." badge={`${contractLinks} active`} />
              <QuickLink href="/dashboard" icon={<ClipboardCheck className="size-5" />} title="Contract workspace" text="Preview contractor-side signing link creation and status tracking." badge="Ops" />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Contract audit" text="Track agreement status, reviewer actions, and settings changes." badge="Audit" />
            </div>
            {moderationCrm ? <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} /> : null}
          </TabsContent>

          <TabsContent value="audit" className="space-y-5">
            <AdminModuleIntro
              title="Audit trail"
              text="Review status changes, publication decisions, imports, deletes, decision reasons, and private safeguard reviews."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Audit log" text="Filter admin action history by actor, entity, action, date, and severity." badge={`${data.auditLog.length} events`} />
              <QuickLink
                href="/admin/clients"
                icon={<ClipboardCheck className="size-5" />}
                title="Client Profiles"
                text="Edit client profiles, risk display, visibility, and public-summary context."
                badge={`${data.clients.length} records`}
              />
              <QuickLink
                href="/admin/reports"
                icon={<ShieldCheck className="size-5" />}
                title="Moderation"
                text="Review the report queue that generates most audit events."
                badge={`${pendingReports} pending`}
              />
              <QuickLink
                href="/admin/settings"
                icon={<Settings className="size-5" />}
                title="Safeguards"
                text="Review audit defaults, evidence privacy controls, and publication rules."
                badge="Rules"
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-5">
            <AdminModuleIntro
              title="Settings and controls"
              text="Moderation defaults, evidence privacy controls, publication rules, recovery safeguards, and contract workflow settings."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink
                href="/admin/settings"
                icon={<Settings className="size-5" />}
                title="Admin settings"
                text="Review moderation rules, publication defaults, evidence privacy, and recovery controls."
                badge="Settings"
              />
              <QuickLink href="/report-policy" icon={<FileText className="size-5" />} title="Report policy" text="Review public policy language used by reports and moderation." badge="Policy" />
              <QuickLink href="/dispute-policy" icon={<MessageSquareText className="size-5" />} title="Dispute policy" text="Review response, correction, and dispute standards." badge="Policy" />
              <QuickLink href="/moderation-policy" icon={<ShieldCheck className="size-5" />} title="Moderation policy" text="Keep public outputs neutral, documented, and response-aware." badge="Policy" />
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
