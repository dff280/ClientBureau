import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"

import { SignupForm } from "@/components/forms/auth-forms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Signup",
  description: "Create a Client Bureau account to check client ratings, submit documented client experiences, or respond to a public profile.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupPage() {
  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container flex justify-center">
        <Card className="w-full max-w-4xl rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3">
            <ShieldCheck className="size-8 text-slate-950" aria-hidden="true" />
            <CardTitle className="text-2xl">Create your Client Bureau account</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Choose whether you are a contractor or service business checking clients, or a
              client, homeowner, or customer responding to a report. We keep each workflow organized
              under the right account type.
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
