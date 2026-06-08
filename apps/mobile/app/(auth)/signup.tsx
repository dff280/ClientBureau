import { Link, Redirect } from "expo-router"
import { useState } from "react"
import { Text } from "react-native"

import { Card, ChoiceRow, Field, LoadingState, Message, PrimaryButton, Screen, styles } from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

const states = ["FL", "GA", "AL", "SC", "NC", "TX"]

export default function SignupScreen() {
  const { loading, session, signUp } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [trade, setTrade] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("FL")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  if (loading) return <LoadingState />
  if (session) return <Redirect href="/" />

  async function submit() {
    setBusy(true)
    setMessage(undefined)
    setError(undefined)

    const result = await signUp({
      fullName,
      email,
      password,
      businessName,
      trade,
      city,
      state,
    })

    if (result.ok) {
      setMessage(result.message)
    } else {
      setError(result.message)
    }

    setBusy(false)
  }

  return (
    <Screen eyebrow="Create account" title="Build your contractor protection workspace.">
      <Card>
        <Text style={styles.cardTitle}>Business owner profile</Text>
        <Text style={styles.body}>
          This information helps Client Bureau keep records clean and route your reports,
          contracts, and service cases correctly.
        </Text>
        <Field label="Full name" onChangeText={setFullName} value={fullName} />
        <Field keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
        <Field label="Password" onChangeText={setPassword} secureTextEntry value={password} />
        <Field label="Business name" onChangeText={setBusinessName} value={businessName} />
        <Field label="Trade or service" onChangeText={setTrade} placeholder="Roofing, remodeling, HVAC..." value={trade} />
        <Field label="City" onChangeText={setCity} value={city} />
        <ChoiceRow label="State" onChange={setState} options={states} value={state} />
        <Message tone="success" text={message} />
        <Message tone="error" text={error} />
        <PrimaryButton loading={busy} onPress={submit} title="Create account" />
      </Card>
      <Link href="/login" style={{ color: "#07111f", fontWeight: "800", textAlign: "center" }}>
        Already have an account? Sign in
      </Link>
    </Screen>
  )
}
