import type { Metadata } from "next"
import Link from "next/link"
import {
  Bell,
  BriefcaseBusiness,
  Download,
  FileSignature,
  FolderLock,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react"

import {
  BureauMetricCard,
  PremiumCtaBand,
  PremiumFeatureCard,
  PremiumHero,
  PremiumProofStrip,
  PremiumSectionHeader,
  WorkflowTimeline,
} from "@/components/marketing/premium-page-shell"
import { Button } from "@/components/ui/button"
import { JsonLd, getFaqSchema } from "@/lib/seo"
import mobileAppConfig from "../../../apps/mobile/app.json"

const configuredApkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL
const configuredAabUrl = process.env.NEXT_PUBLIC_ANDROID_AAB_URL
const androidAccessHref = "/contact?topic=android-app"
const mobileReleaseVersion = mobileAppConfig.expo.version
const androidVersionCode = mobileAppConfig.expo.android.versionCode
const hasDirectApk = Boolean(configuredApkUrl)
const hasDirectAab = Boolean(configuredAabUrl)
const primaryMobileCta = {
  href: configuredApkUrl ?? androidAccessHref,
  label: hasDirectApk ? "Download Android APK" : "Request Android access",
  icon: hasDirectApk ? Download : Smartphone,
}
const PrimaryMobileIcon = primaryMobileCta.icon

export const metadata: Metadata = {
  title: "Client Bureau Android App",
  description:
    "Download the Client Bureau Android app for client checks, reports, contracts, recovery workflows, Florida lien service, evidence, and alerts.",
  alternates: {
    canonical: "/mobile-app",
  },
}

const proof = [
  {
    label: "Current release",
    value: mobileReleaseVersion,
    text: hasDirectApk
      ? "Direct Android install for contractors and service business owners."
      : "Release access is routed through Client Bureau support until a fresh APK link is configured.",
  },
  { label: "Android build", value: String(androidVersionCode), text: "Login focus fix, premium auth, and mobile tool polish." },
  { label: "Core tools", value: "8", text: "Search, reports, contracts, recovery, lien service, evidence, watchlist, account." },
  { label: "Private first", value: "Yes", text: "No public exposure of private documents or raw identifiers." },
]

const appTools = [
  {
    icon: Search,
    title: "Client search",
    text: "Check client records, approved public profiles, saved searches, and private-match signals from the field.",
  },
  {
    icon: FileSignature,
    title: "Contracts",
    text: "Track agreement packets, signing links, payment terms, deposits, and contract status.",
  },
  {
    icon: TrendingUp,
    title: "Payment recovery",
    text: "Open private Resolution Desk cases and track staff-reviewed next actions for unpaid invoices.",
  },
  {
    icon: FolderLock,
    title: "Evidence vault",
    text: "Review private evidence summaries and document status without exposing raw files publicly.",
  },
]

const workflow = [
  {
    phase: "01",
    icon: Search,
    title: "Check the client",
    text: "Search before you commit labor, materials, scheduling, deposits, or crew time.",
  },
  {
    phase: "02",
    icon: BriefcaseBusiness,
    title: "Choose the right tool",
    text: "Use reports, contracts, recovery, lien service, evidence, or watchlist based on where the job stands.",
  },
  {
    phase: "03",
    icon: ShieldCheck,
    title: "Keep records private",
    text: "Sensitive identifiers, documents, evidence files, contract terms, and service cases stay private.",
  },
]

const faqs = [
  {
    question: "Is the Android app a web wrapper?",
    answer:
      "No. The Android app is native software for contractors and service business owners. It connects to the Client Bureau platform for dashboard, search, reports, contracts, recovery, lien service, evidence, and watchlist workflows.",
  },
  {
    question: "Does the mobile app expose private evidence?",
    answer:
      "No. The app shows private evidence summaries and statuses. Raw evidence files, private identifiers, internal notes, and pending or rejected public content are not exposed publicly.",
  },
  {
    question: "Who is the app for?",
    answer:
      "The first Android release is for contractors and service business owners who need to check clients, document jobs, track payment issues, manage contracts, and organize protection workflows from the field.",
  },
]

export default function MobileAppPage() {
  return (
    <main className="bg-slate-100">
      <JsonLd data={getFaqSchema(faqs)} />
      <PremiumHero
        eyebrow="Client Bureau Android"
        title="Client checks and job-protection tools from the field."
        description="Download the Client Bureau Android app to search clients, track reports, manage contract packets, open recovery cases, start Florida lien service workflows, review evidence status, and monitor alerts from one secure mobile workspace."
        primary={primaryMobileCta}
        secondary={{ href: "/signup", label: "Create Account", icon: Smartphone }}
        aside={
          <div className="space-y-5 text-white">
            <Smartphone className="size-10 text-amber-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">
                Current mobile release
              </p>
              <p className="mt-2 text-4xl font-semibold">{mobileReleaseVersion}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Android release with improved login focus, premium auth, safe-area
                support, and contractor-first mobile workflows.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-300">
              <span>Android app: Client Bureau</span>
              <span>Release build: {androidVersionCode}</span>
              <span>
                {hasDirectApk
                  ? "Direct APK install now; Play Store package stays ready for release."
                  : "Request access while the latest APK link is prepared."}
              </span>
            </div>
          </div>
        }
      />

      <PremiumProofStrip items={proof} dark />

      <section className="bureau-section">
        <div className="bureau-container space-y-10">
          <PremiumSectionHeader
            eyebrow="Mobile workspace"
            title="Built for contractors who need answers before, during, and after the job."
            description="The app keeps the daily workflow simple: check the client, create the right record, keep sensitive files private, and follow the next action."
          />

          <div className="grid gap-4 lg:grid-cols-4">
            {appTools.map((tool) => (
              <PremiumFeatureCard key={tool.title} icon={tool.icon} title={tool.title} text={tool.text} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="grid gap-4">
              <BureauMetricCard
                icon={ShieldCheck}
                label="Security posture"
                value="Account-protected"
                text="Mobile access is tied to your account, and private workspace details stay out of public pages."
              />
              <BureauMetricCard
                icon={Bell}
                label="Daily action"
                value="Search first"
                text="The app is designed around the first question a contractor asks: should I take this job?"
              />
            </div>
            <WorkflowTimeline items={workflow} />
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
              Install note
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {hasDirectApk
                ? "The APK is for direct Android installation. Android may ask you to allow installation from your browser or file manager."
                : "A fresh APK link is published here when a release artifact is configured. Until then, request Android access and we will route you to the right install path."}
              {hasDirectAab
                ? " Use the Play-ready AAB for Google Play Console upload, not direct phone installation."
                : null}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                <Link href={primaryMobileCta.href}>
                  {primaryMobileCta.label}
                  <PrimaryMobileIcon aria-hidden="true" />
                </Link>
              </Button>
              {configuredAabUrl ? (
                <Button asChild variant="outline">
                  <a href={configuredAabUrl}>
                    Download AAB
                    <Download aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/resources">Read resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PremiumCtaBand
        eyebrow="Use it in the field"
        title="Check the client before you take the job."
        description="Create an account, install the Android app, and keep Client Bureau close when you are screening leads, documenting projects, and protecting payment."
        primary={primaryMobileCta}
        secondary={{ href: "/signup", label: "Create Account", icon: Smartphone }}
      />
    </main>
  )
}
