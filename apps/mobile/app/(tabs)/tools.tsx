import { router } from "expo-router"
import { Bell, FileSignature, FolderLock, Landmark, ShieldCheck, TrendingUp } from "lucide-react-native"
import { Fragment } from "react"

import { BureauHero, InsightCard, Screen, SectionHeader, StatusPill, ToolCard, TrustBadge } from "@/components/ui"

const tools = [
  {
    group: "Before the job",
    title: "Contracts",
    body: "Create agreement packets, track signing links, and organize payment terms.",
    href: "/tools/contracts",
    meta: "Use before scheduling or buying materials.",
    icon: FileSignature,
  },
  {
    group: "After an issue",
    title: "Payment Recovery",
    body: "Open a managed Resolution Desk case and track staff review and next actions.",
    href: "/tools/recovery",
    meta: "Private workflow for unpaid invoices.",
    icon: TrendingUp,
  },
  {
    group: "After an issue",
    title: "Florida Lien Service",
    body: "Prepare Florida notice or filing cases with private documentation and authorization.",
    href: "/tools/lien-service",
    meta: "Florida cases only in this release.",
    icon: Landmark,
  },
  {
    group: "During the job",
    title: "Evidence Vault",
    body: "Review private evidence summaries without exposing storage files publicly.",
    href: "/tools/evidence",
    meta: "Invoices, documents, photos, and screenshots.",
    icon: FolderLock,
  },
  {
    group: "Before the job",
    title: "Watchlist",
    body: "Track clients, saved searches, and private alerts before committing to new work.",
    href: "/tools/watchlist",
    meta: "Monitor leads before accepting the job.",
    icon: Bell,
  },
] as const

export default function ToolsScreen() {
  const groups = ["Before the job", "During the job", "After an issue"] as const

  return (
    <Screen
      eyebrow="Protection tools"
      title="Daily tools for safer jobs."
      body="Pick the tool that matches the job stage. Each workflow is private by default."
      badge="Private"
    >
      <BureauHero
        eyebrow="Private workspace"
        title="One workspace for job protection."
        body="Search first, set clear terms, preserve evidence, and request help when payment or lien steps need structure."
      >
        <StatusPill label="Private by default" tone="gold" />
        <TrustBadge label="Business protection" tone="green" />
      </BureauHero>
      <InsightCard
        icon={ShieldCheck}
        label="Tool doctrine"
        title="Use the right tool at the right moment."
        body="Search before you accept. Contracts before you schedule. Evidence and recovery when payment or project facts need documentation."
        tone="gold"
      />
      <SectionHeader
        title="Choose by job stage"
        body="Simple groups keep the app from becoming a wall of tools."
      />
      {groups.map((group) => (
        <Fragment key={group}>
          <SectionHeader key={`${group}-header`} eyebrow="Tool group" title={group} />
          {tools
            .filter((tool) => tool.group === group)
            .map((tool) => (
              <ToolCard
                key={tool.href}
                title={tool.title}
                body={tool.body}
                meta={tool.meta}
                icon={tool.icon}
                onPress={() => router.push(tool.href)}
              />
            ))}
        </Fragment>
      ))}
    </Screen>
  )
}
