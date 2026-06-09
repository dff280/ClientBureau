import Constants from "expo-constants"
import * as WebBrowser from "expo-web-browser"
import { Globe, LifeBuoy, LogOut, Share2, ShieldCheck, Smartphone, UserCheck, UserPlus } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { BureauHero, Card, IconActionRow, InsightCard, LaunchChecklist, MetricMini, PrimaryButton, Screen, SectionHeader, StatusPill, TrustBadge, styles } from "@/components/ui"
import { mobileFetch } from "@/lib/api"
import { siteUrl } from "@/lib/config"
import { inviteContractorToClientBureau, shareClientBureauApp } from "@/lib/share"
import type { ApiResult, DashboardPayload } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

function maskEmail(email?: string) {
  if (!email || !email.includes("@")) return "Signed-in Client Bureau account"
  const [name, domain] = email.split("@")
  const safeName = name.length <= 2 ? `${name.slice(0, 1)}***` : `${name.slice(0, 2)}***`
  return `${safeName}@${domain}`
}

export default function AccountScreen() {
  const { accessToken, user, signOut } = useAuth()
  const [dashboardResult, setDashboardResult] = useState<ApiResult<DashboardPayload>>()
  const version = Constants.expoConfig?.version ?? "0.4.1"
  const build = Constants.expoConfig?.android?.versionCode ?? 9

  useEffect(() => {
    if (!accessToken) return
    mobileFetch<DashboardPayload>("/api/mobile/dashboard", accessToken).then(setDashboardResult)
  }, [accessToken])

  const dashboard = dashboardResult?.ok ? dashboardResult.data.dashboard : undefined

  return (
    <Screen
      eyebrow="Account"
      title="Client Bureau account"
      body="Manage your session, support links, and full dashboard access from this phone."
      badge="Secure"
    >
      <BureauHero
        eyebrow="Contractor workspace"
        title={user?.fullName ?? "Client Bureau user"}
        body="Manage your mobile session, support options, and full web dashboard access."
      >
        <StatusPill label={user?.role ?? "contractor"} tone="gold" />
        <TrustBadge label="Authenticated" tone="green" />
      </BureauHero>

      <InsightCard
        icon={ShieldCheck}
        label="Mobile release"
        title={`Version ${version}`}
        metric={`Build ${build}`}
        body={maskEmail(user?.email)}
        tone="gold"
      />

      {dashboard ? (
        <Card>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{dashboard.contractor.businessName}</Text>
              <Text style={styles.body}>
                {dashboard.contractor.trade} / {dashboard.contractor.city}, {dashboard.contractor.state}
              </Text>
            </View>
            <StatusPill label={dashboard.contractor.verificationStatus} tone="green" />
          </View>
          <View style={styles.metricGrid}>
            <MetricMini label="Plan" value={dashboard.subscription?.tier ?? "Free"} />
            <MetricMini label="Reports" value={dashboard.stats.reportsSubmitted} />
            <MetricMini label="Searches" value={dashboard.stats.savedSearches} />
          </View>
        </Card>
      ) : null}

      <LaunchChecklist
        title="Account health"
        items={[
          { label: "Authenticated mobile session", done: true },
          { label: "Business profile available", done: Boolean(dashboard?.contractor.businessName) },
          { label: "Full dashboard available for billing, uploads, and support", done: true },
        ]}
      />

      <SectionHeader title="Account actions" body="Use the web dashboard for deeper account settings and support." />
      <IconActionRow
        icon={Globe}
        title="Open web dashboard"
        body="Manage full account settings, reports, billing, and support requests."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/dashboard`)}
      />
      <IconActionRow
        icon={Smartphone}
        title="Mobile app release page"
        body="Download the latest APK, review app version details, or share the Android install page."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/mobile-app`)}
      />
      <IconActionRow
        icon={Share2}
        title="Share the mobile app"
        body="Send the Client Bureau Android install page to another business owner."
        badge="Share"
        onPress={shareClientBureauApp}
      />
      <IconActionRow
        icon={UserPlus}
        title="Invite a contractor"
        body="Share the search-before-the-job workflow with another contractor."
        onPress={inviteContractorToClientBureau}
      />
      <IconActionRow
        icon={LifeBuoy}
        title="Support"
        body="Use the web dashboard for moderation, recovery, lien service, and billing questions."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/contact`)}
      />
      <IconActionRow
        icon={UserCheck}
        title="Verification and plan"
        body="Review business verification, usage, team access, and plan details in the full dashboard."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/dashboard/billing`)}
      />
      <IconActionRow
        icon={ShieldCheck}
        title="Privacy guardrail"
        body="The mobile app does not show private evidence paths or internal admin notes."
      />

      <Card>
        <IconActionRow icon={LogOut} title="End mobile session" body="Sign out from this phone." />
        <PrimaryButton onPress={signOut} title="Log out" tone="light" />
      </Card>
    </Screen>
  )
}
