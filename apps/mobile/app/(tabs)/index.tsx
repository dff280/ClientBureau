import { router } from "expo-router"
import { Bell, ClipboardCheck, FileSignature, FolderLock, Search, Share2, Siren, TrendingUp, UserPlus } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import {
  ActionDock,
  BureauHero,
  Card,
  CommandCard,
  IconActionRow,
  InsightCard,
  LaunchChecklist,
  LoadingState,
  MetricTile,
  PremiumEmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatusTimeline,
  StatusPill,
  TrustBadge,
  styles,
} from "@/components/ui"
import { mobileFetch } from "@/lib/api"
import { inviteContractorToClientBureau, shareClientBureauApp } from "@/lib/share"
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
      title={`Today's work${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.`}
      body="Check the client first, then pick the right protection workflow for where the job stands."
      badge="Secure"
    >
      <BureauHero
        eyebrow="Mobile command center"
        title="Check the client before you take the job."
        body="Search first. Then set terms, preserve evidence, or open a private service case when the job needs structure."
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

      <ActionDock>
        <Text style={styles.cardTitle}>Start here</Text>
        <Text style={styles.body}>
          Most contractors only need three moves from the phone: check the lead, set the terms, or document an issue.
        </Text>
        <IconActionRow
          icon={Search}
          title="Check a Client"
          body="Run the search before scheduling, quoting, or buying materials."
          badge="First"
          onPress={() => router.push("/search")}
        />
        <IconActionRow
          icon={FileSignature}
          title="Create contract packet"
          body="Prepare scope, payment terms, and signing links before work starts."
          onPress={() => router.push("/tools/contracts")}
        />
        <IconActionRow
          icon={TrendingUp}
          title="Get help recovering payment"
          body="Open a private Resolution Desk case when an invoice needs structured follow-up."
          onPress={() => router.push("/tools/recovery")}
        />
      </ActionDock>

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

      <LaunchChecklist
        title="Workspace readiness"
        items={[
          { label: "Search a lead before scheduling or buying materials", done: dashboard.stats.savedSearches > 0 },
          { label: "Create contract packet before the job starts", done: (counts?.contractPackets ?? 0) > 0 },
          { label: "Keep private evidence ready for reports or service cases", done: (counts?.evidenceItems ?? dashboard.stats.evidenceItems) > 0 },
        ]}
      />

      <SectionHeader
        title="Alerts and readiness"
        body="A quick pulse on what needs attention before the next job moves forward."
      />
      <View style={styles.metricGrid}>
        <CommandCard
          icon={counts?.alerts ? Bell : ClipboardCheck}
          label={counts?.alerts ? "Needs attention" : "Clear"}
          title={counts?.alerts ? "Review alerts" : "No urgent alerts"}
          body={
            counts?.alerts
              ? "Check watched clients and recent activity before accepting more work."
              : "Your mobile workspace is clear. Start with a client search when a new lead comes in."
          }
          metric={counts?.alerts ?? 0}
          tone={counts?.alerts ? "gold" : "light"}
          onPress={() => router.push(counts?.alerts ? "/tools/watchlist" : "/search")}
        />
        <CommandCard
          icon={FolderLock}
          label="Documents"
          title="Evidence status"
          body="Keep invoices, screenshots, contracts, and photos organized privately."
          metric={counts?.evidenceItems ?? dashboard.stats.evidenceItems}
          onPress={() => router.push("/tools/evidence")}
        />
      </View>

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
        body="Search, contracts, reports, recovery, lien service, evidence, and watchlist."
        onPress={() => router.push("/tools")}
      />
      <IconActionRow
        icon={UserPlus}
        title="Invite another contractor"
        body="Share Client Bureau with someone who should check clients before taking jobs."
        badge="Share"
        onPress={inviteContractorToClientBureau}
      />
      <IconActionRow
        icon={Share2}
        title="Share Client Bureau"
        body="Send the mobile app page to another business owner."
        onPress={shareClientBureauApp}
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
