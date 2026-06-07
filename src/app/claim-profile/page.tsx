import type { Metadata } from "next"
import Link from "next/link"
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  MailCheck,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react"

import { JsonLd, getFaqSchema } from "@/lib/seo"
import { StateSelect } from "@/components/forms/state-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ClaimProfilePageProps = {
  searchParams: Promise<{ profile?: string | string[] }>
}

export const metadata: Metadata = {
  title: "Claim Your Business Profile",
  description:
    "Claim a Client Bureau business profile, verify business details, request reviews, and share a public trust profile.",
  alternates: {
    canonical: "/claim-profile",
  },
}

const steps = [
  {
    icon: Building2,
    title: "Find or create the profile",
    text: "Start with your business name, trade, city, and state so the profile can connect to the right account.",
  },
  {
    icon: ShieldCheck,
    title: "Verify business details",
    text: "Add reasonable verification signals such as business email, license details, insurance context, or service areas.",
  },
  {
    icon: Star,
    title: "Request reviews after real work",
    text: "Send positive reference, resolution update, and documented experience requests through a moderated workflow.",
  },
  {
    icon: BadgeCheck,
    title: "Share a branded profile badge",
    text: "Use a Client Bureau profile link on your site so people can verify your public business profile.",
  },
]

const faqs = [
  {
    question: "Who can claim a Client Bureau business profile?",
    answer:
      "A contractor, service business owner, or authorized team member may request to claim or update a business profile after verification review.",
  },
  {
    question: "Does claiming a profile publish private business records?",
    answer:
      "No. Private account details, billing records, raw evidence, client emails, phone numbers, and internal notes remain private.",
  },
  {
    question: "Can claimed profiles request positive reviews?",
    answer:
      "Yes. Contractors can request positive references, resolution updates, and documented client experiences. Submissions still go through moderation before public display.",
  },
]

export default async function ClaimProfilePage({ searchParams }: ClaimProfilePageProps) {
  const params = await searchParams
  const profile = Array.isArray(params.profile) ? params.profile[0] : params.profile
  const signupHref = profile
    ? `/signup?intent=claim-profile&profile=${encodeURIComponent(profile)}`
    : "/signup?intent=claim-profile"

  return (
    <main className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-amber-200">
              <UserCheck className="size-4" aria-hidden="true" />
              Business profile claiming
            </div>
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
                Claim your Client Bureau business profile.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Connect your business account to a public profile, strengthen verification signals,
                invite trusted contractors, and request moderated reviews after real client work.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Link href={signupHref}>
                  <UserCheck aria-hidden="true" />
                  Start profile claim
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Link href="/businesses">Browse business profiles</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <p className="text-sm font-semibold uppercase text-amber-200">What claiming unlocks</p>
              {[
                "Business verification status",
                "Public profile badge",
                "Review request links",
                "Referral credit loop",
                "Service area and trade context",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-100">
                  <CheckCircle2 className="size-4 text-amber-300" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bureau-section">
        <div className="bureau-container space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.title} className="rounded-md border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <span className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-amber-300">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-950">{step.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase text-amber-700">Claim request</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Start with your business details.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This request starts a private account workflow. A public profile should only show
                    moderated profile context, service areas, rating factors, and approved public contributions.
                  </p>
                </div>
                <form action="/signup" className="space-y-5">
                  <input type="hidden" name="intent" value="claim-profile" />
                  {profile ? <input type="hidden" name="profile" value={profile} /> : null}
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input aria-label="Business name" name="businessName" placeholder="Business name" />
                    <Input aria-label="Trade or service type" name="trade" placeholder="Trade or service type" />
                    <Input aria-label="City" name="city" placeholder="City" />
                    <StateSelect id="claimProfileState" name="state" ariaLabel="State" />
                    <Input
                      aria-label="Business email"
                      className="md:col-span-2"
                      name="email"
                      placeholder="Business email"
                      type="email"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="bg-slate-950 text-white hover:bg-slate-800">
                      Continue to account
                      <MailCheck aria-hidden="true" />
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/business-rating-methodology">
                        <ClipboardCheck aria-hidden="true" />
                        Rating methodology
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <ShieldCheck className="size-8 text-amber-800" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-amber-950">Private by default</h2>
                <p className="text-sm leading-6 text-amber-950">
                  Claiming a profile does not expose private emails, phone numbers, billing details,
                  street addresses, raw evidence, private contract files, or internal moderation notes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
