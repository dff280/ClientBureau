import type { Metadata } from "next"
import Link from "next/link"
import { Building2, CheckCircle2, HelpCircle, ShieldCheck, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteUrl } from "@/lib/env"

export const metadata: Metadata = {
  title: "Business Rating Methodology",
  description:
    "Learn how Client Bureau Business Rating summarizes verification, documentation, public contribution history, resolution posture, and account completeness.",
  alternates: {
    canonical: `${getSiteUrl()}/business-rating-methodology`,
  },
}

const factors = [
  {
    title: "Business verification",
    weight: "30%",
    text: "Verification status is the largest factor. Verified businesses receive the strongest signal, pending businesses receive partial credit, and basic profiles remain review pending until the account has more trusted context.",
  },
  {
    title: "Documentation discipline",
    weight: "25%",
    text: "Client Bureau rewards consistent private documentation, such as invoices, contracts, screenshots, photos, PDFs, and evidence summaries connected to reports or business workflows.",
  },
  {
    title: "Approved contribution history",
    weight: "20%",
    text: "The rating considers admin-approved contribution activity, including documented client reports and positive client experiences submitted through moderation.",
  },
  {
    title: "Resolution posture",
    weight: "15%",
    text: "Open dispute context and moderation outcomes affect the rating. The goal is to reward careful documentation and neutral, response-aware record handling.",
  },
  {
    title: "Account completeness",
    weight: "10%",
    text: "Complete platform setup, active plan status, and business profile readiness help increase confidence that the profile reflects a real operating business.",
  },
]

const notA = [
  "It is not a customer review score.",
  "It is not a guarantee of workmanship, payment collection, project outcome, or legal eligibility.",
  "It is not a credit score, background check, licensing board result, or insurance verification service.",
  "It does not expose private emails, phone numbers, street addresses, uploaded evidence files, or internal moderation notes.",
]

export default function BusinessRatingMethodologyPage() {
  return (
    <main className="bg-slate-100">
      <section className="border-b border-slate-200 bg-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="space-y-5">
            <Badge className="rounded-md bg-amber-500 text-slate-950">
              <Star className="size-3" aria-hidden="true" />
              Rating methodology
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                How Client Bureau Business Rating works.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Business Rating is a public trust signal for contractors and service businesses.
                It summarizes verification, documentation habits, approved contribution history,
                resolution posture, and account completeness in a simple letter grade and 0-100
                score.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/businesses">
                  <Building2 aria-hidden="true" />
                  Browse business profiles
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/score-methodology">
                  <HelpCircle aria-hidden="true" />
                  Client rating methodology
                </Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-slate-200 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase text-slate-500">Rating bands</p>
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
        </div>
      </section>

      <section className="bureau-section">
        <div className="bureau-container space-y-8">
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
                  Client Bureau Business Rating is designed for business-owner protection and trust
                  presentation. It helps contractors show that they use documented workflows,
                  keep evidence private, submit reports through moderation, and maintain a more
                  complete business profile.
                </p>
                <p>
                  The rating is intentionally not built as a public complaint score. It rewards
                  process quality: verification, documentation, approved contribution history,
                  resolution posture, and profile completeness. As more verified and approved
                  context becomes available, rating confidence can move from Basic to Moderate or
                  Strong.
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
    </main>
  )
}
