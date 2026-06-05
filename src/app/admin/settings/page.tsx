import type { Metadata } from "next"
import { Activity, Database, Settings, ShieldCheck, Signature } from "lucide-react"

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
      title: "Safety defaults",
      items: [
        ["Public visibility", "Client profiles stay private until an admin approves a report or explicitly marks the profile public."],
        ["Discussions", "Discussion entries default to pending and require approval before public display."],
        ["Decision reasons", "Moderation cases require a decision reason before final closure in the CRM workflow."],
        ["Resolution path", "Disputes, corrections, partial payments, and resolved reports should be reflected in moderation notes and public summaries only after review."],
      ],
    },
    {
      title: "Evidence privacy",
      items: [
        ["Evidence privacy", "Uploaded evidence is private by default. Public profiles show only evidence summaries such as invoices reviewed or photos reviewed."],
        ["Route protection", "Admin routes require the admin role. Normal users cannot access internal sections."],
        ["Feature data mode", `Platform expansion workflows currently read from ${platformFeatureMode} feature data.`],
      ],
    },
    {
      title: "Private workflow controls",
      items: [
        ["Recovery cases", "Recovery actions require factual invoice context, documented contact attempts, response windows, and respectful communication language."],
        ["Phone outreach", "Call workflows are logged as documented outreach. The platform does not place automated payment calls."],
        ["Lien packets", "Lien packet tools create private review packets only. State-specific deadlines, recipients, delivery methods, and contract terms must be reviewed before sending."],
        ["Contract signing links", "Contract workspace records track scope, deposit, milestone billing, change orders, payment plans, client invite status, and signed-document status."],
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
          <StatCard label="Launch status" value={health.status} helper={readiness.readinessLabel} icon={ShieldCheck} tone={health.status === "ok" ? "emerald" : "amber"} />
          <StatCard label="Data mode" value={health.dataMode} helper="Core records source" icon={Database} tone={health.dataMode === "supabase" ? "emerald" : "amber"} />
            <StatCard label="Feature mode" value={health.platformFeatureDataMode} helper="Advanced ops data source" icon={Settings} tone={health.platformFeatureDataMode === "supabase" ? "emerald" : "amber"} />
            <StatCard label="Platform tables" value={`${readiness.platformTableCount.ready}/${readiness.platformTableCount.total}`} helper="Advanced ops readiness" icon={Activity} tone={readiness.platformTablesReady ? "emerald" : "amber"} />
            <StatCard label="Signing fields" value={`${readiness.platformColumnCount.ready}/${readiness.platformColumnCount.total}`} helper="Contract packet readiness" icon={Signature} tone={readiness.platformSchemaReady ? "emerald" : "amber"} />
          </div>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Launch health</p>
                <CardTitle className="mt-1">Staged live ops activation</CardTitle>
              </div>
              <Badge className={readiness.platformCanUseSupabase ? "rounded-md bg-emerald-700 text-white" : "rounded-md bg-amber-600 text-white"}>
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
              <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
                Flip only after platform tables are complete. Roll back by setting{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">PLATFORM_FEATURE_DATA_MODE=mock</code>,
                rebuilding, and leaving core Supabase records untouched.
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
                      <Badge variant="outline" className="rounded-md bg-white">+{missingTables.length - 8} more</Badge>
                    ) : null}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {settingsGroups.map((group) => (
          <DashboardSection key={group.title} title={group.title} description="Plain-English rules admins should be able to verify before publishing, importing, or changing records.">
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
