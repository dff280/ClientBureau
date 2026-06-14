import type { Metadata } from "next"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Bell,
  ClipboardCheck,
  Database,
  EyeOff,
  FileCheck2,
  FileCode2,
  Globe2,
  Landmark,
  LockKeyhole,
  Receipt,
  SearchCheck,
  Settings,
  ShieldCheck,
  Signature,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

import {
  AdminPageHeader,
  DashboardSection,
  HeaderActionButton,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { profileSupportsType } from "@/lib/entity-profiles"
import { getLaunchHealth } from "@/lib/launch-health"
import { getPublicEntityProfilesService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Internal Client Bureau settings and release-readiness workspace for moderation rules, privacy defaults, service safeguards, SEO gates, and platform health.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const [health, publicEntityProfiles] = await Promise.all([
    getLaunchHealth(),
    getPublicEntityProfilesService(),
  ])
  const readiness = health.readiness
  const missingTables = health.requiredTables.filter((table) => !table.exists)
  const liveOpsActive = readiness.platformCanUseSupabase && health.platformFeatureDataMode === "supabase"
  const publicSubcontractorProfiles = publicEntityProfiles.filter((profile) =>
    profile.isPublic && profileSupportsType(profile, "subcontractor"),
  )
  const subcontractorProfileReady = publicSubcontractorProfiles.length > 0
  const coreRecordsLabel = health.dataMode === "supabase" ? "Live" : "Needs review"
  const advancedRecordsLabel = liveOpsActive ? "Live" : "Guided"
  const recommendedRecordsLabel = readiness.platformCanUseSupabase ? "Live" : "Guided"
  const releaseGateStatus = health.status === "ok" && readiness.coreLiveReady && readiness.platformCanUseSupabase
  const privacyGateStatus = readiness.platformSchemaReady && health.serviceRoleConfigured
  const stripeStatus = health.stripeConfigured && health.stripeWebhookConfigured
  const readinessSteps = liveOpsActive
    ? [
        {
          title: "Live operations are active",
          detail:
            "Contractor dashboard tools, admin ops records, unified profiles, graph links, recovery, lien, contract, and evidence workflows are saving to live account records.",
          value: "Account records live",
        },
        {
          title: "Run live workflow QA before each release",
          detail:
            "Verify contractor tool saves, admin moderation, profile graph actions, session stability, and public profile privacy after every deploy.",
          value: "docs/LIVE_WORKFLOW_QA_RUNBOOK.md",
        },
        {
          title: "Rollback remains available",
          detail:
            "If an advanced ops workflow needs review, move that workspace back to guided mode and rebuild. Core auth, reports, admin approval, public profiles, and SEO stay live.",
          value: "Guided fallback available",
        },
      ]
    : [
        {
          title: "Keep advanced tools in guided mode",
          detail:
            "Core auth, reports, admin review, public profiles, and search can stay live while advanced ops waits for database readiness.",
          value: "Guided workspace active",
        },
        {
          title: "Apply the platform backfill if health shows missing columns",
          detail:
            "Run this SQL after the earlier migrations when contract signing, recovery, lien readiness, or graph fields are missing.",
          value: "supabase/migrations/manual-0014-0018-reputation-graph.sql",
        },
        {
          title: "Flip only after health says ready",
          detail:
            "When readiness is green, switch advanced workflows to live account records and rebuild. Rollback returns that workspace to guided mode.",
          value: "Live records after readiness",
        },
      ]
  const controlCenterCards = [
    {
      title: "Moderation and publication",
      status: "Review gated",
      detail:
        "Reports, discussions, responses, disputes, and public profile changes should require staff review before any public display.",
      href: "/admin/reports",
      cta: "Review queues",
      icon: ClipboardCheck,
      tone: "blue" as const,
    },
    {
      title: "Privacy and evidence",
      status: "Private by default",
      detail:
        "Raw evidence, storage paths, private identifiers, signed snapshots, and internal notes stay inside authenticated workspaces.",
      href: "/admin/uploads",
      cta: "Evidence intake",
      icon: LockKeyhole,
      tone: "emerald" as const,
    },
    {
      title: "Recovery and lien service",
      status: "Review required",
      detail:
        "Managed recovery and Florida lien workflows need fee status, authorization, document readiness, and staff notes before action.",
      href: "/admin/recovery",
      cta: "Service desk",
      icon: Landmark,
      tone: "amber" as const,
    },
    {
      title: "Contract packets",
      status: "Noindexed",
      detail:
        "Agreement packets, signing links, payment terms, signed digests, and client invite records remain private business records.",
      href: "/admin/contracts",
      cta: "Contract desk",
      icon: Signature,
      tone: "blue" as const,
    },
    {
      title: "Public SEO surfaces",
      status: "Approved only",
      detail:
        "Sitemaps, directories, recent reports, profile schema, and crawler assets should only link to moderated public records.",
      href: "/clients",
      cta: "Public directory",
      icon: Globe2,
      tone: "slate" as const,
    },
    {
      title: "Subcontractor profile launch",
      status: subcontractorProfileReady ? "Ready" : "Needs profile",
      detail: subcontractorProfileReady
        ? "At least one real public subcontractor or trade-professional profile is published and available for acquisition checks."
        : "Publish one real verified subcontractor or trade-professional profile before running acquisition campaigns against the trade directory.",
      href: "/admin/profiles?type=subcontractor",
      cta: "Open readiness",
      icon: UserCheck,
      tone: subcontractorProfileReady ? ("emerald" as const) : ("amber" as const),
    },
    {
      title: "Release safety",
      status: releaseGateStatus ? "Ready" : "Needs review",
      detail:
        "Health, version identity, auth boundaries, no-store diagnostics, privacy scans, and crawl assets are checked before deploys.",
      href: "/api/health",
      cta: "Health JSON",
      icon: Activity,
      tone: releaseGateStatus ? ("emerald" as const) : ("amber" as const),
    },
  ]
  const launchGateCards = [
    {
      title: "Core platform",
      value: readiness.coreLiveReady ? "Ready" : "Review",
      detail: "Auth, reports, admin approval, public profiles, search, directories, and diagnostics.",
      icon: ShieldCheck,
      tone: readiness.coreLiveReady ? ("emerald" as const) : ("amber" as const),
    },
    {
      title: "Advanced operations",
      value: readiness.platformCanUseSupabase ? "Live" : "Guided",
      detail: "Watchlist, contracts, recovery, lien service, evidence, profile graph, and admin ops records.",
      icon: Database,
      tone: liveOpsActive ? ("emerald" as const) : ("amber" as const),
    },
    {
      title: "Privacy gates",
      value: privacyGateStatus ? "Sealed" : "Review",
      detail: "Private identifiers, evidence, signed snapshots, internal notes, pending and rejected content.",
      icon: EyeOff,
      tone: privacyGateStatus ? ("emerald" as const) : ("amber" as const),
    },
    {
      title: "Billing readiness",
      value: stripeStatus ? "Configured" : "Deferred",
      detail: "Stripe checkout and webhook configuration. Product can operate while billing remains deferred.",
      icon: Receipt,
      tone: stripeStatus ? ("emerald" as const) : ("slate" as const),
    },
    {
      title: "Subcontractor SEO",
      value: subcontractorProfileReady ? "Ready" : "Needs profile",
      detail: subcontractorProfileReady
        ? `${publicSubcontractorProfiles.length} public trade profile${publicSubcontractorProfiles.length === 1 ? "" : "s"} available.`
        : "Directory is safe, but acquisition should wait for a real verified trade profile.",
      icon: UserCheck,
      tone: subcontractorProfileReady ? ("emerald" as const) : ("amber" as const),
    },
  ]
  const operatorChecklist = [
    {
      title: "Before publishing public content",
      detail:
        "Confirm approved status, neutral summary wording, no private identifiers, evidence labels only, and response/dispute context.",
      icon: FileCheck2,
      tone: "blue" as const,
    },
    {
      title: "Before staff service action",
      detail:
        "Confirm fee status, contractor authorization, documents, deadline context, respectful communication notes, and next action.",
      icon: UserCheck,
      tone: "amber" as const,
    },
    {
      title: "Before release",
      detail:
        "Run build, tests, SEO check, live verification, session checks, and public privacy scan after deploy.",
      icon: SearchCheck,
      tone: "emerald" as const,
    },
    {
      title: "When something looks wrong",
      detail:
        "Use guided fallback for advanced tools, keep core records live, review audit events, and avoid public exposure.",
      icon: Bell,
      tone: "rose" as const,
    },
    {
      title: "Before subcontractor acquisition",
      detail:
        "Confirm a real verified trade profile is public, has a neutral summary, uses Trade Partner Reliability, and exposes no private identifiers.",
      icon: UserCheck,
      tone: subcontractorProfileReady ? ("emerald" as const) : ("amber" as const),
    },
  ]
  const settingsGroups: Array<{ title: string; items: Array<[string, string]> }> = [
    {
      title: "Moderation Rules",
      items: [
        ["Discussions", "Discussion entries default to pending and require approval before public display."],
        ["Decision reasons", "Moderation cases require a decision reason before final closure in the CRM workflow."],
        ["Resolution path", "Disputes, corrections, partial payments, and resolved reports should be reflected in moderation notes and public summaries only after review."],
        ["Needs more information", "Use the needs-more-info preset when identity, timeline, payment context, evidence, or summary wording is not ready for publication."],
      ],
    },
    {
      title: "Rating Display",
      items: [
        ["Client Bureau Rating", "Ratings should be described as contractor-submitted platform indicators, not a credit score, background check, legal finding, or guarantee."],
        ["Rating factors", "Public rating context may include report count, payment context, resolution status, response status, evidence confidence, and recency."],
        ["Positive reports", "Positive client reports should display as positive history, paid as agreed, clear communication, or no payment issue reported."],
        ["Risk language", "Use careful labels such as moderate caution, elevated caution, reported payment risk, and response context."],
      ],
    },
    {
      title: "Evidence Privacy",
      items: [
        ["Evidence privacy", "Uploaded evidence is private by default. Public profiles show only evidence summaries such as invoices reviewed or photos reviewed."],
        ["Route protection", "Admin routes require the admin role. Normal users cannot access internal sections."],
        ["Advanced records", `Platform expansion workflows are currently in ${advancedRecordsLabel.toLowerCase()} mode.`],
        ["Public evidence labels", "Public pages should show evidence-on-file summaries only, never raw filenames, storage paths, invoices, photos, screenshots, contracts, or PDFs."],
      ],
    },
    {
      title: "Public Visibility",
      items: [
        ["Public profiles", "Client profiles stay private until an admin approves a report or explicitly marks the profile public."],
        ["Directories and sitemap", "Only approved public client profiles and public-safe marketing/policy pages should appear in indexable surfaces."],
        ["Private identifiers", "Phone numbers, emails, street addresses, private notes, evidence files, and pending or rejected submissions must not appear publicly."],
        ["Right of response", "Client response, correction, dispute, and resolution updates require moderation before display."],
      ],
    },
    {
      title: "Recovery/Lien Safeguards",
      items: [
        ["Recovery cases", "Recovery actions require factual invoice context, documented contact attempts, response windows, and respectful communication language."],
        ["Phone outreach", "Call workflows are logged as documented outreach. The platform does not place automated payment calls."],
        ["Lien packets", "Lien packet tools create private review packets only. State-specific deadlines, recipients, delivery methods, and contract terms must be reviewed before sending."],
        ["Filing workflow", "Florida lien service steps require contractor authorization, staff review, vendor/attorney workflow readiness, and private recording proof."],
      ],
    },
    {
      title: "Contract Defaults",
      items: [
        ["Contract signing links", "Contract workspace records track scope, deposit, milestone billing, change orders, payment plans, client invite status, and signed-document status."],
        ["No legal advice", "Agreement packets are private workflow records and should not imply legal advice, escrow, automatic payment enforcement, or guaranteed collection."],
        ["Signature records", "Signed snapshots, signature status, client invite state, and audit history remain private."],
        ["Payment terms", "Contracts document payment terms only unless a future payment product is explicitly enabled."],
      ],
    },
    {
      title: "SEO/Public Profiles",
      items: [
        ["Profile SEO", "Profile titles, descriptions, H1 text, schema, directories, and sitemap entries should remain cautious and non-defamatory."],
        ["Structured data", "Use compliant profile/page schema. Do not mark Client Bureau Rating as fake review stars or AggregateRating rich results."],
        ["Directories", "State, city, recent reports, and client profile directories should link only to approved public profiles."],
        ["LLM and crawler assets", "Keep sitemap, robots, and llms.txt aligned with approved public surfaces."],
      ],
    },
  ]

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          eyebrow="Platform"
          title="Settings"
          description="Review moderation rules, publication defaults, evidence privacy, recovery review requirements, contract workflow defaults, and launch readiness."
          actions={
            <>
              <HeaderActionButton href="/api/health" variant="outline">
                <Activity aria-hidden="true" />
                Health
              </HeaderActionButton>
              <HeaderActionButton href="/admin/audit-log" variant="outline">
                <ClipboardCheck aria-hidden="true" />
                Audit log
              </HeaderActionButton>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Launch status"
            value={health.status}
            helper={readiness.readinessLabel}
            icon={ShieldCheck}
            tone={health.status === "ok" ? "emerald" : "amber"}
          />
          <StatCard
            label="Core records"
            value={coreRecordsLabel}
            helper="Core records source"
            icon={Database}
            tone={health.dataMode === "supabase" ? "emerald" : "amber"}
          />
          <StatCard
            label="Advanced records"
            value={advancedRecordsLabel}
            helper="Advanced ops readiness"
            icon={Settings}
            tone={health.platformFeatureDataMode === "supabase" ? "emerald" : "amber"}
          />
          <StatCard
            label="Platform tables"
            value={`${readiness.platformTableCount.ready}/${readiness.platformTableCount.total}`}
            helper="Advanced ops readiness"
            icon={Activity}
            tone={readiness.platformTablesReady ? "emerald" : "amber"}
          />
          <StatCard
            label="Signing fields"
            value={`${readiness.platformColumnCount.ready}/${readiness.platformColumnCount.total}`}
            helper="Contract packet readiness"
            icon={Signature}
            tone={readiness.platformSchemaReady ? "emerald" : "amber"}
          />
        </div>

        <DashboardSection
          eyebrow="Control center"
          title="Admin operating defaults"
          description="The settings page should tell staff what is live, what is private, what requires moderation, and where to go next."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {controlCenterCards.map((card) => (
              <ControlCenterCard key={card.title} {...card} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Release gates"
          title="What must stay true"
          description="A quick safety read before publishing, reviewing service cases, or pushing another release."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {launchGateCards.map((card) => (
              <LaunchGateCard key={card.title} {...card} />
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {operatorChecklist.map((item) => (
              <OperatorChecklistItem key={item.title} {...item} />
            ))}
          </div>
        </DashboardSection>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Launch health</p>
                <CardTitle className="mt-1">Staged live ops activation</CardTitle>
              </div>
              <Badge
                className={
                  readiness.platformCanUseSupabase
                    ? "rounded-md bg-emerald-700 text-white"
                    : "rounded-md bg-amber-600 text-white"
                }
              >
                {readiness.readinessLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <HealthFact label="Core records" value={coreRecordsLabel} ok={health.dataMode === "supabase"} />
              <HealthFact label="Advanced records" value={advancedRecordsLabel} ok={health.platformFeatureDataMode === "supabase"} />
              <HealthFact label="Supabase" value={health.supabaseConfigured ? "Configured" : "Missing"} ok={health.supabaseConfigured} />
              <HealthFact label="Service role" value={health.serviceRoleConfigured ? "Configured" : "Missing"} ok={health.serviceRoleConfigured} />
              <HealthFact label="Core tables" value={`${readiness.coreTableCount.ready}/${readiness.coreTableCount.total}`} ok={readiness.coreTablesReady} />
              <HealthFact label="Platform tables" value={`${readiness.platformTableCount.ready}/${readiness.platformTableCount.total}`} ok={readiness.platformTablesReady} />
              <HealthFact label="Signing fields" value={`${readiness.platformColumnCount.ready}/${readiness.platformColumnCount.total}`} ok={readiness.platformSchemaReady} />
              <HealthFact label="Stripe" value={health.stripeConfigured ? "Configured" : "Missing"} ok={health.stripeConfigured} />
              <HealthFact label="Webhook" value={health.stripeWebhookConfigured ? "Configured" : "Missing"} ok={health.stripeWebhookConfigured} />
              <HealthFact label="Recommended state" value={recommendedRecordsLabel} ok={readiness.platformCanUseSupabase} />
              <HealthFact label="Fallback state" value="Guided" ok />
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{readiness.readinessLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {readiness.readinessMessage}
              </p>
              <div className="mt-4 grid gap-3">
                {readinessSteps.map((step) => (
                  <ReadinessStep key={step.title} {...step} />
                ))}
              </div>
              {missingTables.length > 0 || readiness.missingPlatformColumns.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingTables.slice(0, 8).map((table) => (
                    <Badge key={table.name} variant="outline" className="rounded-md bg-white">
                      {table.name}
                    </Badge>
                  ))}
                  {readiness.missingPlatformColumns.slice(0, 8).map((column) => (
                    <Badge key={column} variant="outline" className="rounded-md bg-white">
                      {column}
                    </Badge>
                  ))}
                  {missingTables.length > 8 ? (
                    <Badge variant="outline" className="rounded-md bg-white">
                      +{missingTables.length - 8} more
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <DashboardSection
          eyebrow="Rulebook"
          title="Plain-English policy defaults"
          description="Compact defaults admins should be able to verify before publishing, importing, editing, sending, filing, or changing records."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {settingsGroups.map((group) => (
              <SettingsRuleGroup key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </DashboardSection>
      </div>
    </section>
  )
}

function ControlCenterCard({
  title,
  status,
  detail,
  href,
  cta,
  icon: Icon,
  tone,
}: {
  title: string
  status: string
  detail: string
  href: string
  cta: string
  icon: LucideIcon
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    blue: "border-sky-200 bg-sky-50 text-sky-950",
  }[tone]

  return (
    <Link href={href} className={`group block rounded-md border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/75">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
        {cta}
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

function LaunchGateCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <StatusBadge tone={tone}>
          <Icon className="mr-1 size-3.5" aria-hidden="true" />
          {tone === "emerald" ? "clear" : tone === "rose" ? "urgent" : "watch"}
        </StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  )
}

function OperatorChecklistItem({
  title,
  detail,
  icon: Icon,
  tone,
}: {
  title: string
  detail: string
  icon: LucideIcon
  tone: "slate" | "amber" | "emerald" | "rose" | "blue"
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <StatusBadge tone={tone}>check</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </div>
    </article>
  )
}

function SettingsRuleGroup({
  title,
  items,
}: {
  title: string
  items: Array<[string, string]>
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <Badge variant="outline" className="rounded-md bg-white">
          {items.length} rules
        </Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map(([itemTitle, text]) => (
          <div key={itemTitle} className="rounded-md border border-white bg-white p-3">
            <p className="text-sm font-semibold text-slate-950">{itemTitle}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function ReadinessStep({ title, detail, value }: { title: string; detail: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
          <FileCode2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
          <p className="mt-2 inline-flex max-w-full items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
            <code className="truncate">{value}</code>
          </p>
        </div>
      </div>
    </div>
  )
}

function HealthFact({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className={ok ? "mt-1 font-semibold text-emerald-800" : "mt-1 font-semibold text-amber-800"}>
        {value}
      </p>
    </div>
  )
}
