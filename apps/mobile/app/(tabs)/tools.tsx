import { router } from "expo-router"

import { Screen, SectionHeader, ToolCard } from "@/components/ui"

const tools = [
  {
    title: "Contracts",
    body: "Create agreement packets, track signing links, and organize payment terms.",
    href: "/tools/contracts",
    meta: "Use before scheduling or buying materials.",
  },
  {
    title: "Payment Recovery",
    body: "Open a managed Resolution Desk case and track staff review and next actions.",
    href: "/tools/recovery",
    meta: "Private workflow for unpaid invoices.",
  },
  {
    title: "Florida Lien Service",
    body: "Prepare Florida notice or filing cases with private documentation and authorization.",
    href: "/tools/lien-service",
    meta: "Florida cases only in this release.",
  },
  {
    title: "Evidence Vault",
    body: "Review private evidence summaries without exposing storage files publicly.",
    href: "/tools/evidence",
    meta: "Invoices, documents, photos, and screenshots.",
  },
  {
    title: "Watchlist",
    body: "Track clients, saved searches, and private alerts before committing to new work.",
    href: "/tools/watchlist",
    meta: "Monitor leads before accepting the job.",
  },
] as const

export default function ToolsScreen() {
  return (
    <Screen eyebrow="Protection tools" title="Daily tools for safer jobs.">
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
          onPress={() => router.push(tool.href)}
        />
      ))}
    </Screen>
  )
}
