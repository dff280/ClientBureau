import type { Metadata } from "next"

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
  const missingTables = health.requiredTables.filter((table) => !table.exists)

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Configure moderation defaults, publication rules, evidence privacy, recovery review requirements, contract workflow defaults, and audit expectations.
          </p>
        </header>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Launch health</p>
                <CardTitle className="mt-1">Live readiness</CardTitle>
              </div>
              <Badge className={health.status === "ok" ? "rounded-md bg-emerald-700 text-white" : "rounded-md bg-amber-600 text-white"}>
                {health.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <HealthFact label="Data mode" value={health.dataMode} ok={health.dataMode === "supabase"} />
              <HealthFact label="Feature data" value={health.platformFeatureDataMode} ok={health.platformFeatureDataMode === "supabase"} />
              <HealthFact label="Supabase" value={health.supabaseConfigured ? "Configured" : "Missing"} ok={health.supabaseConfigured} />
              <HealthFact label="Service role" value={health.serviceRoleConfigured ? "Configured" : "Missing"} ok={health.serviceRoleConfigured} />
              <HealthFact label="Stripe" value={health.stripeConfigured ? "Configured" : "Missing"} ok={health.stripeConfigured} />
              <HealthFact label="Webhook" value={health.stripeWebhookConfigured ? "Configured" : "Missing"} ok={health.stripeWebhookConfigured} />
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                Required tables: {health.requiredTables.length - missingTables.length}/{health.requiredTables.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {missingTables.length === 0
                  ? "All launch and ops tables responded to the service-role health check."
                  : "Apply migrations 0003, 0004, 0005, and 0006 before enabling Supabase-backed platform features."}
              </p>
              {missingTables.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingTables.slice(0, 8).map((table) => (
                    <Badge key={table.name} variant="outline" className="rounded-md bg-white">
                      {table.name}
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

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Public visibility", "Client profiles stay private until an admin approves a report or explicitly marks the profile public."],
            ["Evidence privacy", "Uploaded evidence is private by default. Public profiles show only evidence summaries such as invoices reviewed or photos reviewed."],
            ["Discussions", "Discussion entries default to pending and require approval before public display."],
            ["Route protection", "Admin routes require the admin role. Normal users cannot access internal sections."],
            ["Feature data mode", `Platform expansion workflows currently read from ${platformFeatureMode} feature data.`],
            ["Decision reasons", "Moderation cases require a decision reason before final closure in the CRM workflow."],
            ["Recovery cases", "Recovery actions require factual invoice context, documented contact attempts, response windows, and respectful communication language."],
            ["Phone outreach", "Call workflows are logged as documented outreach. The platform does not place automated payment calls."],
            ["Lien packets", "Lien packet tools create private review packets only. State-specific deadlines, recipients, delivery methods, and contract terms must be reviewed before sending."],
            ["Contract signing links", "Contract workspace records track scope, deposit, milestone billing, change orders, payment plans, client invite status, and signed-document status."],
            ["Resolution path", "Disputes, corrections, partial payments, and resolved reports should be reflected in moderation notes and public summaries only after review."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
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
