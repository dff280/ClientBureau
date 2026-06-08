import { Link, Stack } from "expo-router"
import { Text } from "react-native"

import { Card, Screen, styles } from "@/components/ui"

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Client Bureau" }} />
      <Screen eyebrow="Not found" title="This Client Bureau screen is not available.">
        <Card>
          <Text style={styles.body}>
            Return to the contractor command center to search clients, review reports,
            or open your protection tools.
          </Text>
          <Link href="/" style={{ color: "#07111f", fontWeight: "900" }}>
            Go to dashboard
          </Link>
        </Card>
      </Screen>
    </>
  )
}
