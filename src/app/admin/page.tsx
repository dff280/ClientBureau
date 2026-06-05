import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import type React from "react"
import Link from "next/link"
import {
  Activity,
  ClipboardCheck,
  Database,
  FileText,
  Landmark,
  History,
  MessageSquareText,
  PhoneCall,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react"

import { AdminModerationCrm } from "@/components/admin/admin-moderation-crm"
import { AdminOpsExpansion } from "@/components/admin/admin-ops-expansion"
import {
  DashboardPageHeader,
  DashboardSection,
  HeaderActionButton,
  QuickActionCard,
  StatCard,
} from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { getLaunchHealth } from "@/lib/launch-health"
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

const adminWorkspaceGroups: {
  title: string
  text: string
  items: { value: string; label: string; icon: LucideIcon }[]
}[] = [
  {
    title: "Command Center",
    text: "Daily operating view.",
    items: [{ value: "overview", label: "Overview", icon: ShieldCheck }],
  },
  {
    title: "Moderation",
    text: "Approve public content.",
    items: [
      { value: "reports", label: "Review Reports", icon: ClipboardCheck },
      { value: "discussions", label: "Discussions", icon: MessageSquareText },
      { value: "uploads", label: "CSV Intake", icon: UploadCloud },
    ],
  },
  {
    title: "Records",
    text: "Manage profiles and users.",
    items: [
      { value: "clients", label: "Client Profiles", icon: UserRound },
      { value: "contractors", label: "Businesses / Users", icon: UsersRound },
    ],
  },
  {
    title: "Tools",
    text: "Private workflow oversight.",
    items: [
      { value: "recovery", label: "Recovery Cases", icon: PhoneCall },
      { value: "contracts", label: "Contracts", icon: Signature },
    ],
  },
  {
    title: "Platform",
    text: "Rules and audit trail.",
    items: [
      { value: "audit", label: "Audit Log", icon: History },
      { value: "settings", label: "Settings", icon: Settings },
    ],
  },
]

function normalizeAdminWorkspace(value: string | string[] | undefined) {
  const workspace = Array.isArray(value) ? value[0] : value

  return workspace && adminWorkspaces.has(workspace) ? workspace : "overview"
}

export default async function AdminHomePage({ searchParams }: { searchParams: AdminHomeSearchParams }) {
  const params = await searchParams
  const activeWorkspace = normalizeAdminWorkspace(params.workspace)
  const [data, moderationCrm, health] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
    getLaunchHealth(),
  ])
  const firstContractorUserId = data.contractors[0]?.userId ?? data.users.find((item) => item.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined
  const pendingReports = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status),
  ).length
  const pendingDiscussions = data.discussions.filter((item) => item.status === "pending").length
  const pendingResponses = data.responses.filter((item) => item.status === "pending").length
  const pendingDisputes = data.reviews.filter((item) => item.review.status === "needs_dispute_review").length
  const publicClients = data.clients.filter((item) => item.isPublic).length
  const evidenceAwaitingReview = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status) && item.evidence.length > 0,
  ).length
  const escalatedCases = moderationCrm?.cases.filter((item) => item.status === "escalated").length ?? 0
  const recoveryCases = riskOps
    ? countOpenRecoveryCases(riskOps.paymentRecoveryCases) +
      riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed", "paused"].includes(item.status)).length
    : 0
  const lienPackets = riskOps
    ? riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length +
      riskOps.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length
    : 0
  const contractLinks = riskOps?.contractPackets.filter((item) => item.status !== "archived").length ?? 0
  const recentUsers = [...data.users]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .length
  const commandStats = [
    { label: "Pending reports", value: pendingReports, helper: "Reports waiting for an admin decision", icon: ClipboardCheck, tone: pendingReports > 0 ? "amber" as const : "emerald" as const, href: "/admin/reports" },
    { label: "Pending discussions", value: pendingDiscussions, helper: "Community entries not public yet", icon: MessageSquareText, tone: pendingDiscussions > 0 ? "amber" as const : "slate" as const, href: "/admin/discussions" },
    { label: "Pending disputes", value: pendingDisputes + pendingResponses, helper: "Responses, corrections, and dispute context", icon: FileText, tone: pendingDisputes + pendingResponses > 0 ? "rose" as const : "slate" as const, href: "/admin/discussions" },
    { label: "Evidence review", value: evidenceAwaitingReview, helper: "Report records with private evidence attached", icon: UploadCloud, tone: evidenceAwaitingReview > 0 ? "blue" as const : "slate" as const, href: "/admin/reports" },
    { label: "Resolution Desk", value: recoveryCases, helper: "Managed recovery and private follow-up records", icon: PhoneCall, tone: recoveryCases > 0 ? "amber" as const : "slate" as const, href: "/admin/recovery" },
    { label: "Florida liens", value: lienPackets, helper: "Notice, filing, recording proof, and release queues", icon: Landmark, tone: lienPackets > 0 ? "rose" as const : "slate" as const, href: "/admin/recovery" },
    { label: "Public profiles", value: publicClients, helper: "Approved SEO-visible client records", icon: UserRound, tone: "emerald" as const, href: "/admin/clients" },
    { label: "Audit events", value: data.auditLog.length, helper: "Admin actions and system changes", icon: History, tone: "slate" as const, href: "/admin/audit-log" },
    { label: "Recent users", value: recentUsers, helper: "Latest account records loaded", icon: UsersRound, tone: "blue" as const, href: "/admin/contractors" },
    { label: "Live ops", value: health.readiness.platformCanUseSupabase ? "Ready" : "Gated", helper: health.readiness.readinessLabel, icon: Database, tone: health.readiness.platformCanUseSupabase ? "emerald" as const : "amber" as const, href: "/admin/settings" },
  ]

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardPageHeader
          eyebrow="Admin Command Center"
          title="Platform operations"
          description="Review public content, manage records, monitor private workflow safeguards, and keep every moderation action accountable."
          actions={
            <>
              <HeaderActionButton href="/admin/reports">
              <ClipboardCheck aria-hidden="true" />
                Review reports
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <History aria-hidden="true" />
                View audit log
              </HeaderActionButton>
            </>
          }
          meta={
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-md bg-slate-50">Admin only</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">{escalatedCases} escalations</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">{contractLinks} active contract links</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">Live ops: {health.readiness.readinessLabel}</Badge>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {commandStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <LiveOpsReadinessPanel health={health} />

        <Tabs defaultValue={activeWorkspace} className="space-y-5">
          <AdminWorkspaceNavigation />

          <TabsContent value="overview" className="space-y-5">
            <DashboardSection
              eyebrow="Urgent work"
              title="Start with records that can become public."
              description="Pending public content and private evidence always come before platform housekeeping."
            >
              <div className="grid gap-4 lg:grid-cols-4">
                <QuickActionCard
                href="/admin/reports"
                  icon={ShieldCheck}
                  title="Review Reports"
                  description="Approve, reject, bulk update, or delete contractor-submitted reports."
                badge={`${pendingReports} pending`}
                  primary
              />
                <QuickActionCard
                href="/admin/discussions"
                  icon={MessageSquareText}
                title="Discussions"
                  description="Verify context, approve public comments, and remove unsafe submissions."
                badge={`${pendingDiscussions} pending`}
              />
                <QuickActionCard
                href="/admin/clients"
                  icon={ClipboardCheck}
                title="Client Profiles"
                  description="Review public visibility, duplicate signals, profile health, and SEO summaries."
                badge={`${publicClients} public`}
              />
                <QuickActionCard
                href="/admin/recovery"
                  icon={Settings}
                title="Settings"
                  description="Review recovery cases, lien packets, evidence privacy, and audit defaults."
                badge="Rules"
              />
              </div>
            </DashboardSection>
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
                title="Uploads / CSV Intake"
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
              <QuickLink href="/admin/discussions" icon={<MessageSquareText className="size-5" />} title="Discussions" text="Review responses, corrections, and dispute context." badge={`${pendingDiscussions} pending`} />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Visibility audit" text="Track profile edits and publication decisions." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="contractors" className="space-y-5">
            <AdminModuleIntro
              title="Businesses / Users"
              text="Review business profiles, user accounts, verification, plan status, evidence behavior, and platform readiness."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink href="/admin/contractors" icon={<ShieldCheck className="size-5" />} title="Business profiles" text="Modify business profile, trade, city/state, and verification status." badge={`${data.contractors.length} accounts`} />
              <QuickLink href="/dashboard" icon={<ClipboardCheck className="size-5" />} title="Business workspace" text="View the contractor command center as product context." badge="Workspace" />
              <QuickLink href="/pricing" icon={<Settings className="size-5" />} title="Plan controls" text="Review plan positioning and operational limits." badge="Plans" />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Account audit" text="Track admin changes to contractor records." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-5">
            <AdminModuleIntro
              title="Discussions"
              text="Moderate community entries, client responses, correction requests, verification context, and public-safe summaries."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/discussions" icon={<MessageSquareText className="size-5" />} title="Discussions" text="Approve, reject, verify, or delete public discussion records." badge={`${pendingDiscussions} pending`} />
              <QuickLink href="/client-response" icon={<FileText className="size-5" />} title="Response workflow" text="Review the client-facing response, dispute, correction, and resolution path." badge="Public" />
              <QuickLink href="/moderation-policy" icon={<ShieldCheck className="size-5" />} title="Policy alignment" text="Keep public discussion language neutral and moderated." badge="Policy" />
            </div>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-5">
            <AdminModuleIntro
              title="Uploads / CSV Intake"
              text="Preview CSV rows, flag duplicates, validate staged records, and import selected reports as pending records."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/uploads" icon={<UploadCloud className="size-5" />} title="CSV intake batches" text="Review staged imports, duplicate groups, selected rows, and import status." badge="CSV" />
              <QuickLink href="/admin/reports" icon={<ClipboardCheck className="size-5" />} title="Imported reports" text="Moderate imported rows before anything can become public." badge={`${pendingReports} pending`} />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Import audit" text="Track who imported, approved, rejected, or deleted records." badge="Audit" />
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-5">
            <AdminModuleIntro
              title="Recovery Cases"
              text="Recovery cases and lien packets stay private and operational, with compliance review before any sensitive action."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink
                href="/admin/recovery"
                icon={<PhoneCall className="size-5" />}
                title="Recovery Cases"
                text="Monitor documented outreach, call logging, response windows, and resolution status."
                badge={`${recoveryCases} open`}
              />
              <QuickLink
                href="/admin/contracts"
                icon={<Landmark className="size-5" />}
                title="Lien packets"
                text="Keep lien packets private until deadlines, recipients, and documents are reviewed."
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
            {moderationCrm ? (
              <AdminPrivateOpsDetails moderationCrm={moderationCrm} riskOps={riskOps} focus="recovery" />
            ) : null}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-5">
            <AdminModuleIntro
              title="Contracts"
              text="Track agreement templates, private signing links, client invites, payment coordination, and contracts required before scheduling."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <QuickLink href="/admin/contracts" icon={<Signature className="size-5" />} title="Contract controls" text="Review signing-link defaults, client invite rules, and contract language." badge={`${contractLinks} active`} />
              <QuickLink href="/dashboard/contracts" icon={<ClipboardCheck className="size-5" />} title="Contract workspace" text="Preview contractor-side agreement packets, signing links, and status tracking." badge="Ops" />
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Contract audit" text="Track agreement status, reviewer actions, and settings changes." badge="Audit" />
            </div>
            {moderationCrm ? (
              <AdminPrivateOpsDetails moderationCrm={moderationCrm} riskOps={riskOps} focus="contracts" />
            ) : null}
          </TabsContent>

          <TabsContent value="audit" className="space-y-5">
            <AdminModuleIntro
              title="Audit Log"
              text="Review status changes, publication decisions, imports, deletes, decision reasons, and private compliance reviews."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink href="/admin/audit-log" icon={<History className="size-5" />} title="Audit Log" text="Filter admin action history by actor, entity, action, date, and severity." badge={`${data.auditLog.length} events`} />
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
                title="Settings"
                text="Review audit defaults, evidence privacy controls, and publication rules."
                badge="Rules"
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-5">
            <AdminModuleIntro
              title="Settings"
              text="Moderation defaults, evidence privacy controls, publication rules, recovery review rules, and contract workflow settings."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              <QuickLink
                href="/admin/settings"
                icon={<Settings className="size-5" />}
                title="Settings"
                text="Review moderation rules, publication defaults, evidence privacy, recovery controls, and contract workflow settings."
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

function LiveOpsReadinessPanel({ health }: { health: Awaited<ReturnType<typeof getLaunchHealth>> }) {
  const readiness = health.readiness
  const missingPlatformPreview = readiness.missingPlatformTables.slice(0, 6)
  const missingColumnPreview = readiness.missingPlatformColumns.slice(0, 6)

  return (
    <DashboardSection
      eyebrow="Live Ops Readiness"
      title={readiness.platformCanUseSupabase ? "Advanced tools are ready for Supabase persistence." : "Advanced tools are staged behind a safety gate."}
      description={readiness.readinessMessage}
      actions={
        <Badge className={readiness.platformCanUseSupabase ? "rounded-md bg-emerald-700 text-white" : "rounded-md bg-amber-600 text-white"}>
          {readiness.readinessLabel}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadinessFact
            icon={Database}
            label="Core Supabase"
            value={`${readiness.coreTableCount.ready}/${readiness.coreTableCount.total} tables`}
            ok={readiness.coreLiveReady}
          />
          <ReadinessFact
            icon={Activity}
            label="Platform ops"
            value={`${readiness.platformTableCount.ready}/${readiness.platformTableCount.total} tables`}
            ok={readiness.platformTablesReady}
          />
          <ReadinessFact
            icon={Signature}
            label="Signing fields"
            value={`${readiness.platformColumnCount.ready}/${readiness.platformColumnCount.total} columns`}
            ok={readiness.platformSchemaReady}
          />
          <ReadinessFact
            icon={Settings}
            label="Current feature mode"
            value={health.platformFeatureDataMode}
            ok={health.platformFeatureDataMode === "supabase" ? readiness.platformCanUseSupabase : true}
          />
          <ReadinessFact
            icon={ShieldCheck}
            label="Recommended mode"
            value={readiness.recommendedPlatformFeatureDataMode}
            ok={readiness.platformCanUseSupabase}
          />
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Staged activation path</p>
          <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
            <li>1. Apply Supabase migrations 0003 through 0007.</li>
            <li>2. Confirm this panel shows platform ops {readiness.platformTableCount.total}/{readiness.platformTableCount.total} and signing fields {readiness.platformColumnCount.total}/{readiness.platformColumnCount.total}.</li>
            <li>3. Set <code className="rounded bg-white px-1 py-0.5 text-xs">PLATFORM_FEATURE_DATA_MODE=supabase</code> and redeploy.</li>
            <li>4. Roll back with <code className="rounded bg-white px-1 py-0.5 text-xs">PLATFORM_FEATURE_DATA_MODE=mock</code> if any advanced tool needs review.</li>
          </ol>
          {missingPlatformPreview.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Missing platform tables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {missingPlatformPreview.map((table) => (
                  <Badge key={table} variant="outline" className="rounded-md bg-white">
                    {table}
                  </Badge>
                ))}
                {readiness.missingPlatformTables.length > missingPlatformPreview.length ? (
                  <Badge variant="outline" className="rounded-md bg-white">
                    +{readiness.missingPlatformTables.length - missingPlatformPreview.length} more
                  </Badge>
            ) : null}
            {missingColumnPreview.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Missing signing fields</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingColumnPreview.map((column) => (
                    <Badge key={column} variant="outline" className="rounded-md bg-white">
                      {column}
                    </Badge>
                  ))}
                  {readiness.missingPlatformColumns.length > missingColumnPreview.length ? (
                    <Badge variant="outline" className="rounded-md bg-white">
                      +{readiness.missingPlatformColumns.length - missingColumnPreview.length} more
                    </Badge>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
          ) : null}
        </div>
      </div>
    </DashboardSection>
  )
}

function ReadinessFact({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: LucideIcon
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
        </div>
        <span className={ok ? "flex size-9 items-center justify-center rounded-md bg-emerald-700 text-white" : "flex size-9 items-center justify-center rounded-md bg-amber-500 text-slate-950"}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function AdminWorkspaceNavigation() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Admin areas</p>
          <h2 className="text-lg font-semibold text-slate-950">Choose the queue or record set.</h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-slate-500">
          Admin is grouped by daily operating work: moderate public content, manage records,
          supervise private tools, and audit platform changes.
        </p>
      </div>
      <TabsList className="grid h-auto w-full gap-3 bg-transparent p-0 md:grid-cols-2 xl:grid-cols-5">
        {adminWorkspaceGroups.map((group) => (
          <div key={group.title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{group.title}</p>
            <p className="mt-1 min-h-8 text-xs leading-4 text-slate-500">{group.text}</p>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="h-auto justify-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 shadow-none data-[state=active]:border-slate-950 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </TabsTrigger>
                )
              })}
            </div>
          </div>
        ))}
      </TabsList>
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

function AdminPrivateOpsDetails({
  moderationCrm,
  riskOps,
  focus = "all",
}: {
  moderationCrm: NonNullable<Awaited<ReturnType<typeof getAdminModerationCrmDataService>>>
  riskOps: Awaited<ReturnType<typeof getContractorRiskOpsDataService>>
  focus?: "all" | "recovery" | "contracts"
}) {
  return (
    <details className="rounded-md border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 p-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">Private operations oversight</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">Recovery, lien, and contract safeguard controls</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Expand only when reviewing documentation-first recovery activity, private lien
            readiness, contract packets, decision reasons, or compliance notes.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          Show / hide
        </span>
      </summary>
      <div className="border-t border-slate-200 p-4">
        <AdminOpsExpansion moderationCrm={moderationCrm} riskOps={riskOps} focus={focus} />
      </div>
    </details>
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
