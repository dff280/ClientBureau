import type { Metadata } from "next"
import { LockKeyhole } from "lucide-react"

import { LoginForm } from "@/components/forms/auth-forms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to Client Bureau contractor search, reporting, dashboard, and admin tools.",
  robots: {
    index: false,
    follow: false,
  },
}

type LoginPageProps = {
  searchParams: Promise<Partial<Record<"next", string>>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const next = (await searchParams).next
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : undefined

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container flex justify-center">
        <Card className="w-full max-w-md rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <LockKeyhole className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Login to Client Bureau</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Mock form now. Supabase Auth should connect here with cookie-based server sessions.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo={redirectTo} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
