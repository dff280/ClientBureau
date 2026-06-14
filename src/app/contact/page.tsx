import type { Metadata } from "next"
import Link from "next/link"
import { Building2, Mail, MapPin, MessageSquareText, Phone, ShieldCheck, Users } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
} from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicContactInfo } from "@/lib/env"
import { pageAssets } from "@/lib/page-assets"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Client Bureau for contractor accounts, enterprise inquiries, client responses, correction requests, moderation questions, and support.",
  alternates: {
    canonical: "/contact",
  },
}

const contactPaths = [
  {
    icon: Users,
    title: "Contractor and business accounts",
    text: "Create an account, check clients, submit documented experiences, manage contracts, and track moderation status.",
    href: "/signup",
    cta: "Create account",
  },
  {
    icon: MessageSquareText,
    title: "Client response or correction",
    text: "Submit a response, dispute, correction request, or resolution update for moderated review.",
    href: "/client-response",
    cta: "Submit response",
  },
  {
    icon: Building2,
    title: "Enterprise and teams",
    text: "Talk with Client Bureau about teams, regional groups, franchise networks, audit visibility, and onboarding.",
    href: "/enterprise",
    cta: "View enterprise",
  },
  {
    icon: ShieldCheck,
    title: "Policies and moderation",
    text: "Review report standards, dispute policy, moderation policy, privacy, and terms before submitting records.",
    href: "/moderation-policy",
    cta: "View policies",
  },
]

const proof = [
  { label: "Account support", value: "Guided", text: "Use the right workflow instead of sending private identifiers through open channels." },
  { label: "Client response", value: "Moderated", text: "Responses, disputes, and corrections go through review before public display." },
  { label: "Enterprise", value: "Scoped", text: "Teams can request plan, workflow, and onboarding review." },
  { label: "Privacy", value: "Protected", text: "Raw evidence and private contact details stay out of public pages." },
]

const adminOpsAsset = pageAssets.adminOpsCrm

export default function ContactPage() {
  const contact = getPublicContactInfo()
  const hasAddress = contact.street && contact.city && contact.state

  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="Contact Client Bureau"
        title="Get to the right Client Bureau workflow without exposing private information."
        description="Use the correct path for account help, enterprise review, client response or correction requests, moderation questions, and business support."
        primary={{ href: "/signup", label: "Create account", icon: Users }}
        secondary={{ href: "/client-response", label: "Submit client response", icon: MessageSquareText }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Support routing"
            title="Privacy-first workflows."
            description="Guided paths keep report, response, moderation, and account records organized without exposing private identifiers."
            imageSrc={adminOpsAsset.src}
            imageAlt={adminOpsAsset.alt}
            points={["Account support", "Moderated responses", "Private-data safeguards"]}
          />
        }
      />

      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <PremiumSectionHeader
              eyebrow="Choose the right path"
              title="Most questions are handled fastest through the right workflow."
              description="That keeps records organized, protects private data, and gives the moderation team the context they need."
            />

            <div className="grid gap-5 md:grid-cols-2">
              {contactPaths.map((item) => (
                <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text}>
                  <Button asChild variant="outline" className="mt-4 w-fit">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                </PremiumFeatureCard>
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
                        Verified public phone and mailing address appear here when configured in production.
                      </span>
                    </p>
                  )}
                  <p className="flex gap-2">
                    <Mail className="mt-1 size-4 text-amber-700" aria-hidden="true" />
                    <span>Use the guided workflows above for moderated requests and account records.</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-xl font-semibold text-slate-950">Before sending information</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Do not send raw evidence, private client contact details, or sensitive documents
                  through general contact paths. Use the dashboard, response form, or moderation workflow instead.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Need to take action?"
        title="Start with the workflow that matches what you need to do next."
        description="Search a client, submit a documented experience, respond to a profile, or ask about enterprise setup."
        primary={{ href: "/search", label: "Check a Client", icon: ShieldCheck }}
        secondary={{ href: "/contact", label: "Contact options", icon: MessageSquareText }}
      />
    </main>
  )
}
