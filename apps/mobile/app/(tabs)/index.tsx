import { router } from "expo-router"
import { ClipboardCheck, FileSignature, Search, Siren, TrendingUp } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import {
  ActionDock,
  BureauHero,
  Card,
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
        title="Your job protection desk."
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
        <MetricTile label="Reports filed" value={dashboard.stats.reportsSubmitted} />
        <MetricTile label="Saved searches" value={dashboard.stats.savedSearches} />
        <MetricTile label="Watched clients" value={counts?.watchlist ?? 0} />
        <MetricTile label="Open recovery" value={counts?.managedRecoveryCases ?? 0} tone="gold" />
      </View>

      <ActionDock>
        <Text style={styles.cardTitle}>Start here</Text>
        <Text style={styles.body}>
          Choose the action that matches the job in front of you. Everything here stays private unless a report is approved for public display.
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
        label="Protection posture"
        title="Search before the job. Document during the job. Protect payment after."
        body="Client Bureau keeps the mobile workflow focused on the actions contractors take every day."
        tone="gold"
      />

      <SectionHeader
        title="Next best actions"
        body="Start with the tool that protects the job you are about to take or the payment issue you are already handling."
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

      <IconActionRow
        icon={ClipboardCheck}
        title="Open full tool list"
        body="Contracts, recovery, lien service, evidence, and watchlist."
        onPress={() => router.push("/tools")}
      />
    </Screen>
  )
}
