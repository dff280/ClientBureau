import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

import { SignupForm } from "@/components/forms/auth-forms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Signup",
  description: "Create a Client Bureau account for contractors and service businesses to check clients, document jobs, and submit client reports.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupPage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container flex justify-center">
        <Card className="w-full max-w-2xl rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <ShieldCheck className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Create business account</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Create a contractor or service-business profile so you can check clients, submit
              documented reports, upload evidence, and track moderation status.
            </p>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
