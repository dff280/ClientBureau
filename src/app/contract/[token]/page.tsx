import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BadgeCheck, CheckCircle2, CreditCard, FileSignature, ShieldCheck } from "lucide-react"

import { ContractSigningForm } from "@/components/contracts/contract-signing-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container py-10">
          <Button asChild variant="outline" className="mb-6 border-white/20 bg-white/10 text-white hover:bg-white/15">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Client Bureau
            </Link>
          </Button>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-200">
                <FileSignature className="size-4" aria-hidden="true" />
                Private agreement review
              </div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                Review and sign the agreement for {packet.projectType}.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                This private link was prepared by the contractor for agreement review, electronic
                signature, and payment-timing coordination before work starts.
              </p>
            </div>
            <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-sm">
              <CardContent className="space-y-3 p-5">
                <ShieldCheck className="size-7 text-amber-300" aria-hidden="true" />
                <p className="font-semibold">Private workflow</p>
                <p className="text-sm leading-6 text-slate-300">
                  This page is not a public client profile, report, collection notice, lien filing,
                  or evidence repository.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="bureau-container grid gap-6 py-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Agreement summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Fact label="Client" value={packet.clientName} />
              <Fact label="Project" value={packet.projectType} />
              <Fact label="Agreement type" value={packet.templateType.replaceAll("_", " ")} />
              <Fact label="Contract value" value={formatCurrency(packet.packetValue)} />
              <Fact label="Deposit" value={formatCurrency(packet.depositRequired)} />
              <Fact label="Milestones" value={`${packet.milestoneCount} scheduled`} />
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
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Sign agreement</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Use the same name and email you want associated with this private contract review.
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <ContractSigningForm shareToken={token} />
          </CardContent>
        </Card>
      </div>
    </section>
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
