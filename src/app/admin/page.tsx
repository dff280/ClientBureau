import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  Activity,
  ClipboardCheck,
  Database,
  History,
  Landmark,
  MessageSquareText,
  PhoneCall,
  Search,
  Settings,
  ShieldCheck,
  Signature,
  UploadCloud,
  UserRound,
  UsersRound,
} from "lucide-react"

import { AdminQueueHeader } from "@/components/admin/admin-crm-ui"
import {
  DashboardPageHeader,
  DashboardSection,
  GuidedActionPanel,
  HeaderActionButton,
  QuickActionCard,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import {
  getAdminModerationCrmDataService,
  getAdminWorkspaceDataService,
  getContractorRiskOpsDataService,
} from "@/lib/repositories/client-bureau-service"
import { getLaunchHealth } from "@/lib/launch-health"
import { countOpenRecoveryCases } from "@/lib/platform-features"

export const metadata: Metadata = {
  title: "Admin Command Center",
  description:
    "Internal Client Bureau operations dashboard for report moderation, profile management, service oversight, audit review, and release readiness.",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  const [data, moderationCrm, health] = await Promise.all([
    getAdminWorkspaceDataService(),
    getAdminModerationCrmDataService(),
    getLaunchHealth(),
  ])
  const firstContractorUserId =
    data.contractors[0]?.userId ?? data.users.find((item) => item.role === "contractor")?.id
  const riskOps = firstContractorUserId
    ? await getContractorRiskOpsDataService(firstContractorUserId)
    : undefined

  const pendingReports = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status),
  ).length
  const pendingDiscussions = data.discussions.filter((item) => item.status === "pending").length
  const pendingResponses = data.responses.filter((item) => item.status === "pending").length
  const evidenceAwaitingReview = data.reviews.filter((item) =>
    ["queued", "needs_dispute_review"].includes(item.review.status) && item.evidence.length > 0,
  ).length
  const publicClients = data.clients.filter((item) => item.isPublic).length
  const privateClients = data.clients.length - publicClients
  const elevatedClients = data.clients.filter((item) => ["Elevated", "High"].includes(item.riskLevel)).length
  const averageRating =
    data.clients.length > 0
      ? Math.round(data.clients.reduce((total, item) => total + item.clientBureauScore, 0) / data.clients.length)
      : 0
  const verifiedBusinesses = data.contractors.filter((item) => item.verificationStatus === "verified").length
  const pendingBusinesses = data.contractors.filter((item) => item.verificationStatus === "pending").length
  const escalatedCases = moderationCrm?.cases.filter((item) => item.status === "escalated").length ?? 0
  const recoveryCases = riskOps
    ? countOpenRecoveryCases(riskOps.paymentRecoveryCases) +
      riskOps.managedRecoveryCases.filter((item) => !["resolved", "closed", "paused"].includes(item.status)).length
    : 0
  const lienCases = riskOps
    ? riskOps.lienNoticeDrafts.filter((item) => item.requiredReview).length +
      riskOps.floridaLienCases.filter((item) => !["released", "closed"].includes(item.status)).length
    : 0
  const contractPackets = riskOps?.contractPackets.filter((item) => item.status !== "archived").length ?? 0
  const signedPackets =
    riskOps?.contractPackets.filter((item) =>
      ["signed", "fully_signed", "completed"].includes(item.signatureStatus ?? item.shareStatus ?? item.status),
    ).length ?? 0
  const recentAudit = data.auditLog
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
  const newUsers = data.users
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardPageHeader
          eyebrow="Admin Command Center"
          title="Today's platform operations"
          description="Review public content, manage ratings and profiles, supervise private service workflows, and keep every admin action traceable."
          actions={
            <>
              <HeaderActionButton href="/admin/reports">
                <ClipboardCheck aria-hidden="true" />
                Review Reports
              </HeaderActionButton>
              <HeaderActionButton href="/admin/clients" variant="outline">
                <UserRound aria-hidden="true" />
                Manage Client Profiles
              </HeaderActionButton>
            </>
          }
          meta={
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-md bg-slate-50">Admin only</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">{escalatedCases} escalations</Badge>
              <Badge variant="outline" className="rounded-md bg-slate-50">
                {health.readiness.platformCanUseSupabase ? "Live ops active" : "Ops readiness check"}
              </Badge>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Review Reports" value={pendingReports} helper="Queued reports and dispute reviews" icon={ClipboardCheck} tone={pendingReports > 0 ? "amber" : "emerald"} href="/admin/reports" />
          <StatCard label="Evidence Review" value={evidenceAwaitingReview} helper="Private evidence attached to reports" icon={UploadCloud} tone={evidenceAwaitingReview > 0 ? "blue" : "slate"} href="/admin/reports" />
          <StatCard label="Discussions / Responses" value={pendingDiscussions + pendingResponses} helper="Pending public comments, responses, or corrections" icon={MessageSquareText} tone={pendingDiscussions + pendingResponses > 0 ? "amber" : "slate"} href="/admin/discussions" />
          <StatCard label="Audit Events" value={data.auditLog.length} helper="Approvals, edits, imports, deletes, and status changes" icon={History} tone="slate" href="/admin/audit-log" />
        </div>

        <DashboardSection
          eyebrow="Start here"
          title="What needs action today?"
          description="The command center is grouped by work type so staff can move from review to records to private service operations without hunting through the app."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            <GuidedActionPanel
              href="/admin/reports"
              icon={ShieldCheck}
              label={`${pendingReports} pending`}
              title="Review Reports"
              description="Move queued reports through safety review, public summary editing, and profile publication."
              cta="Open report queue"
              tone={pendingReports > 0 ? "amber" : "emerald"}
              steps={["Review report details and evidence status", "Edit public summary for careful language", "Approve, reject, or request more information"]}
            />
            <GuidedActionPanel
              href="/admin/clients"
              icon={UserRound}
              label={`${publicClients} public`}
              title="Manage Client Profiles"
              description="Keep public profile identity, city/state, rating, response, and visibility fields clean."
              cta="Manage profiles"
              tone="slate"
              steps={["Find the client profile", "Check public/private field boundaries", "Save visibility or rating changes with an audit note"]}
            />
            <GuidedActionPanel
              href="/admin/recovery"
              icon={PhoneCall}
              label={`${recoveryCases + lienCases} service items`}
              title="Service Oversight"
              description="Review Resolution Desk, Florida lien service, authorization, fee readiness, and private evidence."
              cta="Open service queues"
              tone={(recoveryCases + lienCases) > 0 ? "blue" : "slate"}
              steps={["Check case readiness and private documents", "Confirm fee, authorization, and deadline status", "Record staff/vendor actions in the audit trail"]}
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <QuickActionCard
              href="/admin/discussions"
              icon={MessageSquareText}
              title="Review Discussions"
              description="Moderate public discussion entries, client responses, corrections, and dispute context."
              badge={`${pendingDiscussions + pendingResponses} pending`}
            />
            <QuickActionCard
              href="/admin/contracts"
              icon={Signature}
              title="Contracts"
              description="Track agreement packets, signing links, signature status, and payment-term readiness."
              badge={`${contractPackets} active`}
            />
            <QuickActionCard
              href="/admin/audit-log"
              icon={History}
              title="Audit Trail"
              description="Review recent approvals, edits, imports, deletes, and visibility changes."
              badge={`${data.auditLog.length} events`}
            />
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Priority queues"
          title="Fast triage"
          description="Use this row as a quick operations scan before opening a detailed queue."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <PriorityQueue href="/admin/reports" label="Public content" value={pendingReports + pendingDiscussions + pendingResponses} detail="Reports, responses, and public discussion entries waiting for moderation." tone={(pendingReports + pendingDiscussions + pendingResponses) > 0 ? "amber" : "emerald"} />
            <PriorityQueue href="/admin/clients" label="Profile health" value={elevatedClients} detail="Elevated or high-risk public profile records that deserve a clean review path." tone={elevatedClients > 0 ? "amber" : "slate"} />
            <PriorityQueue href="/admin/recovery" label="Private services" value={recoveryCases + lienCases + contractPackets} detail="Recovery, lien service, and contract items that stay private to the account." tone={(recoveryCases + lienCases + contractPackets) > 0 ? "blue" : "slate"} />
          </div>
        </DashboardSection>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <DashboardSection
            eyebrow="Profile and rating health"
            title="Client Bureau records"
            description="Monitor public profile readiness, rating display, high-attention records, and business-owner verification."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <OpsFact icon={UserRound} label="Public client profiles" value={publicClients} helper={`${privateClients} private profiles remain hidden`} tone="emerald" />
              <OpsFact icon={Activity} label="Average Client Bureau Rating" value={`${averageRating}/100`} helper={`${elevatedClients} elevated or high risk profiles`} tone={elevatedClients > 0 ? "amber" : "slate"} />
              <OpsFact icon={UsersRound} label="Businesses / Users" value={data.users.length} helper={`${verifiedBusinesses} verified businesses, ${pendingBusinesses} pending`} tone="blue" />
              <OpsFact icon={Search} label="Public record surface" value={data.clients.length} helper="Client directory, profile pages, recent reports, and search previews" tone="slate" />
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Private service oversight"
            title="Recovery, liens, and contracts"
            description="These tools are private workflow records. They must not leak into public profiles unless converted into approved report context."
          >
            <div className="grid gap-3">
              <ServiceRow href="/admin/recovery" icon={PhoneCall} title="Resolution Desk" value={`${recoveryCases} open`} helper="Managed recovery, contact attempts, payment plan context, and case notes." tone={recoveryCases > 0 ? "amber" : "slate"} />
              <ServiceRow href="/admin/recovery" icon={Landmark} title="Florida Lien Service" value={`${lienCases} review`} helper="Notice, filing, recording proof, authorization, and release readiness." tone={lienCases > 0 ? "rose" : "slate"} />
              <ServiceRow href="/admin/contracts" icon={Signature} title="Contract packets" value={`${signedPackets}/${contractPackets} signed`} helper="Private signing links, snapshots, audit history, and payment terms." tone={contractPackets > 0 ? "blue" : "slate"} />
            </div>
          </DashboardSection>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <DashboardSection
            eyebrow="Recent users"
            title="New platform accounts"
            description="Review recent account type, role, and whether a business profile or response workflow may need follow-up."
          >
            <div className="grid gap-3">
              {newUsers.map((user) => (
                <Link key={user.id} href="/admin/contractors" className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{user.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <StatusBadge tone={user.role === "admin" ? "amber" : "slate"}>{user.role}</StatusBadge>
                      <StatusBadge tone={user.accountType === "client" ? "blue" : "slate"}>
                        {user.accountType === "client" ? "Client account" : "Business owner"}
                      </StatusBadge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection
            eyebrow="Audit"
            title="Latest admin activity"
            description="Recent actions help staff confirm approvals, edits, deletes, imports, and visibility changes."
          >
            <div className="grid gap-3">
              {recentAudit.map((entry) => (
                <Link key={entry.id} href="/admin/audit-log" className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-950">{entry.summary}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <StatusBadge tone={entry.action.toLowerCase().includes("reject") ? "rose" : "slate"}>
                      {entry.action}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </DashboardSection>
        </div>

        <DashboardSection
          eyebrow="Technical control plane"
          title="Operate records, identity graph, and platform readiness from one place"
          description="Use these controls when staff needs to change profile data, inspect graph relationships, confirm live database readiness, or review sensitive audit activity."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TechnicalControlCard
              href="/admin/profiles"
              icon={Database}
              label="Profile Graph"
              title="Unified identity CRM"
              detail="Claims, duplicate groups, report reassignment, redactions, contractor/subcontractor profile context."
              status={`${data.clients.length + data.contractors.length} records`}
              tone="blue"
            />
            <TechnicalControlCard
              href="/admin/clients"
              icon={UserRound}
              label="Client Records"
              title="Edit public-safe profile fields"
              detail="Identity, city/state, ZIP, rating, risk, visibility, report count, and public profile preview."
              status={`${publicClients} public`}
              tone="emerald"
            />
            <TechnicalControlCard
              href="/admin/contractors"
              icon={UsersRound}
              label="Business Records"
              title="Manage contractor/subcontractor data"
              detail="Trade, service area, license, website, company size, years in business, goals, and verification."
              status={`${pendingBusinesses} pending`}
              tone={pendingBusinesses > 0 ? "amber" : "slate"}
            />
            <TechnicalControlCard
              href="/api/health"
              icon={Database}
              label="Live Health"
              title="Supabase readiness"
              detail={`Core ${health.readiness.coreTableCount.ready}/${health.readiness.coreTableCount.total}, platform ${health.readiness.platformTableCount.ready}/${health.readiness.platformTableCount.total}, columns ${health.readiness.platformColumnCount.ready}/${health.readiness.platformColumnCount.total}.`}
              status={health.readiness.platformCanUseSupabase ? "Live ready" : "Review"}
              tone={health.readiness.platformCanUseSupabase ? "emerald" : "amber"}
            />
          </div>
        </DashboardSection>

        <ReleaseQaPanel health={health} />

        <LiveOpsReadinessPanel health={health} />
      </div>
    </section>
  )
}

function OpsFact({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  helper: string
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{helper}</p>
      <div className="mt-3">
        <StatusBadge tone={tone}>Operational</StatusBadge>
      </div>
    </div>
  )
}

function PriorityQueue({
  detail,
  href,
  label,
  tone,
  value,
}: {
  detail: string
  href: string
  label: string
  tone: "slate" | "amber" | "emerald" | "blue"
  value: number
}) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <StatusBadge tone={tone}>{value > 0 ? "Review" : "Clear"}</StatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  )
}

function ServiceRow({
  href,
  icon: Icon,
  title,
  value,
  helper,
  tone,
}: {
  href: string
  icon: LucideIcon
  title: string
  value: string
  helper: string
  tone: "slate" | "amber" | "rose" | "blue"
}) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{helper}</p>
          </div>
        </div>
        <StatusBadge tone={tone}>{value}</StatusBadge>
      </div>
    </Link>
  )
}

function TechnicalControlCard({
  detail,
  href,
  icon: Icon,
  label,
  status,
  title,
  tone,
}: {
  detail: string
  href: string
  icon: LucideIcon
  label: string
  status: string
  title: string
  tone: "slate" | "amber" | "emerald" | "blue"
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase text-amber-700">{label}</p>
      <h3 className="mt-1 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  )
}

function ReleaseQaPanel({ health }: { health: Awaited<ReturnType<typeof getLaunchHealth>> }) {
  const qaItems = [
    {
      title: "Release identity",
      detail: "Confirm the deployed version and commit match GitHub before staff starts QA.",
      href: "/api/version",
      action: "Open version",
      ready: health.status === "ok",
      icon: Database,
    },
    {
      title: "Admin session",
      detail: "Confirm this browser has a readable admin session before moderation actions.",
      href: "/api/admin/session",
      action: "Check session",
      ready: health.serviceRoleConfigured,
      icon: ShieldCheck,
    },
    {
      title: "Saved records",
      detail: "Create or update one safe QA record in dashboard tools, refresh, and verify it remains attached to the account.",
      href: "/dashboard",
      action: "Open dashboard",
      ready: health.readiness.platformCanUseSupabase,
      icon: Activity,
    },
    {
      title: "Public privacy",
      detail: "Review profile pages after approval: approved summaries only, no private identifiers or raw evidence.",
      href: "/clients",
      action: "Review profiles",
      ready: health.readiness.coreLiveReady,
      icon: Search,
    },
  ]

  return (
    <DashboardSection
      eyebrow="Release QA"
      title="Before calling a deploy clean"
      description="Use this short checklist after every release. The full runbook is in docs/LIVE_WORKFLOW_QA_RUNBOOK.md."
      actions={
        <HeaderActionButton href="/admin/settings" variant="outline">
          <Settings aria-hidden="true" />
          Readiness settings
        </HeaderActionButton>
      }
    >
      <div className="grid gap-3 lg:grid-cols-4">
        {qaItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <StatusBadge tone={item.ready ? "emerald" : "amber"}>
                  {item.ready ? "Ready" : "Check"}
                </StatusBadge>
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-amber-700">
                {item.action}
              </span>
            </Link>
          )
        })}
      </div>
    </DashboardSection>
  )
}

function LiveOpsReadinessPanel({ health }: { health: Awaited<ReturnType<typeof getLaunchHealth>> }) {
  const readiness = health.readiness

  return (
    <AdminQueueHeader
      eyebrow="Live Ops Readiness"
      title={readiness.platformCanUseSupabase ? "Advanced tools are saving to live account records." : "Advanced tools are waiting on a readiness check."}
      description={readiness.readinessMessage}
      icon={Database}
      badge={readiness.readinessLabel}
      actions={
        <HeaderActionButton href="/admin/settings" variant="outline">
          <Settings aria-hidden="true" />
          Review Settings
        </HeaderActionButton>
      }
    />
  )
}
