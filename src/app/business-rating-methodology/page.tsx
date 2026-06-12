import type { Metadata } from "next"
import { Building2, CheckCircle2, HelpCircle, ShieldCheck, Star } from "lucide-react"

import { PremiumCtaBand, PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteUrl } from "@/lib/env"

export const metadata: Metadata = {
  title: "Business & Trade Rating Methodology",
  description:
    "Learn how Client Bureau rates contractor business profiles and subcontractor trade partner profiles with role-specific trust factors.",
  alternates: {
    canonical: `${getSiteUrl()}/business-rating-methodology`,
  },
}

const ratingModels = [
  {
    title: "Contractor Business Reliability Rating",
    label: "Prime and service-business profile",
    text: "Built for contractors, service businesses, and customer-facing operators. It weighs business identity, client-facing project history, contracts, private evidence, payment resolution posture, and account readiness.",
    factors: [
      "Business identity and verification",
      "Client-facing project history",
      "Contracts and evidence discipline",
      "Payment and resolution posture",
      "Account and response readiness",
    ],
  },
  {
    title: "Subcontractor Trade Partner Reliability Rating",
    label: "Trade and crew profile",
    text: "Built for subcontractors, installers, crews, labor providers, and specialty trades. It weighs trade identity, scope documentation, GC/sub relationship history, payment-chain context, evidence readiness, and resolution posture.",
    factors: [
      "Trade identity and credential readiness",
      "Scope and documentation clarity",
      "GC/sub relationship history",
      "Payment-chain reliability context",
      "Evidence and completion readiness",
      "Communication and resolution posture",
    ],
  },
]

const factors = [
  {
    title: "Role-specific verification",
    weight: "Primary",
    text: "Contractor profiles emphasize operating business identity, service area, and customer-facing readiness. Subcontractor profiles emphasize trade identity, license or insurance indicators where available, crew readiness, and GC/sub relationship context.",
  },
  {
    title: "Project documentation",
    weight: "High",
    text: "Client Bureau rewards private documentation such as signed agreements, change orders, invoices, screenshots, photos, PDFs, and evidence summaries connected to moderated reports or business workflows.",
  },
  {
    title: "Approved relationship history",
    weight: "High",
    text: "Contractor ratings consider client-facing approved records. Subcontractor ratings place more weight on documented contractor-to-subcontractor, subcontractor-to-contractor, and business-to-business work relationships.",
  },
  {
    title: "Payment and resolution posture",
    weight: "High",
    text: "Open dispute context, unresolved balances, retainage/payment-chain signals, and documented resolution outcomes influence the rating. The system rewards clear records and response-aware handling.",
  },
  {
    title: "Profile readiness",
    weight: "Support",
    text: "Complete platform setup, profile claiming, response readiness, business details, and documentation habits help increase confidence that the profile reflects a real operating business or trade partner.",
  },
]

const notA = [
  "It is not a customer review score.",
  "It is not a guarantee of workmanship, payment collection, project outcome, or legal eligibility.",
  "It is not a credit score, background check, licensing board result, or insurance verification service.",
  "It does not display private emails, phone numbers, street addresses, uploaded evidence files, or staff-only moderation notes.",
]

export default function BusinessRatingMethodologyPage() {
  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Business & trade rating methodology"
        title="How Client Bureau business and trade ratings work."
        description="Client Bureau now uses role-specific rating models: one for contractor business reliability and one for subcontractor trade partner reliability. Both are public trust signals, not customer star reviews."
        primary={{ href: "/businesses", label: "Browse business profiles", icon: Building2 }}
        secondary={{ href: "/score-methodology", label: "Client rating methodology", icon: HelpCircle }}
        aside={
          <div className="space-y-4 text-white">
            <Star className="size-9 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Two roles. Two rating models.</p>
            <p className="text-sm leading-6 text-slate-300">
              Contractors and subcontractors work from different risk positions, so Client Bureau
              separates business reliability from trade partner reliability.
            </p>
          </div>
        }
      />

      <PremiumProofStrip
        items={[
          { label: "Range", value: "0-100", text: "Presented with a public letter grade." },
          { label: "Models", value: "2", text: "Separate contractor and subcontractor rating scales." },
          { label: "Process", value: "Evidence", text: "Contracts, reports, trade scope, and resolution posture matter." },
          { label: "Privacy", value: "Protected", text: "Private account data is not displayed publicly." },
        ]}
        dark
      />

      <section className="bureau-section">
        <div className="bureau-container space-y-8">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-3 p-5 md:grid-cols-5">
              {[
                ["A+", "92-100", "Strong verification and documentation confidence."],
                ["A", "82-91", "High readiness with meaningful approved activity."],
                ["B", "68-81", "Good profile with room for stronger documentation."],
                ["C", "50-67", "Basic or developing business profile."],
                ["Review Pending", "0-49", "Insufficient public-safe context."],
              ].map(([grade, range, text]) => (
                <div key={grade} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-slate-950">{grade}</span>
                    <span className="text-sm font-semibold text-slate-500">{range}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            {ratingModels.map((model) => (
              <Card key={model.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <Badge variant="outline" className="w-fit rounded-md bg-amber-50 text-amber-900">
                    {model.label}
                  </Badge>
                  <CardTitle className="text-2xl">{model.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-slate-600">{model.text}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {model.factors.map((item) => (
                      <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {factors.map((factor) => (
              <Card key={factor.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <Badge variant="outline" className="w-fit rounded-md bg-slate-50">
                    {factor.weight}
                  </Badge>
                  <CardTitle className="text-lg">{factor.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">{factor.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
                  What the rating is designed to show
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
                <p>
                  Client Bureau rating models are designed for business-owner protection and trust
                  presentation. Contractor profiles help service businesses show verified identity,
                  documented workflows, private evidence handling, moderated reports, and response
                  readiness. Subcontractor profiles help trade professionals show scope clarity,
                  documented GC/sub relationships, payment-chain context, and evidence readiness.
                </p>
                <p>
                  Neither rating is built as a public complaint score. They reward process quality:
                  verification, documentation, approved relationship history, resolution posture,
                  and profile completeness. As more verified and approved context becomes available,
                  rating confidence can move from Basic to Moderate or Strong.
                </p>
                <p>
                  Public pages should remain neutral and factual. A high rating does not mean every
                  future project will go well, and a lower rating may simply mean the business has
                  not finished verification or has limited approved public context.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader>
                <CardTitle>What the rating is not</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notA.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm leading-6 text-amber-950">
                    <CheckCircle2 className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Build your business profile"
        title="A stronger Client Bureau business record starts with verification and documentation."
        description="Claim your profile, complete verification, and keep your project records organized before you ask people to trust your business profile."
        primary={{ href: "/claim-profile", label: "Claim your profile", icon: Building2 }}
        secondary={{ href: "/businesses", label: "Browse profiles", icon: Star }}
      />
    </main>
  )
}
