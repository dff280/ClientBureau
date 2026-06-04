import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, CheckCircle2, Search, ShieldCheck, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { getSiteUrl } from "@/lib/env"
import { getPublicBusinessProfilesService } from "@/lib/repositories/client-bureau-service"

export const metadata: Metadata = {
  title: "Verified Business Profiles",
  description:
    "Browse Client Bureau business trust profiles for contractors and service businesses with verification, documentation, and public contribution ratings.",
  alternates: {
    canonical: `${getSiteUrl()}/businesses`,
  },
}

export const dynamic = "force-dynamic"

type BusinessesPageSearchParams = Promise<{
  q?: string
  state?: string
  rating?: string
}>

export default async function BusinessesPage({ searchParams }: { searchParams: BusinessesPageSearchParams }) {
  const params = await searchParams
  const query = params.q?.trim().toLowerCase() ?? ""
  const state = params.state ?? "all"
  const rating = params.rating ?? "all"
  const profiles = await getPublicBusinessProfilesService()
  const filtered = profiles.filter((profile) => {
    const text = [profile.businessName, profile.trade, profile.city, profile.state, profile.publicSlug]
      .join(" ")
      .toLowerCase()

    return (
      (!query || text.includes(query)) &&
      (state === "all" || profile.state === state) &&
      (rating === "all" || profile.ratingGrade === rating)
    )
  })
  const states = [...new Set(profiles.map((profile) => profile.state))].sort()
  const averageRating = profiles.length
    ? Math.round(profiles.reduce((total, profile) => total + profile.ratingScore, 0) / profiles.length)
    : 0

  return (
    <main className="bg-slate-100">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <Badge className="rounded-md bg-amber-500 text-slate-950">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Business trust profiles
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                Find verified contractors and business owners.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Public business profiles help owners show verification status, documentation habits,
                approved contribution history, and Client Bureau Business Rating context without
                exposing private account details.
              </p>
            </div>
            <form className="grid max-w-3xl gap-2 rounded-md border border-white/10 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_140px_140px_auto]">
              <Input
                name="q"
                defaultValue={params.q}
                placeholder="Search business, trade, or city"
                className="border-0 bg-white text-slate-950 shadow-none"
                aria-label="Search business profiles"
              />
              <select name="state" defaultValue={state} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950">
                <option value="all">All states</option>
                {states.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select name="rating" defaultValue={rating} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950">
                <option value="all">All ratings</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="Review Pending">Review pending</option>
              </select>
              <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                <Search aria-hidden="true" />
                Search
              </Button>
            </form>
          </div>
          <Card className="rounded-md border-white/10 bg-white/10 text-white shadow-2xl">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase text-amber-200">Directory snapshot</p>
              <div className="grid gap-3">
                <DirectoryStat label="Public businesses" value={profiles.length.toLocaleString()} />
                <DirectoryStat label="Average rating" value={`${averageRating}/100`} />
                <DirectoryStat label="States represented" value={states.length.toLocaleString()} />
              </div>
              <p className="text-xs leading-5 text-slate-300">
                Business ratings are readiness and documentation signals. They are not customer
                star reviews or guarantees of project outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bureau-section">
        <div className="bureau-container space-y-6">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-amber-700">Public directory</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                Business profiles
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Each profile explains the rating factors and shows only public-safe business
                information. Private emails, phone numbers, street addresses, and internal account
                notes are not displayed.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/business-rating-methodology">
                <Star aria-hidden="true" />
                Rating methodology
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {filtered.map((profile) => (
              <Link
                key={profile.id}
                href={`/business/${profile.publicSlug}`}
                className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">{profile.trade}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{profile.businessName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{profile.city}, {profile.state}</p>
                  </div>
                  <div className="rounded-md bg-slate-950 px-3 py-2 text-center text-white">
                    <p className="text-xs text-slate-300">Rating</p>
                    <p className="text-xl font-semibold">{profile.ratingGrade}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <Progress value={profile.ratingScore} />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{profile.ratingScore}/100</span>
                    <span>{profile.ratingConfidence} confidence</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-700" aria-hidden="true" />
                    {profile.publicProfileStatus}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4 text-amber-700" aria-hidden="true" />
                    {profile.reportStats.published} public report contributions
                  </span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  View business profile
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-950">No business profiles match.</h3>
              <p className="mt-2 text-sm text-slate-600">Clear the filters or search another trade, city, state, or business name.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function DirectoryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
