import { Link } from "expo-router"
import { Text } from "react-native"

import { Card, Screen, styles } from "@/components/ui"

const tools = [
  {
    title: "Contracts",
    body: "Create agreement packets, track signing links, and organize payment terms.",
    href: "/tools/contracts",
  },
  {
    title: "Payment Recovery",
    body: "Open a managed Resolution Desk case and track staff review and next actions.",
    href: "/tools/recovery",
  },
  {
    title: "Florida Lien Service",
    body: "Prepare Florida notice or filing cases with private documentation and authorization.",
    href: "/tools/lien-service",
  },
  {
    title: "Evidence Vault",
    body: "Review private evidence summaries without exposing storage files publicly.",
    href: "/tools/evidence",
  },
  {
    title: "Watchlist",
    body: "Track clients, saved searches, and private alerts before committing to new work.",
    href: "/tools/watchlist",
  },
]

export default function ToolsScreen() {
  return (
    <Screen eyebrow="Protection tools" title="Daily tools for safer jobs.">
      {tools.map((tool) => (
        <Card key={tool.href}>
          <Text style={styles.cardTitle}>{tool.title}</Text>
          <Text style={styles.body}>{tool.body}</Text>
          <Link href={tool.href} style={{ color: "#07111f", fontWeight: "900" }}>
            Open {tool.title}
          </Link>
        </Card>
      ))}
    </Screen>
  )
}
