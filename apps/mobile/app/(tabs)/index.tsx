import { router } from "expo-router"
import { ClipboardCheck, FileSignature, Search, Siren, TrendingUp } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import {
  ActionDock,
  BureauHero,
  Card,
  CommandCard,
  IconActionRow,
  InsightCard,
  LoadingState,
  MetricTile,
  PremiumEmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  SuggestionChip,
  StatusTimeline,
  StatusPill,
  TrustBadge,
  styles,
} from "@/components/ui"
import { mobileFetch } from "@/lib/api"
import type { ApiResult, DashboardPayload } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

export default function HomeScreen() {
  const { accessToken, user } = useAuth()
  const [result, setResult] = useState<ApiResult<DashboardPayload>>()

  useEffect(() => {
    if (!accessToken) return
    mobileFetch<DashboardPayload>("/api/mobile/dashboard", accessToken).then(setResult)
  }, [accessToken])

  if (!result) return <LoadingState label="Loading your contractor workspace..." />

  if (!result.ok) {
    return (
      <Screen eyebrow="Dashboard" title="Workspace needs attention">
        <PremiumEmptyState title="Could not load dashboard" body={result.message} />
      </Screen>
    )
  }

  const { dashboard, riskOps } = result.data
  const counts = riskOps?.counts

  return (
    <Screen
      eyebrow="Home"
      title={`Welcome${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.`}
      body="Start with a client search, then move into reports, contracts, recovery, or evidence when the job needs protection."
      badge="Secure"
    >
      <BureauHero
        eyebrow="Mobile command center"
        title="Check the client before you take the job."
        body="Check the client before you commit labor, materials, scheduling, or payment follow-up."
      >
        <StatusPill label={dashboard.subscription?.tier ?? "Free plan"} tone="gold" />
        <Text style={[styles.cardTitle, { color: "#ffffff", fontSize: 22 }]}>
          {dashboard.contractor.businessName}
        </Text>
        <Text style={[styles.body, { color: "#cbd5e1" }]}>
          {dashboard.contractor.trade} / {dashboard.contractor.city}, {dashboard.contractor.state}
        </Text>
        <TrustBadge label={`Verification: ${dashboard.contractor.verificationStatus}`} tone="green" />
        <PrimaryButton title="Check a Client" tone="light" onPress={() => router.push("/search")} />
      </BureauHero>

      <View style={styles.metricGrid}>
        <MetricTile label="Searches saved" value={dashboard.stats.savedSearches} helper="Use before accepting work" />
        <MetricTile label="Reports filed" value={dashboard.stats.reportsSubmitted} helper="Private until approved" />
        <MetricTile label="Watched clients" value={counts?.watchlist ?? 0} helper={`${counts?.alerts ?? 0} alert(s)`} />
        <MetricTile label="Open recovery" value={counts?.managedRecoveryCases ?? 0} helper="Resolution Desk" tone="gold" />
      </View>

      <SectionHeader
        title="Today's work"
        body="The highest-value actions for a contractor checking a lead, setting terms, or protecting payment."
      />
      <View style={styles.metricGrid}>
        <CommandCard
          icon={Search}
          label="Start here"
          title="Check a Client"
          body="Search names, businesses, cities, and private identifiers before you commit."
          metric="01"
          tone="gold"
          onPress={() => router.push("/search")}
        />
        <CommandCard
          icon={FileSignature}
          label="Before scheduling"
          title="Create contract"
          body="Prepare scope, payment terms, and signing links before the job starts."
          metric={counts?.contractPackets ?? 0}
          onPress={() => router.push("/tools/contracts")}
        />
      </View>

      <ActionDock>
        <Text style={styles.cardTitle}>Next best action</Text>
        <Text style={styles.body}>
          Pick the workflow that matches where the job stands. Records stay private unless a report is approved for public display.
        </Text>
        <View style={styles.chipRail}>
          <SuggestionChip label="New lead" tone="gold" onPress={() => router.push("/search")} />
          <SuggestionChip label="Need a contract" onPress={() => router.push("/tools/contracts")} />
          <SuggestionChip label="Unpaid invoice" onPress={() => router.push("/tools/recovery")} />
        </View>
        <IconActionRow
          icon={Search}
          title="Check a Client"
          body="Search public profiles, private matches, and saved signals."
          badge="Start here"
          onPress={() => router.push("/search")}
        />
        <IconActionRow
          icon={ClipboardCheck}
          title="Document a client experience"
          body="Submit a positive report or payment issue for moderation."
          onPress={() => router.push("/reports")}
        />
      </ActionDock>

      <InsightCard
        icon={ClipboardCheck}
        label="How to use Client Bureau"
        title="Search before the job. Document during the job. Protect payment after."
        body="Client Bureau keeps the mobile workflow focused on the actions contractors take every day."
        tone="gold"
      />

      <SectionHeader
        title="Job-stage tools"
        body="Before, during, and after the job: use the right workflow at the right moment."
      />
      <IconActionRow
        icon={FileSignature}
        title="Create a contract packet"
        body="Prepare a private agreement clients can review and sign."
        onPress={() => router.push("/tools/contracts")}
      />
      <IconActionRow
        icon={TrendingUp}
        title="Open payment recovery case"
        body="Request managed help documenting and resolving unpaid invoices."
        onPress={() => router.push("/tools/recovery")}
      />
      <IconActionRow
        icon={Siren}
        title="Start Florida lien service"
        body="Begin a private Florida notice or filing review workflow."
        onPress={() => router.push("/tools/lien-service")}
      />
      <IconActionRow
        icon={Siren}
        title="Review all tools"
        body="Contracts, recovery, lien service, evidence, reports, and watchlist."
        onPress={() => router.push("/tools")}
      />

      {dashboard.reports.length ? (
        <Card>
          <Text style={styles.cardTitle}>Recent report status</Text>
          <StatusTimeline
            items={dashboard.reports.slice(0, 3).map((report) => ({
              title: report.projectType,
              body: `${report.reportCategory} / ${report.status}`,
              meta: `${report.projectCity}, ${report.projectState}`,
              tone: report.status === "approved" ? "green" : "gold",
            }))}
          />
        </Card>
      ) : (
        <PremiumEmptyState
          title="No reports submitted yet"
          body="When a client experience needs documentation, start a report and attach evidence privately."
          actionTitle="Submit report"
          onAction={() => router.push("/reports")}
        />
      )}

    </Screen>
  )
}
