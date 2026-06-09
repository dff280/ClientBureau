import Constants from "expo-constants"
import * as WebBrowser from "expo-web-browser"
import { Globe, LifeBuoy, LogOut, ShieldCheck } from "lucide-react-native"
import { Text } from "react-native"

import { BureauHero, Card, IconActionRow, InsightCard, PrimaryButton, Screen, StatusPill, TrustBadge, styles } from "@/components/ui"
import { siteUrl } from "@/lib/config"
import { useAuth } from "@/providers/auth-provider"

export default function AccountScreen() {
  const { user, signOut } = useAuth()
  const version = Constants.expoConfig?.version ?? "0.3.3"
  const build = Constants.expoConfig?.android?.versionCode ?? 4

  return (
    <Screen eyebrow="Account" title="Client Bureau account">
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
        body={user?.email ?? "Signed-in Client Bureau account"}
        tone="gold"
      />

      <IconActionRow
        icon={Globe}
        title="Open web dashboard"
        body="Manage full account settings, reports, billing, and support requests."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/dashboard`)}
      />
      <IconActionRow
        icon={LifeBuoy}
        title="Support"
        body="Use the web dashboard for moderation, recovery, lien service, and billing questions."
        onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/contact`)}
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
