import type { Metadata } from "next"
import { LockKeyhole } from "lucide-react"

import { LoginForm } from "@/components/forms/auth-forms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to Client Bureau for contractor client search, documented reports, and account management.",
  robots: {
    index: false,
    follow: false,
  },
}

type LoginPageProps = {
  searchParams: Promise<Partial<Record<"error" | "loggedOut" | "next", string>>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const next = params.next
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : undefined
  const message =
    params.error ??
    (params.loggedOut ? "You have been logged out. Sign in again to continue." : undefined)
  const messageVariant = params.error ? "destructive" : "default"

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container flex justify-center">
        <Card className="w-full max-w-md rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <LockKeyhole className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Login to Client Bureau</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Access your contractor dashboard, saved searches, submitted reports, and review status.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo={redirectTo} message={message} variant={messageVariant} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
