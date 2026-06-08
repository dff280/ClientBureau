import { Link, Redirect } from "expo-router"
import { useState } from "react"
import { Text } from "react-native"

import { Card, Field, LoadingState, Message, PrimaryButton, Screen, styles } from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

export default function LoginScreen() {
  const { configured, loading, session, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  if (loading) return <LoadingState />
  if (session) return <Redirect href="/" />

  async function submit() {
    setBusy(true)
    setError(undefined)
    setMessage(undefined)

    const result = await signIn(email.trim(), password)

    if (result.ok) {
      setMessage("Signed in. Loading your workspace.")
    } else {
      setError(result.message)
    }

    setBusy(false)
  }

  return (
    <Screen eyebrow="Client Bureau Mobile" title="Check the client before you take the job.">
      {!configured ? (
        <Message
          tone="error"
          text="Mobile Supabase settings are missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
        />
      ) : null}
      <Card>
        <Text style={styles.cardTitle}>Sign in</Text>
        <Text style={styles.body}>
          Use your Client Bureau contractor account to load your dashboard, search, reports,
          contracts, recovery cases, lien service, and evidence vault.
        </Text>
        <Field
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@business.com"
          value={email}
        />
        <Field
          label="Password"
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          value={password}
        />
        <Message tone="success" text={message} />
        <Message tone="error" text={error} />
        <PrimaryButton loading={busy} onPress={configured ? submit : undefined} title="Sign in" />
      </Card>
      <Link href="/signup" style={{ color: "#07111f", fontWeight: "800", textAlign: "center" }}>
        Create a contractor account
      </Link>
    </Screen>
  )
}
