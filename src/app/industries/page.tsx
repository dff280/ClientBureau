import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import {
  BureauPanel,
  PremiumCtaBand,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
} from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import { getSeoLandingPages } from "@/lib/seo-landing-pages"

export const metadata: Metadata = {
  title: "Industries and Trades",
  description:
    "Browse Client Bureau pages for contractors, subcontractors, service businesses, and high-demand trades that check clients before work.",
  alternates: {
    canonical: "/industries",
  },
}

const faqs = [
  {
    question: "What industries does Client Bureau support?",
    answer:
      "Client Bureau supports contractors, service businesses, subcontractors, trade professionals, vendors, and project-based businesses that need to check clients before accepting work.",
  },
  {
    question: "Are industry pages public directories or private tools?",
    answer:
      "Industry pages are public education and search entry points. Dashboard tools, job records, evidence, contracts, recovery cases, lien cases, and private notes stay inside authenticated workspaces.",
  },
  {
    question: "Can subcontractors use Client Bureau to check contractors?",
    answer:
      "Yes. Subcontractor workflows focus on contractor relationship context, trade scope, payment-chain documentation, and moderated public profile signals where available.",
  },
]

const proofItems = [
  { label: "Core action", value: "Check first", text: "Search before labor, materials, scheduling, or deposits are committed." },
  { label: "Business types", value: "Trades + services", text: "Built for contractors, subs, crews, vendors, and service businesses." },
  { label: "Public standard", value: "Moderated", text: "Public pages use approved summaries and response-aware language." },
  { label: "Private records", value: "Protected", text: "Jobs, evidence, contracts, and recovery workflows stay private." },
]

export default function IndustriesPage() {
  const pages = getSeoLandingPages("industries")
  const audiencePages = pages.filter((page) => !page.tradeCategory)
  const tradePages = pages.filter((page) => page.tradeCategory)

  return (
    <>
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Industry directory"
        title="Client checks for the trades that carry the most job risk."
        description="Browse Client Bureau by business type and trade. Each page gives contractors and service business owners a clearer path to search, document, and protect the work before, during, and after a job."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/profiles", label: "Browse Public Profiles", icon: UsersRound }}
        aside={
          <div className="grid gap-3">
            <HubMetric label="Industry pages" value={`${pages.length}+`} text="Focused pages for trades, service businesses, and subcontractor workflows." />
            <HubMetric label="Trade categories" value={`${tradePages.length}`} text="High-demand trade pages linked to search and profile discovery." />
            <HubMetric label="Privacy posture" value="Private first" text="Operational data is never exposed through these public pages." />
          </div>
        }
      />
      <PremiumProofStrip items={proofItems} />

      <main className="bureau-paper">
        <section className="bureau-section">
          <div className="bureau-container">
            <PremiumSectionHeader
              eyebrow="Business owner paths"
              title="Start with the way your business works."
              description="Client Bureau pages are grouped by the kind of business using the platform: direct-to-client contractors, service businesses, agencies, freelancers, and subcontractors checking contractor relationships."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {audiencePages.map((page) => (
                <IndustryCard
                  key={page.canonicalPath}
                  href={page.canonicalPath}
                  label={page.title}
                  title={page.h1}
                  description={page.intro}
                  cta={page.primaryCta}
                  icon={page.slug === "subcontractors" ? UsersRound : BriefcaseBusiness}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bureau-section border-y border-slate-200 bg-white">
          <div className="bureau-container">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr] lg:items-end">
              <PremiumSectionHeader
                eyebrow="High-demand trades"
                title="Trade pages built around real job risk."
                description="Each trade page connects search, public profile context, report submission, and private workflow tools without turning the platform into an accusation site."
              />
              <BureauPanel className="bg-slate-950 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Search-ready structure</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Trade pages use canonical trade labels, careful metadata, search handoff links, and profile directory links so users and crawlers can understand the platform quickly.
                </p>
              </BureauPanel>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tradePages.map((page) => (
                <Link
                  key={page.canonicalPath}
                  href={page.canonicalPath}
                  className="bureau-hover-lift rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-amber-300 hover:bg-white"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">{page.tradeCategory}</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950">{page.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{page.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    Open trade page
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bureau-section">
          <div className="bureau-container">
            <PremiumSectionHeader
              eyebrow="How to use it"
              title="A simple operating rhythm for every trade."
              description="The platform is organized around the same business reality: search before the job, document during the job, and use private support workflows when payment or scope problems appear."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <IndustryPrinciple
                icon={Search}
                title="Search before the job"
                description="Check client, contractor, and business profile context before scheduling crews or ordering materials."
              />
              <IndustryPrinciple
                icon={ClipboardCheck}
                title="Document during the job"
                description="Keep job records, contract packets, change orders, evidence labels, and reports organized in one private workspace."
              />
              <IndustryPrinciple
                icon={ShieldCheck}
                title="Protect after an issue"
                description="Use payment recovery, Florida lien service, client response, and moderated report workflows with careful language and audit trails."
              />
            </div>
          </div>
        </section>

        <PremiumCtaBand
          eyebrow="Client Bureau"
          title="Find the right path for your trade, then check the client before you take the job."
          description="Start with search, browse approved public profiles, or choose the industry page closest to the work your business performs."
          primary={{ href: "/search", label: "Check a Client", icon: Search }}
          secondary={{ href: "/submit-report", label: "Report a Client Experience", icon: ClipboardCheck }}
        />
      </main>
    </>
  )
}

function HubMetric({ label, value, text }: { label: string; value: string; text: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.055] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}

function IndustryCard({
  cta,
  description,
  href,
  icon: Icon,
  label,
  title,
}: {
  cta: string
  description: string
  href: string
  icon: LucideIcon
  label: string
  title: string
}) {
  return (
    <Card className="bureau-hover-lift overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-slate-950 text-amber-300">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">{label}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link href={href}>
                {cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IndustryPrinciple({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <BureauPanel>
      <span className="flex size-11 items-center justify-center rounded-md bg-slate-950 text-amber-300">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </BureauPanel>
  )
}
