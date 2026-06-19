import type { Metadata } from "next"
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react"

import { PasswordUpdateForm } from "@/components/forms/auth-forms"
import { TrustGuardrailStrip } from "@/components/marketing/premium-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Choose New Password",
  description: "Choose a new Client Bureau password after opening a secure reset link, then sign in again to continue your account workflow.",
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: true,
  },
}

type ResetPasswordPageProps = {
  searchParams: Promise<Partial<Record<"error", string>>>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams

  return (
    <section className="bg-slate-100">
      <div className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-amber-200">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Secure password update
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Choose a new password.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300">
              Use this page after opening the reset link sent to your email. If the link expired, request a new one.
            </p>
          </div>
          <Card className="rounded-md border-white/10 bg-white/[0.06] text-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <ShieldCheck className="size-8 text-amber-300" aria-hidden="true" />
              <p className="text-xl font-semibold">Account access changes only.</p>
              <p className="text-sm leading-6 text-slate-300">
                Changing a password does not publish profile data, change account capabilities, or affect moderation decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <TrustGuardrailStrip
        items={[
          "Use the newest reset link",
          "Minimum 8 characters",
          "Private records remain private",
          "Admin access stays isolated",
        ]}
      />

      <div className="bureau-container py-10">
        <Card className="mx-auto max-w-lg rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <KeyRound className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Set new password</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Enter and confirm the new password. After it is saved, sign in again with the new password.
            </p>
          </CardHeader>
          <CardContent>
            <PasswordUpdateForm message={params.error} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
