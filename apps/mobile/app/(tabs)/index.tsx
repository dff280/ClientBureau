import { router } from "expo-router"
import { ClipboardCheck, FileSignature, Search, Siren, TrendingUp } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import {
  Badge,
  BureauHero,
  Card,
  EmptyState,
  IconActionRow,
  LoadingState,
  MetricTile,
  Screen,
  SectionHeader,
  StatusPill,
  TimelineItem,
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
        <EmptyState title="Could not load dashboard" body={result.message} />
      </Screen>
    )
  }

  const { dashboard, riskOps } = result.data
  const counts = riskOps?.counts

  return (
    <Screen eyebrow="Contractor command center" title={`Welcome${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.`}>
      <BureauHero
        eyebrow="Mobile command center"
        title="Check, document, and protect the job."
        body="Use Client Bureau before you commit labor, materials, scheduling, or payment follow-up."
      >
        <StatusPill label={dashboard.subscription?.tier ?? "Free plan"} tone="gold" />
        <Text style={[styles.cardTitle, { color: "#ffffff", fontSize: 22 }]}>
          {dashboard.contractor.businessName}
        </Text>
        <Text style={[styles.body, { color: "#cbd5e1" }]}>
          {dashboard.contractor.trade} / {dashboard.contractor.city}, {dashboard.contractor.state}
        </Text>
        <Badge label={`Verification: ${dashboard.contractor.verificationStatus}`} tone="green" />
      </BureauHero>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <MetricTile label="Reports" value={dashboard.stats.reportsSubmitted} />
        <MetricTile label="Saved searches" value={dashboard.stats.savedSearches} />
        <MetricTile label="Watched clients" value={counts?.watchlist ?? 0} />
        <MetricTile label="Open recovery" value={counts?.managedRecoveryCases ?? 0} tone="gold" />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Today's work</Text>
        <Text style={styles.body}>
          Search a client before accepting work, check any alerts, and keep reports,
          contracts, recovery cases, and lien service packets organized in one place.
        </Text>
        <IconActionRow
          icon={Search}
          title="Check a Client"
          body="Search public profiles, private matches, and saved signals."
          onPress={() => router.push("/search")}
        />
      </Card>

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
          {dashboard.reports.slice(0, 3).map((report) => (
            <TimelineItem
              key={report.id}
              title={report.projectType}
              body={`${report.reportCategory} / ${report.status}`}
              meta={`${report.projectCity}, ${report.projectState}`}
              tone={report.status === "approved" ? "green" : "gold"}
            />
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No reports submitted yet"
          body="When a client experience needs documentation, start a report and attach evidence privately."
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
