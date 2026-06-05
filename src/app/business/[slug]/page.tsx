import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getSiteUrl } from "@/lib/env"
import { getPublicBusinessProfileService } from "@/lib/repositories/client-bureau-service"
import { JsonLd } from "@/lib/seo"

type BusinessProfilePageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: BusinessProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPublicBusinessProfileService(slug)
  const siteUrl = getSiteUrl()

  if (!profile) {
    return {
      title: "Business Profile Not Found",
    }
  }

  const title = `${profile.businessName} Business Rating`
  const description = `${profile.businessName} in ${profile.city}, ${profile.state}: Client Bureau business profile with verification, documentation, public contribution, and rating context.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/business/${profile.publicSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/business/${profile.publicSlug}`,
      type: "profile",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${profile.businessName} Client Bureau business profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/twitter-image`],
    },
    keywords: [
      profile.businessName,
      profile.trade,
      `${profile.city} ${profile.state}`,
      "contractor business rating",
      "verified contractor profile",
      "Client Bureau business profile",
    ],
  }
}

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params
  const profile = await getPublicBusinessProfileService(slug)

  if (!profile) notFound()

  const siteUrl = getSiteUrl()
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: profile.businessName,
    url: `${siteUrl}/business/${profile.publicSlug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.city,
      addressRegion: profile.state,
    },
    knowsAbout: [profile.trade, "client screening", "project documentation", "contractor business protection"],
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Client Bureau Business Rating",
        value: `${profile.ratingGrade} (${profile.ratingScore}/100)`,
      },
      {
        "@type": "PropertyValue",
        name: "Business rating confidence",
        value: profile.ratingConfidence,
      },
    ],
  }
  const badgeEmbed = `<a href="${siteUrl}/business/${profile.publicSlug}" rel="nofollow noopener">View ${profile.businessName} on Client Bureau</a>`

  return (
    <article className="bg-slate-100">
      <JsonLd data={structuredData} />
      <section className="border-b border-slate-200 bg-white">
        <div className="bureau-container grid gap-8 py-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-md bg-emerald-700 text-white">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {profile.publicProfileStatus}
              </Badge>
              <Badge variant="outline" className="rounded-md bg-white">
                {profile.ratingConfidence} confidence
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                {profile.businessName}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                {profile.trade} | {profile.city}, {profile.state}
              </p>
            </div>
            <p className="max-w-3xl leading-7 text-slate-600">
              This public Client Bureau business profile summarizes verification status,
              documentation habits, approved contribution history, and business rating context.
              It does not display private emails, phone numbers, street addresses, raw evidence,
              internal admin notes, or client private identifiers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/signup">
                  <Building2 aria-hidden="true" />
                  Create business profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/claim-profile?profile=${encodeURIComponent(profile.publicSlug)}`}>
                  <UserCheck aria-hidden="true" />
                  Claim or update profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/business-rating-methodology">
                  <HelpCircle aria-hidden="true" />
                  Rating methodology
                </Link>
              </Button>
            </div>
          </div>
          <Card className="rounded-md border-slate-200 shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Business Rating</p>
                  <p className="mt-2 text-5xl font-semibold text-slate-950">{profile.ratingGrade}</p>
                </div>
                <Star className="size-8 text-amber-600" aria-hidden="true" />
              </div>
              <Progress value={profile.ratingScore} />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-950">{profile.ratingScore}/100</span>
                <span className="text-slate-500">{profile.ratingConfidence} confidence</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <HelpCircle className="size-3.5" aria-hidden="true" />
                      What this rating means
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Based on verification, documentation, contribution history, resolution posture, and account completeness.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs leading-5 text-slate-500">{profile.ratingSummary}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bureau-section">
        <div className="bureau-container grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <TrustMetric label="Reports submitted" value={String(profile.reportStats.submitted)} />
              <TrustMetric label="Public contributions" value={String(profile.reportStats.published)} />
              <TrustMetric label="Positive reports" value={String(profile.reportStats.positive)} />
              <TrustMetric label="Evidence records" value={String(profile.reportStats.evidenceAttached)} />
            </div>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-5 text-amber-700" aria-hidden="true" />
                  Rating factors
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {profile.ratingFactors.map((factor) => (
                  <div key={factor.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-950">{factor.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{factor.description}</p>
                      </div>
                      <Badge className={factor.status === "strong" ? "rounded-md bg-emerald-700 text-white" : factor.status === "good" ? "rounded-md bg-amber-600 text-white" : "rounded-md bg-slate-600 text-white"}>
                        {factor.score}/{factor.maxScore}
                      </Badge>
                    </div>
                    <Progress value={(factor.score / factor.maxScore) * 100} className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="size-5 text-amber-700" aria-hidden="true" />
                  Public client-report contributions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.publicClientReports.length > 0 ? (
                  profile.publicClientReports.map(({ report, client }) => (
                    <Link
                      key={report.id}
                      href={`/client/${client.publicSlug}`}
                      className="block rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-300"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {client.firstName} {client.lastName} | {client.city}, {client.state}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                            {report.reportCategory}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                          View profile
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{report.publicSummary}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
                    This business does not have public client-report contributions yet. Private
                    workflow records and pending content are not displayed on public pages.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="min-w-0 space-y-5">
            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Profile claiming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-slate-600">
                  Authorized business owners can request updates, add verification context, and
                  manage profile badge and review request workflows from a private account.
                </p>
                <Button asChild className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={`/claim-profile?profile=${encodeURIComponent(profile.publicSlug)}`}>
                    <UserCheck aria-hidden="true" />
                    Claim or update
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Business summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <ProfileFact label="Trade" value={profile.trade} />
                <ProfileFact label="Market" value={`${profile.city}, ${profile.state}`} />
                <ProfileFact label="Member since" value={new Date(profile.memberSince).toLocaleDateString()} />
                <ProfileFact label="Last updated" value={new Date(profile.lastUpdated).toLocaleDateString()} />
                <ProfileFact label="License" value={profile.licenseNumber ? "Information on file" : "Not provided"} />
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Trust highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.trustHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-700" aria-hidden="true" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Share profile badge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-slate-600">
                  Businesses may link to this public profile with branded badge text. The embed is
                  built for referral trust, not keyword-stuffed backlink schemes.
                </p>
                <pre className="max-w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                  <code>{badgeEmbed}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Service areas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.serviceAreas.map((area) => (
                  <Badge key={area} variant="outline" className="rounded-md bg-slate-50">
                    {area}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <p className="font-semibold text-amber-950">Important rating note</p>
                <p className="text-sm leading-6 text-amber-950">
                  Client Bureau Business Rating is a platform-readiness signal. It is not a
                  customer review score, workmanship guarantee, credit score, license verification
                  service, or legal determination.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </article>
  )
}

function TrustMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  )
}
