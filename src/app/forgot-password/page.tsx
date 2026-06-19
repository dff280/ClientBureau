import type { Metadata } from "next"
import { KeyRound, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react"

import { PasswordResetRequestForm } from "@/components/forms/auth-forms"
import { PremiumFeatureCard, TrustGuardrailStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a secure Client Bureau password reset link for your contractor, subcontractor, client, or admin account.",
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: true,
  },
}

type ForgotPasswordPageProps = {
  searchParams: Promise<Partial<Record<"sent" | "error", string>>>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams
  const sent = params.sent === "1"
  const message = params.error
    ? params.error
    : sent
      ? "If the email matches an account that can receive mail, a reset link has been sent."
      : undefined

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-amber-200">
              <KeyRound className="size-4" aria-hidden="true" />
              Account recovery
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Reset your Client Bureau password.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Enter the email connected to your account. If it can receive Client Bureau mail, you will get a secure reset link.
            </p>
          </div>
          <Card className="rounded-md border-white/10 bg-white/[0.06] text-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <MailCheck className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Your public records do not change.</p>
              <p className="text-sm leading-6 text-slate-300">
                Password recovery only restores account access. Reports, claims, profiles, and private evidence remain under normal moderation controls.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <TrustGuardrailStrip
        items={[
          "No account lookup is displayed",
          "Reset links use secure email flow",
          "Private records stay protected",
          "Admin access remains role-protected",
        ]}
      />

      <div className="bureau-container grid gap-8 py-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
        <Card className="rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <LockKeyhole className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Request reset link</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Use the same email you use to sign in. For safety, Client Bureau does not reveal whether an email is registered.
            </p>
          </CardHeader>
          <CardContent>
            <PasswordResetRequestForm sent={sent} message={message} />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          <PremiumFeatureCard
            icon={ShieldCheck}
            title="Same protected workspace"
            text="Dashboard tools, reports, contract packets, recovery cases, and evidence records remain private."
          />
          <PremiumFeatureCard
            icon={MailCheck}
            title="Check your inbox"
            text="Use the latest reset email. Older reset links may expire after a new request."
          />
          <PremiumFeatureCard
            icon={KeyRound}
            title="Use a strong password"
            text="Choose a password unique to Client Bureau, especially for admin or shared business accounts."
          />
        </div>
      </div>
    </section>
  )
}
