import Link from "next/link"
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PublicTrustSummary, TrustTone } from "@/lib/trust-verification"

const toneClasses: Record<TrustTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  blue: "border-sky-200 bg-sky-50 text-sky-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  slate: "border-slate-200 bg-slate-50 text-slate-950",
}

const statusTone = {
  available: "border-amber-200 bg-amber-50 text-amber-950",
  complete: "border-emerald-200 bg-emerald-50 text-emerald-950",
  not_started: "border-slate-200 bg-slate-50 text-slate-600",
}

export function TrustVerificationPanel({
  profileName,
  summary,
}: {
  profileName: string
  summary: PublicTrustSummary
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="size-5 text-amber-700" aria-hidden="true" />
              Trust and verification
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Client Bureau separates verified public signals from private records. This page shows
              approved public context, moderation status, and evidence indicators without exposing
              raw files, contact details, or internal notes.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-2">
            {summary.verificationBadges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-md border p-4 ${toneClasses[badge.tone]}`}
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
                  <p className="font-semibold">{badge.label}</p>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-80">{badge.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-slate-950 text-white shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-300">Review confidence</p>
                <p className="mt-2 text-4xl font-semibold">{summary.confidence.level}</p>
              </div>
              <Badge className="rounded-md bg-amber-500 text-slate-950">
                {summary.confidence.score}/100
              </Badge>
            </div>
            <Progress value={summary.confidence.score} />
            <p className="text-sm leading-6 text-slate-300">{summary.confidence.summary}</p>
            <div className="grid gap-2">
              {summary.confidence.factors.map((factor) => (
                <div key={factor} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSearch className="size-5 text-amber-700" aria-hidden="true" />
              Evidence indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {summary.evidenceIndicators.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{item.label}</p>
                  <Badge variant="outline" className="rounded-md bg-white">
                    {item.count > 0 ? item.count : "Private"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="size-5 text-amber-700" aria-hidden="true" />
              Moderation transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {summary.moderationSteps.map((step, index) => (
              <div key={step.id} className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[32px_1fr_auto] sm:items-start">
                <span className="flex size-8 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-amber-300">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-950">{step.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
                <span className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusTone[step.status]}`}>
                  {step.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-amber-800" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-amber-950">Public response workflow</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-amber-950">
              {profileName} can receive a response, correction request, dispute, or resolution
              update. Approved context is shown publicly only after verification and moderation.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {summary.responseWorkflow.map((step) => (
                <div key={step.id} className="rounded-md border border-amber-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/client-response">
              <MessageSquareText aria-hidden="true" />
              Submit response
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
