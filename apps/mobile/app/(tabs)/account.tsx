import Constants from "expo-constants"
import * as WebBrowser from "expo-web-browser"
import { Globe, LifeBuoy, LogOut, ShieldCheck } from "lucide-react-native"
import { Text } from "react-native"

import { BureauHero, Card, IconActionRow, PrimaryButton, Screen, StatusPill, styles } from "@/components/ui"
import { siteUrl } from "@/lib/config"
import { useAuth } from "@/providers/auth-provider"

export default function AccountScreen() {
  const { user, signOut } = useAuth()
  const version = Constants.expoConfig?.version ?? "0.3.2"
  const build = Constants.expoConfig?.android?.versionCode ?? 3

  return (
    <Screen eyebrow="Account" title="Client Bureau account">
      <BureauHero
        eyebrow="Contractor workspace"
        title={user?.fullName ?? "Client Bureau user"}
        body="Manage your mobile session, support options, and full web dashboard access."
      >
        <StatusPill label={user?.role ?? "contractor"} tone="gold" />
      </BureauHero>

      <Card>
        <Text style={styles.cardTitle}>Account details</Text>
        <Text style={styles.body}>{user?.email}</Text>
        <Text style={styles.helper}>Version {version} / Android build {build}</Text>
      </Card>

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
