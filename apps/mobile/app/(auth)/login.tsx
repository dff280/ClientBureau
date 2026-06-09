import { Link, Redirect } from "expo-router"
import { ShieldCheck } from "lucide-react-native"
import { useState } from "react"
import { Text } from "react-native"

import { BureauHero, Card, Field, IconActionRow, InsightCard, LoadingState, Message, PrimaryButton, Screen, StatusPill, TrustBadge, styles } from "@/components/ui"
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
          text="Mobile sign-in is temporarily unavailable. Please use the web dashboard while support checks the app connection."
        />
      ) : null}
      <BureauHero
        eyebrow="Contractor protection"
        title="Know who you are working with before the job starts."
        body="Search client records, manage reports, organize contracts, and track payment protection tools from your phone."
      >
        <StatusPill label="Private matching" tone="gold" />
        <TrustBadge label="Secure mobile session" tone="green" />
      </BureauHero>
      <InsightCard
        icon={ShieldCheck}
        label="Trust platform"
        title="Built for business owners who need clean records."
        body="The app focuses on search, documentation, contracts, recovery, lien service, evidence, and account status."
        tone="gold"
      />
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
      <Link href="/signup" asChild>
        <IconActionRow
          icon={ShieldCheck}
          title="Create a contractor account"
          body="Set up your mobile workspace and start checking clients."
        />
      </Link>
    </Screen>
  )
}
