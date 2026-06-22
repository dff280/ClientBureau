import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileSignature,
  ListChecks,
  ShieldCheck,
} from "lucide-react"

import { ContractSigningForm } from "@/components/contracts/contract-signing-form"
import { PremiumHero, PremiumProofStrip } from "@/components/marketing/premium-page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getContractShareByTokenService } from "@/lib/repositories/client-bureau-service"

type ContractSharePageProps = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: ContractSharePageProps): Promise<Metadata> {
  const { token } = await params
  const packet = await getContractShareByTokenService(token)

  return {
    title: packet ? `${packet.clientName} Agreement Review` : "Agreement Review",
    description: "Private Client Bureau agreement review and electronic signature workflow.",
    robots: {
      index: false,
      follow: false,
    },
  }
}

export const dynamic = "force-dynamic"

export default async function ContractSharePage({ params }: ContractSharePageProps) {
  const { token } = await params
  const packet = await getContractShareByTokenService(token)

  if (!packet) notFound()

  const signatureStatus = packet.signatureStatus?.replaceAll("_", " ") ?? "not sent"
  const inviteStatus = packet.clientInviteStatus?.replaceAll("_", " ") ?? "not invited"
  const paymentMode = packet.paymentMode?.replaceAll("_", " ") ?? "none"
  const milestones = packet.milestoneSchedule ?? []
  const signedDigestLabel = packet.signedDigest
    ? `${packet.signedDigest.slice(0, 18)}...${packet.signedDigest.slice(-8)}`
    : undefined
  const proofItems = [
    { label: "Agreement", value: packet.templateType.replaceAll("_", " "), text: packet.projectType },
    { label: "Value", value: formatCurrency(packet.packetValue), text: `${packet.milestoneCount} scheduled milestones` },
    { label: "Signature", value: signatureStatus, text: "Private electronic signature workflow." },
    { label: "Payment", value: paymentMode, text: "Terms only; Client Bureau does not hold funds here." },
  ]

  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Private agreement review"
        title={`Review and sign the agreement for ${packet.projectType}.`}
        description="This private link was prepared by the contractor for agreement review, electronic signature, and payment-timing coordination before work starts."
        primary={{ href: "/", label: "Client Bureau", icon: FileSignature }}
        aside={
          <div className="space-y-3 text-white">
            <ShieldCheck className="size-8 text-amber-300" aria-hidden="true" />
            <p className="text-xl font-semibold">Private workflow</p>
            <p className="text-sm leading-6 text-slate-300">
              This page is not a public client profile, report, payment demand notice, lien filing,
              or evidence repository.
            </p>
          </div>
        }
      />

      <PremiumProofStrip items={proofItems} dark />

      <div className="bureau-container pt-6">
        <div className="grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 md:grid-cols-3">
          <div>
            <p className="font-semibold">Review before signing</p>
            <p className="mt-1">Ask the contractor to correct scope, dates, payment terms, or legal names before you sign.</p>
          </div>
          <div>
            <p className="font-semibold">Private by token</p>
            <p className="mt-1">This agreement page is noindexed and separate from public Client Bureau profiles.</p>
          </div>
          <div>
            <p className="font-semibold">No payment processing here</p>
            <p className="mt-1">Payment terms are documented, but Client Bureau does not hold or enforce funds from this page.</p>
          </div>
        </div>
      </div>

      <div className="bureau-container grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Agreement summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Fact label="Client" value={packet.clientName} />
              <Fact label="Client legal name" value={packet.clientLegalName ?? packet.clientName} />
              <Fact label="Contractor legal name" value={packet.contractorLegalName ?? "Contractor record"} />
              <Fact label="Project" value={packet.projectType} />
              <Fact label="Agreement type" value={packet.templateType.replaceAll("_", " ")} />
              <Fact label="Contract value" value={formatCurrency(packet.packetValue)} />
              <Fact label="Deposit" value={formatCurrency(packet.depositRequired)} />
              <Fact label="Milestones" value={`${packet.milestoneCount} scheduled`} />
              <Fact
                label="Project dates"
                value={[formatDate(packet.projectStartDate), formatDate(packet.projectEndDate)].filter(Boolean).join(" - ") || "To be confirmed"}
              />
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Scope of work</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5">
              <AgreementBlock label="Scope summary" text={packet.scopeSummary} />
              <div className="grid gap-4 md:grid-cols-2">
                <AgreementBlock label="Included work" text={packet.includedWork} />
                <AgreementBlock label="Excluded work" text={packet.excludedWork} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Payment terms and milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <AgreementBlock label="Payment terms" text={packet.paymentTerms} />
              {milestones.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-slate-200">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-[1fr_120px_150px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      <span>Milestone</span>
                      <span>Amount</span>
                      <span>Due</span>
                    </div>
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="grid grid-cols-[1fr_120px_150px] border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                        <span className="font-semibold text-slate-950">{milestone.label}</span>
                        <span>{formatCurrency(milestone.amount)}</span>
                        <span>{milestone.due ?? "To be confirmed"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  No milestone schedule is attached to this agreement packet.
                </p>
              )}
              <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                Payment terms are documented for the contractor and client. Client Bureau does not process, hold,
                collect, or enforce funds from this signing page.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Change-order and cancellation terms</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <AgreementBlock label="Change-order policy" text={packet.changeOrderPolicy} />
              <AgreementBlock label="Cancellation policy" text={packet.cancellationPolicy} />
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Workflow status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-md capitalize">Contract {packet.status.replaceAll("_", " ")}</Badge>
                <Badge variant="outline" className="rounded-md capitalize">Signature {signatureStatus}</Badge>
                <Badge variant="outline" className="rounded-md capitalize">Invite {inviteStatus}</Badge>
                {packet.signedRecordAt ? (
                  <Badge variant="outline" className="rounded-md">
                    Signed {formatDate(packet.signedRecordAt)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-slate-600">{packet.nextAction}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-slate-950">Electronic signature</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Type your signature and complete the authorization checks to record the review.
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <CreditCard className="size-5 text-amber-700" aria-hidden="true" />
                  <p className="mt-3 font-semibold text-slate-950">Payment coordination</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Mode: {paymentMode}. {packet.paymentSummary ?? "No active payment request is attached to this link."}
                  </p>
                </div>
              </div>
              {signedDigestLabel ? (
                <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  Signed private record digest: <span className="font-semibold text-slate-700">{signedDigestLabel}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-5">
              <BadgeCheck className="size-6 text-amber-700" aria-hidden="true" />
              <h2 className="font-semibold text-slate-950">Before signing</h2>
              <p className="text-sm leading-6 text-slate-600">
                Review the full agreement from the contractor, confirm the scope and payment timing,
                and ask for corrections before signing. Client Bureau records the workflow state; it
                does not provide legal advice or automatically process funds from this page.
              </p>
              <div className="grid gap-2 pt-2">
                {[
                  "Confirm legal names and project details are correct.",
                  "Review included and excluded work before work begins.",
                  "Confirm deposit, milestones, due dates, and payment timing.",
                  "Ask the contractor for corrections before signing if anything is unclear.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <ListChecks className="mt-0.5 size-4 text-amber-700" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-md border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Review, certify, sign</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Use the same legal name and email you want associated with this private agreement review.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <CalendarDays className="size-4 text-amber-700" aria-hidden="true" />
              This private signing packet is noindexed and available only by token.
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5">
            <SigningReadinessChecklist />
            <ContractSigningForm shareToken={token} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold capitalize text-slate-950">{value}</p>
    </div>
  )
}

function AgreementBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
        {text?.trim() ? text : "No detail was attached to this section. Ask the contractor to complete it before signing."}
      </p>
    </div>
  )
}

function SigningReadinessChecklist() {
  const items = [
    "Scope and exclusions match the job.",
    "Deposit, milestones, and due dates are clear.",
    "Change-order and cancellation terms are understood.",
    "You are authorized to sign electronically.",
  ]

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">Before you sign</p>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex gap-2 text-xs leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return ""
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
