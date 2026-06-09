import { router } from "expo-router"
import { Bell, ClipboardCheck, FileSignature, FolderLock, Landmark, Search, ShieldCheck, TrendingUp } from "lucide-react-native"
import { Fragment } from "react"

import { BureauHero, CommandCard, InsightCard, LaunchChecklist, Screen, SectionHeader, StatusPill, ToolCard, TrustBadge, styles } from "@/components/ui"
import { View } from "react-native"

const tools = [
  {
    group: "Before the job",
    title: "Search Clients",
    body: "Check public profiles and private-match signals before you accept work.",
    href: "/search",
    meta: "The first step for every new lead.",
    icon: Search,
  },
  {
    group: "Before the job",
    title: "Watchlist",
    body: "Track clients, saved searches, and private alerts before committing to new work.",
    href: "/tools/watchlist",
    meta: "Monitor leads before accepting the job.",
    icon: Bell,
  },
  {
    group: "Before the job",
    title: "Contracts",
    body: "Create agreement packets, track signing links, and organize payment terms.",
    href: "/tools/contracts",
    meta: "Use before scheduling or buying materials.",
    icon: FileSignature,
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
    group: "During the job",
    title: "Reports",
    body: "Document positive experiences, payment issues, disputes, and job context.",
    href: "/reports",
    meta: "Moderated before public display.",
    icon: ClipboardCheck,
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
      <LaunchChecklist
        title="Use tools in order"
        items={[
          { label: "Before the job: search, watch, and set contract terms", done: true },
          { label: "During the job: preserve evidence and document facts", done: true },
          { label: "After an issue: use recovery or Florida lien service when payment needs structure", done: true },
        ]}
      />
      <View style={styles.metricGrid}>
        <CommandCard
          icon={Search}
          label="Before"
          title="Check first"
          body="Search and watch clients before you commit labor or materials."
          onPress={() => router.push("/search")}
        />
        <CommandCard
          icon={TrendingUp}
          label="After"
          title="Resolve faster"
          body="Use recovery or Florida lien service when payment needs structure."
          tone="gold"
          onPress={() => router.push("/tools/recovery")}
        />
      </View>
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
