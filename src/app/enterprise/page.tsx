import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, FileCheck2, ShieldCheck, Users } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
} from "@/components/marketing/premium-page-shell"
import { PublicInquiryForm } from "@/components/forms/public-inquiry-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pageAssets } from "@/lib/page-assets"

export const metadata: Metadata = {
  title: "Enterprise Business Protection",
  description:
    "Enterprise Client Bureau options for teams, franchises, regional contractor groups, shared client checks, moderation visibility, and audit controls.",
  alternates: {
    canonical: "/enterprise",
  },
}

const capabilities = [
  {
    icon: Users,
    title: "Shared team workspace",
    text: "Coordinate client checks, saved searches, reports, evidence, contracts, recovery cases, and internal review across multiple users.",
  },
  {
    icon: FileCheck2,
    title: "Workflow visibility",
    text: "Track report submissions, review state, public-profile publication, contract packets, recovery cases, and Florida lien service activity.",
  },
  {
    icon: ShieldCheck,
    title: "Governance review",
    text: "Scope public-summary controls, private evidence handling, response paths, audit notes, moderation oversight, and team workflow expectations before rollout.",
  },
]

const proof = [
  { label: "Best for", value: "Teams", text: "Multi-user contractors, offices, franchise groups, and regional service businesses." },
  { label: "Focus", value: "Risk ops", text: "Search, documents, reporting, recovery, lien service, and audit visibility." },
  { label: "Setup", value: "Guided", text: "Annual plans can include onboarding, policy setup, and team workflow support." },
  { label: "Privacy", value: "Controlled", text: "Public output remains moderated while private case records stay restricted." },
]

const enterpriseUseCases = [
  "Multiple estimators need shared visibility into client searches and watched profiles.",
  "A business owner wants every report, contract, evidence item, and recovery case tracked in one place.",
  "A regional group wants moderation review, audit history, and policy controls for higher submission volume.",
  "A franchise or association wants consistent client-risk workflows across teams or markets.",
]

const adminOpsAsset = pageAssets.adminOpsCrm

export default function EnterprisePage() {
  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Enterprise"
        title="Client-risk operations for teams that cannot afford scattered records."
        description="Bureau Pro and Enterprise review help contractor groups coordinate client checks, reports, contracts, evidence, recovery workflows, Florida lien service activity, and audit visibility across the business."
        primary={{ href: "#enterprise-inquiry", label: "Request enterprise review", icon: Building2 }}
        secondary={{ href: "/pricing", label: "Compare plans", icon: ArrowRight }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Enterprise operations"
            title="Shared risk and moderation visibility."
            description="Enterprise plans are scoped around seats, search volume, team workflow, profile controls, and onboarding support."
            imageSrc={adminOpsAsset.src}
            imageAlt={adminOpsAsset.alt}
            points={adminOpsAsset.points}
          />
        }
      />

      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container space-y-10">
          <PremiumSectionHeader
            eyebrow="Built for growing teams"
            title="The more people involved in sales, crews, billing, and project documentation, the more the record matters."
            description="Enterprise Client Bureau turns client checks and business-protection workflows into a shared operating system instead of a collection of inboxes, spreadsheets, and screenshots."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                  Enterprise is for businesses that need consistency.
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  If estimators, office staff, project managers, owners, and crews all touch the
                  client relationship, Client Bureau helps keep the risk record, contract record,
                  evidence record, and recovery record connected.
                </p>
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href="#enterprise-inquiry">
                    Request enterprise review
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Common use cases</h2>
                <ul className="grid gap-3">
                  {enterpriseUseCases.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                      <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div id="enterprise-inquiry" className="grid scroll-mt-24 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-md border-slate-200 bg-slate-950 text-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs font-semibold uppercase tracking-normal text-amber-300">Enterprise inquiry</p>
                <h2 className="text-2xl font-semibold tracking-normal">Ask for a scoped team review.</h2>
                <p className="text-sm leading-6 text-slate-200">
                  Use this path for seats, team workflow, regional rollout, franchise or association questions,
                  moderation visibility, and onboarding review. Do not submit case evidence, client identifiers,
                  or private account details here.
                </p>
                <ul className="grid gap-2 text-sm leading-6 text-slate-200">
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                    <span>Private inquiry queue for staff review.</span>
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                    <span>Scoped review before any enterprise commitments.</span>
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                    <span>Evidence and profile disputes stay in dedicated workflows.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <PublicInquiryForm
              sourcePath="/enterprise"
              inquiryType="enterprise"
              defaultTopic="enterprise_or_team_review"
              submitLabel="Send enterprise inquiry"
              pendingLabel="Sending enterprise inquiry..."
            />
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Enterprise review"
        title="Bring client checks, contracts, reports, evidence, recovery, and audit visibility into one team workflow."
        description="Client Bureau can help define the right plan, seats, usage, review controls, and launch path for your business."
        primary={{ href: "#enterprise-inquiry", label: "Request enterprise review", icon: Building2 }}
        secondary={{ href: "/resources", label: "Review resources", icon: FileCheck2 }}
      />
    </main>
  )
}
