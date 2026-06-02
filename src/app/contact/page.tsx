import type { Metadata } from "next"
import Link from "next/link"
import { Building2, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicContactInfo } from "@/lib/env"

export const metadata: Metadata = {
  title: "Contact Client Bureau",
  description:
    "Contact Client Bureau for contractor accounts, enterprise inquiries, client response questions, and moderation support.",
  alternates: {
    canonical: "/contact",
  },
}

export default function ContactPage() {
  const contact = getPublicContactInfo()
  const hasAddress = contact.street && contact.city && contact.state

  return (
    <section className="bureau-section bg-slate-100">
      <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-amber-700">Contact</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              Reach Client Bureau.
            </h1>
            <p className="max-w-3xl leading-7 text-slate-600">
              Use the right path for account questions, enterprise review, response or correction
              requests, and moderation support. Client Bureau does not publish private client or
              contractor identifiers through contact channels.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                title: "Contractor accounts",
                text: "Create an account, search clients, submit documented reports, and track moderation status.",
                href: "/signup",
                cta: "Create account",
              },
              {
                title: "Client response",
                text: "Submit a response, correction request, dispute, or resolution update for moderated review.",
                href: "/client-response",
                cta: "Submit response",
              },
              {
                title: "Enterprise",
                text: "Talk with Client Bureau about teams, regional contractor networks, review workflows, and audit needs.",
                href: "/enterprise",
                cta: "View enterprise",
              },
              {
                title: "Policies",
                text: "Review report standards, dispute policy, content moderation, privacy, and terms.",
                href: "/moderation-policy",
                cta: "View policies",
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                  <Button asChild variant="outline">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Building2 className="size-8 text-slate-950" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-slate-950">Business contact</h2>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {contact.phone ? (
                  <p className="flex gap-2">
                    <Phone className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                    <span>{contact.phone}</span>
                  </p>
                ) : null}
                {hasAddress ? (
                  <address className="flex gap-2 not-italic">
                    <MapPin className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                    <span>
                      {contact.street}
                      <br />
                      {contact.city}, {contact.state} {contact.zip}
                    </span>
                  </address>
                ) : (
                  <p className="flex gap-2">
                    <ShieldCheck className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                    <span>
                      Verified public phone and mailing address appear here when configured in
                      production.
                    </span>
                  </p>
                )}
                <p className="flex gap-2">
                  <Mail className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                  <span>Use the response and account workflows above for moderated requests.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
