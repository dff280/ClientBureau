import type { Metadata } from "next"
import { Building2, LockKeyhole, Radar, ShieldCheck } from "lucide-react"

import { SignupForm } from "@/components/forms/auth-forms"
import { PremiumFeatureCard, TrustGuardrailStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSafePostSignupReturnPath } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Client Bureau account for client checks, reports, contracts, evidence records, payment recovery, and client response workflows.",
  alternates: {
    canonical: "/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
}

type SignupPageProps = {
  searchParams: Promise<Partial<Record<"next", string>>>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const redirectTo = getSafePostSignupReturnPath(params.next)

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-amber-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Business protection account
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Create the account that helps protect your next job.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Set up your Client Bureau workspace for client checks, report submissions, contract packets,
              evidence records, payment recovery, Florida lien service workflows, or client response access.
            </p>
          </div>
          <Card className="rounded-md border-white/10 bg-white/[0.06] text-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <LockKeyhole className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Clean setup makes better records.</p>
              <p className="text-sm leading-6 text-slate-300">
                Business type, state, service area, account role, and goals help keep searches, reports, and directories easy to trust.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <TrustGuardrailStrip
        items={[
          "State and trade fields stay structured",
          "Private identifiers stay private",
          "Use client response access when appropriate",
          "Upgrade when daily workflows need it",
        ]}
      />

      <div className="bureau-container grid gap-8 py-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3 border-b border-slate-200 bg-white">
            <ShieldCheck className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Create your Client Bureau account</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Choose contractor/service-business access or client response access. Each path stays organized under the right workflow.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <SignupForm redirectTo={redirectTo} />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <PremiumFeatureCard
            icon={Radar}
            title="Check before scheduling"
            text="Check client records before committing labor, materials, deposits, or crew time."
          />
          <PremiumFeatureCard
            icon={Building2}
            title="Organize business details"
            text="State dropdowns, business type, trade, and service area fields keep your records consistent."
          />
          <PremiumFeatureCard
            icon={LockKeyhole}
            title="Private by default"
            text="Phone, email, business verification, and evidence context are not displayed publicly."
          />
        </aside>
      </div>
    </section>
  )
}
