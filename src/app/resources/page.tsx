import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpenCheck, FileText, Scale, Search, ShieldCheck } from "lucide-react"

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
import { resourceNavigationGroups } from "@/lib/navigation"
import { pageAssets } from "@/lib/page-assets"
import { JsonLd, getFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contractor Resources",
  description:
    "Resources for checking clients, understanding client scores, business and trade ratings, reports, response rights, contracts, and recovery workflows.",
  alternates: {
    canonical: "/resources",
  },
}

const overview = [
  {
    icon: Search,
    title: "Before the job",
    text: "Learn how client search, private matching, watchlists, and public profiles help you decide whether to accept work.",
  },
  {
    icon: FileText,
    title: "During the job",
    text: "Use contracts, change orders, project documents, and evidence records to keep expectations and payment terms clear.",
  },
  {
    icon: ShieldCheck,
    title: "After the job",
    text: "Understand reports, client responses, payment recovery, Florida lien service, moderation, and resolution tracking.",
  },
]

const proof = [
  { label: "Start", value: "Search", text: "Check client context before committing labor or materials." },
  { label: "Document", value: "Evidence", text: "Keep invoices, contracts, messages, photos, and timelines organized." },
  { label: "Respond", value: "Fairness", text: "Clients can respond, dispute, correct, or share resolution updates." },
  { label: "Protect", value: "Private tools", text: "Recovery, lien, contract, and evidence workflows stay private." },
]

const faqs = [
  {
    question: "What should contractors read first?",
    answer:
      "Start with How It Works, Client Rating Methodology, Business & Trade Ratings, and Report Policy to understand search, ratings, moderation, and public reporting standards.",
  },
  {
    question: "Can clients respond to a public profile?",
    answer:
      "Yes. Clients can submit a response, dispute, correction request, or resolution update for moderation before public display.",
  },
  {
    question: "How are subcontractor profiles different from contractor profiles?",
    answer:
      "Contractor profiles focus on customer-facing business reliability. Subcontractor profiles focus on trade scope, GC/sub relationships, payment-chain context, evidence readiness, and claim or correction rights.",
  },
  {
    question: "Are private emails, phone numbers, and evidence files public?",
    answer:
      "No. Public pages do not display private contact identifiers, street addresses, internal notes, or raw evidence files.",
  },
]

const evidenceVaultAsset = pageAssets.evidenceVault

export default function ResourcesPage() {
  return (
    <main className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Client Bureau Resources"
        title="Clear operating standards for checking clients and protecting your business."
        description="Use these guides to understand client search, client score methodology, business and trade ratings, report standards, contracts, evidence, response rights, payment recovery, and Florida lien workflows."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/business-rating-methodology", label: "Business & trade ratings", icon: BookOpenCheck }}
        aside={
          <ProductMockupFrame
            dark
            eyebrow="Responsible use"
            title="Documented, moderated, and clear."
            description="Records work best when they are factual, organized, and clear about what is public, private, and response-aware."
            imageSrc={evidenceVaultAsset.src}
            imageAlt={evidenceVaultAsset.alt}
            points={evidenceVaultAsset.points}
          />
        }
      />

      <PremiumProofStrip items={proof} dark />

      <PublicJourneyNav
        active="help"
        eyebrow="Find the right guide"
        title="Resources are organized by what you are trying to do."
        description="Check the client first, protect the job before work starts, browse approved public records, or review policies and response paths when a record needs context."
      />

      <section className="bureau-section">
        <div className="bureau-container space-y-10">
          <PremiumSectionHeader
            eyebrow="Resource Library"
            title="Everything a contractor needs to use Client Bureau with confidence."
            description="The resource center is organized around the real business flow: check the client before the job, document during the job, and protect payment after the job."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {overview.map((item) => (
              <PremiumFeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {resourceNavigationGroups.map((group) => (
              <Card key={group.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-amber-700" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-slate-950">{group.title}</h2>
                  </div>
                  <div className="grid gap-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-md border border-slate-200 p-3 transition hover:border-amber-300 hover:bg-amber-50/40"
                      >
                        <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-950">
                          {link.label}
                          <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                        </span>
                        {link.description ? (
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {link.description}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-md border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-5 p-6 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Responsible use</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                  Built for documented business decisions, not public shaming.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Contractors can document positive experiences, payment concerns, dispute context,
                  and resolution history. Public records stay limited to approved summaries and
                  neutral response paths.
                </p>
              </div>
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/report-policy">
                  Review report standards
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Need the shortest path?"
        title="Start with a client search, then document the job if the record matters."
        description="Client Bureau keeps the path simple: check, decide, document, respond, resolve, and protect the business record."
        primary={{ href: "/search", label: "Check a Client", icon: Search }}
        secondary={{ href: "/submit-report", label: "Report a Client Experience", icon: Scale }}
      />
    </main>
  )
}
