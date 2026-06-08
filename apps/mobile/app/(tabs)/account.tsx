import Constants from "expo-constants"
import { Text } from "react-native"

import { Card, PrimaryButton, Screen, styles } from "@/components/ui"
import { apiBaseUrl, siteUrl } from "@/lib/config"
import { useAuth } from "@/providers/auth-provider"

export default function AccountScreen() {
  const { user, signOut } = useAuth()

  return (
    <Screen eyebrow="Account" title="Client Bureau account">
      <Card>
        <Text style={styles.cardTitle}>{user?.fullName ?? "Contractor account"}</Text>
        <Text style={styles.body}>{user?.email}</Text>
        <Text style={styles.helper}>Role: {user?.role ?? "contractor"}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>App environment</Text>
        <Text style={styles.body}>API: {apiBaseUrl}</Text>
        <Text style={styles.body}>Site: {siteUrl}</Text>
        <Text style={styles.helper}>Version: {Constants.expoConfig?.version ?? "0.3.0"}</Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Support</Text>
        <Text style={styles.body}>
          For billing, report moderation, recovery, lien service, or account questions, use the
          Client Bureau support links on the web dashboard.
        </Text>
      </Card>
      <PrimaryButton onPress={signOut} title="Log out" tone="light" />
    </Screen>
  )
}
