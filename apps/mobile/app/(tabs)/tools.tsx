import { router } from "expo-router"
import { Bell, FileSignature, FolderLock, Landmark, TrendingUp } from "lucide-react-native"

import { BureauHero, Screen, SectionHeader, StatusPill, ToolCard } from "@/components/ui"

const tools = [
  {
    title: "Contracts",
    body: "Create agreement packets, track signing links, and organize payment terms.",
    href: "/tools/contracts",
    meta: "Use before scheduling or buying materials.",
    icon: FileSignature,
  },
  {
    title: "Payment Recovery",
    body: "Open a managed Resolution Desk case and track staff review and next actions.",
    href: "/tools/recovery",
    meta: "Private workflow for unpaid invoices.",
    icon: TrendingUp,
  },
  {
    title: "Florida Lien Service",
    body: "Prepare Florida notice or filing cases with private documentation and authorization.",
    href: "/tools/lien-service",
    meta: "Florida cases only in this release.",
    icon: Landmark,
  },
  {
    title: "Evidence Vault",
    body: "Review private evidence summaries without exposing storage files publicly.",
    href: "/tools/evidence",
    meta: "Invoices, documents, photos, and screenshots.",
    icon: FolderLock,
  },
  {
    title: "Watchlist",
    body: "Track clients, saved searches, and private alerts before committing to new work.",
    href: "/tools/watchlist",
    meta: "Monitor leads before accepting the job.",
    icon: Bell,
  },
] as const

export default function ToolsScreen() {
  return (
    <Screen eyebrow="Protection tools" title="Daily tools for safer jobs.">
      <BureauHero
        eyebrow="Private workspace"
        title="Protect the job before, during, and after the work."
        body="Contracts, recovery, lien service, evidence, and monitoring live in one contractor-first mobile workspace."
      >
        <StatusPill label="Private by default" tone="gold" />
      </BureauHero>
      <SectionHeader
        title="Choose what you need to do next"
        body="Each tool is private by default and built for everyday contractor workflows."
      />
      {tools.map((tool) => (
        <ToolCard
          key={tool.href}
          title={tool.title}
          body={tool.body}
          meta={tool.meta}
          icon={tool.icon}
          onPress={() => router.push(tool.href)}
        />
      ))}
    </Screen>
  )
}
