import Constants from "expo-constants"
import * as WebBrowser from "expo-web-browser"
import { Text } from "react-native"

import { ActionRow, Card, PrimaryButton, Screen, styles } from "@/components/ui"
import { apiBaseUrl, siteUrl } from "@/lib/config"
import { useAuth } from "@/providers/auth-provider"

export default function AccountScreen() {
  const { user, signOut } = useAuth()
  const version = Constants.expoConfig?.version ?? "0.3.1"
  const build = Constants.expoConfig?.android?.versionCode ?? 2

  return (
    <Screen eyebrow="Account" title="Client Bureau account">
      <Card>
        <Text style={styles.cardTitle}>{user?.fullName ?? "Contractor account"}</Text>
        <Text style={styles.body}>{user?.email}</Text>
        <Text style={styles.helper}>Role: {user?.role ?? "contractor"}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>App version</Text>
        <Text style={styles.body}>Version {version} / Android build {build}</Text>
        <Text style={styles.helper}>Connected to {apiBaseUrl}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Support</Text>
        <Text style={styles.body}>
          For billing, report moderation, recovery, lien service, or account questions, use the
          Client Bureau support links on the web dashboard.
        </Text>
        <ActionRow
          title="Open web dashboard"
          body="Manage full account settings and support requests."
          onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/dashboard`)}
        />
      </Card>
      <PrimaryButton onPress={signOut} title="Log out" tone="light" />
    </Screen>
  )
}
