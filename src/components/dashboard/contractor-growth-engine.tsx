"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Gift,
  Link2,
  MailPlus,
  Network,
  Plus,
  Share2,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  DashboardSection,
  EmptyState,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  networkGrowthScore,
  profileClaimCompletion,
  rankReviewRequests,
  referralCreditSummary,
  type GrowthEngineData,
  type ReferralInvite,
  type ReviewRequest,
} from "@/lib/growth-engine"

export function ContractorGrowthEngine({ data }: { data: GrowthEngineData }) {
  const [invites, setInvites] = useState(data.invites)
  const [reviewRequests, setReviewRequests] = useState(data.reviewRequests)
  const [copied, setCopied] = useState("")
  const creditSummary = useMemo(
    () => referralCreditSummary(invites, data.creditLedger),
    [data.creditLedger, invites],
  )
  const claimCompletion = profileClaimCompletion(data.claimWorkflow)
  const completedReviewRequests = reviewRequests.filter((request) => request.status === "completed").length
  const growthScore = networkGrowthScore({
    claimCompletion,
    completedInvites: creditSummary.completedInvites,
    completedReviewRequests,
    publicProfileViews: 184,
  })
  const rankedRequests = rankReviewRequests(reviewRequests)

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(""), 2200)
    } catch {
      setCopied("")
    }
  }

  function addInvite(formData: FormData) {
    const recipientEmail = String(formData.get("recipientEmail") ?? "").trim()
    const businessName = String(formData.get("businessName") ?? "").trim()
    const trade = String(formData.get("trade") ?? "").trim()

    if (!recipientEmail || !businessName) return

    const nextInvite: ReferralInvite = {
      id: `invite_${Date.now()}`,
      contractorId: data.claimWorkflow.contractorId,
      recipientName: businessName,
      recipientEmail,
      businessName,
      trade: trade || "Contractor",
      status: "sent",
      creditCents: 2500,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    }

    setInvites((current) => [nextInvite, ...current])
    setCopied("Invite queued")
  }

  function addReviewRequest(formData: FormData) {
    const clientName = String(formData.get("clientName") ?? "").trim()
    const projectType = String(formData.get("projectType") ?? "").trim()

    if (!clientName || !projectType) return

    const requestUrl = `${window.location.origin}/submit-report?client=${encodeURIComponent(clientName)}&intent=positive`
    const nextRequest: ReviewRequest = {
      id: `request_${Date.now()}`,
      contractorId: data.claimWorkflow.contractorId,
      clientName,
      projectType,
      requestType: "positive_reference",
      status: "draft",
      requestUrl,
      dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    }

    setReviewRequests((current) => [nextRequest, ...current])
    setCopied("Reference request drafted")
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gift}
          label="Available credits"
          value={formatCurrency(creditSummary.availableCents)}
          helper="Eligible platform credits"
          tone="emerald"
        />
        <StatCard
          icon={UsersRound}
          label="Invited contractors"
          value={invites.length}
          helper={`${creditSummary.completedInvites} joined or credited`}
          tone="blue"
        />
        <StatCard
          icon={BadgeCheck}
          label="Profile claim"
          value={`${claimCompletion}%`}
          helper={data.claimWorkflow.claimStatus.replaceAll("_", " ")}
          tone={claimCompletion >= 80 ? "emerald" : "amber"}
        />
        <StatCard
          icon={Network}
          label="Network score"
          value={growthScore}
          helper="Referral, profile, request, and traffic loop health"
        />
      </div>

      <DashboardSection
        eyebrow="Invite loop"
        title="Invite contractors and earn platform credits"
        description="Invite contractors you trust. When they create a verified Client Bureau account, referral credits can be applied to eligible plans and services."
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase text-amber-300">Your referral link</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm">
                  <span className="block truncate">{data.referralUrl}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => copyText("Referral link copied", data.referralUrl)}
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  <Copy aria-hidden="true" />
                  Copy link
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-300">
                Referral code: <span className="font-semibold text-white">{data.referralCode}</span>
              </p>
            </div>

            <div className="grid gap-3">
              {invites.map((invite) => (
                <div key={invite.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-950">{invite.businessName}</p>
                      <p className="mt-1 text-sm text-slate-600">{invite.trade} / {maskEmail(invite.recipientEmail)}</p>
                    </div>
                    <StatusBadge tone={invite.status === "credited" || invite.status === "joined" ? "emerald" : invite.status === "sent" ? "amber" : "slate"}>
                      {invite.status}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span>Credit: {formatCurrency(invite.creditCents)}</span>
                    <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <form action={addInvite} className="grid gap-3">
                <div>
                  <p className="font-semibold text-slate-950">Send contractor invite</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Keep the network useful by inviting legitimate contractors and service businesses.
                  </p>
                </div>
                <Input name="businessName" placeholder="Business name" required />
                <Input name="recipientEmail" type="email" placeholder="Email address" required />
                <Input name="trade" placeholder="Trade or service type" />
                <Button type="submit" className="bg-slate-950 text-white hover:bg-slate-800">
                  <MailPlus aria-hidden="true" />
                  Queue invite
                </Button>
                {copied ? <p className="text-xs font-semibold text-emerald-700">{copied}</p> : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <DashboardSection
          eyebrow="Claim loop"
          title="Claim and strengthen your business profile"
          description="A claimed profile gives contractors, clients, and referral partners a cleaner way to verify your business."
        >
          <div className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Claim progress</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{claimCompletion}%</p>
                </div>
                <Button asChild variant="outline">
                  <Link href={data.claimWorkflow.publicProfileHref}>
                    Open public profile
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <Progress value={claimCompletion} className="mt-4" />
            </div>

            <div className="grid gap-3">
              {data.claimWorkflow.steps.map((step) => (
                <div key={step.id} className="flex gap-3 rounded-md border border-slate-200 bg-white p-4">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
                    {step.complete ? <CheckCircle2 className="size-4 text-amber-300" aria-hidden="true" /> : <Sparkles className="size-4 text-amber-300" aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{step.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection
          eyebrow="Share loop"
          title="Profile badge and referral trust"
          description="Use branded profile links to help people verify your business profile without keyword-stuffed link tactics."
        >
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <Share2 className="size-5 text-amber-300" aria-hidden="true" />
                <p className="font-semibold">Client Bureau profile badge</p>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-black/30 p-3 text-xs leading-5 text-slate-200">
                <code>{data.badgeEmbed}</code>
              </pre>
              <Button
                type="button"
                onClick={() => copyText("Badge embed copied", data.badgeEmbed)}
                className="mt-4 bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                <Copy aria-hidden="true" />
                Copy badge code
              </Button>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Use branded anchor text only. This is for trust verification and profile claiming, not a backlink scheme.
            </p>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        eyebrow="Reference request loop"
        title="Ask for positive references and resolution updates"
        description="Send clear request links after completed jobs. Positive, resolved, and supporting-context submissions still go through moderation before public display."
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          {rankedRequests.length ? (
            <div className="grid gap-3">
              {rankedRequests.map((request) => (
                <div key={request.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-950">{request.clientName}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{request.projectType} / {request.requestType.replaceAll("_", " ")}</p>
                    </div>
                    <StatusBadge tone={request.status === "completed" ? "emerald" : request.status === "opened" ? "blue" : "amber"}>
                      {request.status}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyText("Request link copied", request.requestUrl)}
                    >
                      <Link2 aria-hidden="true" />
                      Copy request link
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href={request.requestUrl}>
                        Open request
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No reference requests yet"
              description="Create a request after a completed job, resolution, or would-work-with-again experience."
            />
          )}

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <form action={addReviewRequest} className="grid gap-3">
                <div>
                  <p className="font-semibold text-slate-950">Create reference request</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Draft a request link you can send after a job wraps or a payment issue is resolved.
                  </p>
                </div>
                <Input name="clientName" placeholder="Client name" required />
                <Input name="projectType" placeholder="Project type" required />
                <Button type="submit" className="bg-slate-950 text-white hover:bg-slate-800">
                  <Plus aria-hidden="true" />
                  Draft request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Network effects"
        title="How the loop compounds"
        description="The growth engine is designed to make Client Bureau more valuable every time legitimate contractors participate."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {data.networkLoops.map((loop) => (
            <Card key={loop.title} className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <Badge className="rounded-md bg-slate-950 text-white">{loop.metric}</Badge>
                <h3 className="mt-4 font-semibold text-slate-950">{loop.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{loop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardSection>
    </div>
  )
}

function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@")
  const maskedName = name.length <= 2 ? `${name.slice(0, 1)}***` : `${name.slice(0, 2)}***`

  return `${maskedName}@${domain}`
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
