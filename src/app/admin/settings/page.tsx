import type { Metadata } from "next"
import { Activity, ArrowRight, Database, FileCode2, Settings, ShieldCheck, Signature } from "lucide-react"

import { AdminPageHeader, DashboardSection, StatCard } from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlatformFeatureDataMode } from "@/lib/env"
import { getLaunchHealth } from "@/lib/launch-health"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const platformFeatureMode = getPlatformFeatureDataMode()
  const health = await getLaunchHealth()
  const readiness = health.readiness
  const missingTables = health.requiredTables.filter((table) => !table.exists)
  const settingsGroups = [
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
        ["Feature data mode", `Platform expansion workflows currently read from ${platformFeatureMode} feature data.`],
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
            label="Data mode"
            value={health.dataMode}
            helper="Core records source"
            icon={Database}
            tone={health.dataMode === "supabase" ? "emerald" : "amber"}
          />
          <StatCard
            label="Feature mode"
            value={health.platformFeatureDataMode}
            helper="Advanced ops data source"
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
              <HealthFact label="Data mode" value={health.dataMode} ok={health.dataMode === "supabase"} />
              <HealthFact label="Feature data" value={health.platformFeatureDataMode} ok={health.platformFeatureDataMode === "supabase"} />
              <HealthFact label="Supabase" value={health.supabaseConfigured ? "Configured" : "Missing"} ok={health.supabaseConfigured} />
              <HealthFact label="Service role" value={health.serviceRoleConfigured ? "Configured" : "Missing"} ok={health.serviceRoleConfigured} />
              <HealthFact label="Core tables" value={`${readiness.coreTableCount.ready}/${readiness.coreTableCount.total}`} ok={readiness.coreTablesReady} />
              <HealthFact label="Platform tables" value={`${readiness.platformTableCount.ready}/${readiness.platformTableCount.total}`} ok={readiness.platformTablesReady} />
              <HealthFact label="Signing fields" value={`${readiness.platformColumnCount.ready}/${readiness.platformColumnCount.total}`} ok={readiness.platformSchemaReady} />
              <HealthFact label="Stripe" value={health.stripeConfigured ? "Configured" : "Missing"} ok={health.stripeConfigured} />
              <HealthFact label="Webhook" value={health.stripeWebhookConfigured ? "Configured" : "Missing"} ok={health.stripeWebhookConfigured} />
              <HealthFact label="Recommended mode" value={readiness.recommendedPlatformFeatureDataMode} ok={readiness.platformCanUseSupabase} />
              <HealthFact label="Rollback mode" value="mock" ok />
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">{readiness.readinessLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {readiness.readinessMessage}
              </p>
              <div className="mt-4 grid gap-3">
                <ReadinessStep
                  title="Keep advanced tools in safe mode"
                  detail="Core auth, reports, admin review, public profiles, and search can stay live while advanced ops waits for the database finish."
                  value="PLATFORM_FEATURE_DATA_MODE=mock"
                />
                <ReadinessStep
                  title="Apply the platform backfill if health shows missing columns"
                  detail="Run this SQL after the earlier migrations when contract signing, recovery, or lien readiness fields are missing."
                  value="supabase/migrations/0013_live_platform_schema_backfill.sql"
                />
                <ReadinessStep
                  title="Flip only after health says ready"
                  detail="When platformCanUseSupabase is true, switch advanced workflows to Supabase and rebuild. Rollback is the same safe-mode value."
                  value="PLATFORM_FEATURE_DATA_MODE=supabase"
                />
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

        {settingsGroups.map((group) => (
          <DashboardSection
            key={group.title}
            title={group.title}
            description="Plain-English rules admins should be able to verify before publishing, importing, or changing records."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {group.items.map(([title, text]) => (
                <div key={title} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </DashboardSection>
        ))}
      </div>
    </section>
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
