import { Link } from "expo-router"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { mobileFetch } from "@/lib/api"
import type { ApiResult, DashboardPayload } from "@/lib/types"
import { Badge, Card, EmptyState, LoadingState, Screen, StatCard, styles } from "@/components/ui"
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
      <Card style={{ backgroundColor: "#07111f" }}>
        <Badge label={dashboard.subscription?.tier ?? "Free plan"} tone="gold" />
        <Text style={[styles.cardTitle, { color: "#ffffff", fontSize: 22 }]}>
          {dashboard.contractor.businessName}
        </Text>
        <Text style={[styles.body, { color: "#cbd5e1" }]}>
          {dashboard.contractor.trade} / {dashboard.contractor.city}, {dashboard.contractor.state}
        </Text>
        <Badge label={`Verification: ${dashboard.contractor.verificationStatus}`} tone="green" />
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <StatCard label="Reports" value={dashboard.stats.reportsSubmitted} />
        <StatCard label="Saved searches" value={dashboard.stats.savedSearches} />
        <StatCard label="Watched clients" value={counts?.watchlist ?? 0} />
        <StatCard label="Open recovery" value={counts?.managedRecoveryCases ?? 0} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Today’s work</Text>
        <Text style={styles.body}>
          Search a client before accepting work, check any alerts, and keep reports,
          contracts, recovery cases, and lien service packets organized in one place.
        </Text>
        <Link href="/search" style={{ color: "#07111f", fontWeight: "900" }}>
          Check a Client
        </Link>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Next best actions</Text>
        <Link href="/tools/contracts" style={{ color: "#07111f", fontWeight: "800" }}>
          Create a contract packet
        </Link>
        <Link href="/tools/recovery" style={{ color: "#07111f", fontWeight: "800" }}>
          Open payment recovery case
        </Link>
        <Link href="/tools/lien-service" style={{ color: "#07111f", fontWeight: "800" }}>
          Start Florida lien service
        </Link>
      </Card>

      {dashboard.reports.length ? (
        <Card>
          <Text style={styles.cardTitle}>Recent report status</Text>
          {dashboard.reports.slice(0, 3).map((report) => (
            <View key={report.id} style={{ gap: 4 }}>
              <Text style={{ color: "#07111f", fontWeight: "800" }}>{report.projectType}</Text>
              <Text style={styles.helper}>
                {report.reportCategory} / {report.status} / {report.projectCity}, {report.projectState}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No reports submitted yet"
          body="When a client experience needs documentation, start a report and attach evidence privately."
        />
      )}
    </Screen>
  )
}
