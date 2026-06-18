import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, Building2, FileSearch, Scale, ShieldCheck, Users } from "lucide-react"

import {
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  ProductMockupFrame,
  PublicJourneyNav,
} from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { pageAssets } from "@/lib/page-assets"

export const metadata: Metadata = {
  title: "About",
  description:
    "Client Bureau helps contractors and service businesses check clients, document projects, protect payment, and handle response-aware reports.",
  alternates: {
    canonical: "/about",
  },
}

const principles = [
  {
    icon: FileSearch,
    title: "Check before the job",
    text: "Client Bureau helps business owners review moderated client context before committing labor, materials, scheduling, or deposits.",
  },
  {
    icon: Building2,
    title: "Built for service businesses",
    text: "The platform supports contractors, trades, home-service companies, specialty crews, and local business owners who work directly with customers.",
  },
  {
    icon: Scale,
    title: "Moderated and fair",
    text: "Public records are framed as contractor-submitted reported experiences with admin review, response paths, and dispute context.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    text: "Raw evidence, private contact identifiers, addresses, staff-only review notes, pending content, and rejected submissions stay out of public profiles.",
  },
]

const proof = [
  { label: "Audience", value: "Business owners", text: "Contractors and service companies checking clients before the job." },
  { label: "Public records", value: "Moderated", text: "Approved summaries, response context, and evidence-on-file signals." },
  { label: "Private tools", value: "Protected", text: "Contracts, recovery, lien service, and evidence vault stay private." },
  { label: "Posture", value: "Fair", text: "Clients can respond, dispute, correct, or share resolution updates." },
]

const standards = [
  "Public profiles use cautious, factual, reported-experience language.",
  "Client Bureau does not publish raw phone numbers, emails, street addresses, or private evidence files.",
  "Positive reports, resolved cases, and client responses are part of the trust record.",
  "Administrative review separates private workflow records from public profile summaries.",
]

const platformAsset = pageAssets.platformHero

export default function AboutPage() {
  return (
    <main className="bg-slate-100">
      <PremiumHero
        eyebrow="About Client Bureau"
        title="The business protection platform contractors have needed for years."
        description="Client Bureau helps contractors and service business owners check clients, document projects, organize contracts and evidence, and protect payment before a job becomes a costly lesson."
        primary={{ href: "/search", label: "Check a Client", icon: FileSearch }}
        secondary={{ href: "/how-it-works", label: "How it works", icon: BadgeCheck }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Trust platform"
            title="Documentation, moderation, and fair context."
            description="A moderated record system built around documented business experiences, private matching, evidence-on-file summaries, and response rights."
            imageSrc={platformAsset.src}
            imageAlt={platformAsset.alt}
            points={platformAsset.points}
          />
        }
      />

      <PremiumProofStrip items={proof} dark />
      <PublicJourneyNav
        active="help"
        eyebrow="What to do next"
        title="Client Bureau is easiest to understand by action."
        description="Check a client, protect a job, browse approved records, or get help with policy and workflow questions."
      />

      <section className="bureau-section">
        <div className="bureau-container space-y-10">
          <PremiumSectionHeader
            eyebrow="The mission"
            title="Give service businesses the same kind of pre-job visibility customers have had for years."
            description="Customers can check reviews before hiring a contractor. Contractors should also be able to check documented client experiences before accepting work, extending trust, or putting crews and materials on the line."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((principle) => (
              <PremiumFeatureCard
                key={principle.title}
                icon={principle.icon}
                title={principle.title}
                text={principle.text}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <Users className="size-8 text-amber-700" aria-hidden="true" />
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                  Who Client Bureau is for
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Client Bureau is for contractors, service businesses, trades, project-based
                  companies, and small business owners who need to decide whether a client,
                  homeowner, customer, property owner, or business lead is a good fit.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                  {["General contractors", "Roofers", "Remodelers", "Landscapers", "Specialty trades", "Home services"].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                  What Client Bureau publishes
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Public profiles show non-sensitive identity fields, Client Bureau score context,
                  approved report summaries, evidence-on-file indicators, moderation status, and
                  response or dispute context. Private operational records stay private.
                </p>
                <ul className="grid gap-3">
                  {standards.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                      <ShieldCheck className="mt-1 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-5 p-6 lg:grid-cols-[1fr_300px] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Product doctrine</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                  Check before the job. Document during the job. Protect payment after the job.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Client Bureau connects client checks, report documentation, contract packets,
                  evidence records, payment recovery workflows, Florida lien service, and moderated
                  public profiles into one business-owner protection system.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href="/search">Check a Client</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">View plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Ready to use Client Bureau?"
        title="One search could prevent the wrong job from consuming your week, your crew, and your cash flow."
        description="Start with a client check, then use reports, contracts, evidence, and recovery tools when the job needs more protection."
        primary={{ href: "/search", label: "Check a Client", icon: FileSearch }}
        secondary={{ href: "/signup", label: "Create account", icon: Building2 }}
      />
    </main>
  )
}
