import type { Metadata } from "next"
import { LockKeyhole, Radar, ReceiptText, ShieldCheck } from "lucide-react"

import { LoginForm } from "@/components/forms/auth-forms"
import { PremiumFeatureCard, TrustGuardrailStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSafeLoginReturnPath } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Client Bureau for client checks, documented reports, evidence records, contracts, recovery workflows, and account management.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
}

type LoginPageProps = {
  searchParams: Promise<Partial<Record<"error" | "loggedOut" | "next" | "reset", string>>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = getSafeLoginReturnPath(params.next)
  const message =
    params.error ??
    (params.reset ? "Password updated. Sign in with the new password to continue." : undefined) ??
    (params.loggedOut ? "You have been logged out. Sign in again to continue." : undefined)
  const messageVariant = params.error ? "destructive" : "default"

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-amber-200">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Secure account access
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Return to your business protection workspace.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Access saved searches, watched clients, submitted reports, contract packets, evidence records, recovery cases, lien-service workflows, and moderation status.
            </p>
          </div>
          <Card className="rounded-md border-white/10 bg-white/[0.06] text-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <ShieldCheck className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Return to the work you opened.</p>
              <p className="text-sm leading-6 text-slate-300">
                Sign in and continue with the dashboard, report form, client response, or admin workspace you were trying to reach.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <TrustGuardrailStrip
        items={[
          "Secure account workspace",
          "Private evidence stays private",
          "Admin areas stay role-protected",
          "Safe return after login",
        ]}
      />

      <div className="bureau-container grid gap-8 py-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <LockKeyhole className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Sign in to Client Bureau</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Access your dashboard, searches, reports, contracts, evidence records, service cases, and account settings.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo={redirectTo} message={message} variant={messageVariant} />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          <PremiumFeatureCard
            icon={Radar}
            title="Continue client checks"
            text="Pick up saved searches, watched clients, and report context from your dashboard."
          />
          <PremiumFeatureCard
            icon={ReceiptText}
            title="Track payment workflows"
            text="Review recovery cases, lien-service status, contracts, evidence, and recent activity."
          />
          <PremiumFeatureCard
            icon={ShieldCheck}
            title="Private records stay private"
            text="Raw identifiers, evidence files, staff-only review notes, and private service cases are not public profile content."
          />
        </div>
      </div>
    </section>
  )
}
