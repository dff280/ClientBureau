import type { Metadata } from "next"

import { getPlatformFeatureDataMode } from "@/lib/env"

export const metadata: Metadata = {
  title: "Admin Settings",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const platformFeatureMode = getPlatformFeatureDataMode()

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase text-amber-700">Platform settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
            Safety defaults
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Production defaults keep the platform restrained: public pages show only approved content, private identifiers stay hashed, evidence files remain private, and admin actions require audit history.
          </p>
        </header>
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
