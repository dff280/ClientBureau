import { Link, Redirect } from "expo-router"
import { LogIn, ShieldCheck } from "lucide-react-native"
import { useState } from "react"
import { Text } from "react-native"

import { BureauHero, Card, ChoiceRow, Field, FormStepPanel, IconActionRow, InsightCard, LoadingState, Message, PrimaryButton, Screen, StatusPill, TrustBadge, styles } from "@/components/ui"
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
      <BureauHero
        eyebrow="Business owner setup"
        title="Create a cleaner record from day one."
        body="A complete business profile keeps searches, reports, contracts, and service cases easier to match."
      >
        <StatusPill label="Private profile" tone="gold" />
        <TrustBadge label="Clean data setup" tone="green" />
      </BureauHero>
      <InsightCard
        icon={ShieldCheck}
        label="Why this matters"
        title="Cleaner onboarding means cleaner client records."
        body="Accurate business, trade, city, and state details reduce mismatches and help future reports stay organized."
        tone="gold"
      />
      <FormStepPanel
        step="Step 1"
        title="Business owner profile"
        body="Use accurate business details so Client Bureau can keep records clean."
      >
        <Field label="Full name" onChangeText={setFullName} value={fullName} />
        <Field keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
        <Field label="Password" onChangeText={setPassword} secureTextEntry value={password} />
      </FormStepPanel>
      <FormStepPanel step="Step 2" title="Business details" body="Tell us what kind of work you do and where you operate.">
        <Field label="Business name" onChangeText={setBusinessName} value={businessName} />
        <Field label="Trade or service" onChangeText={setTrade} placeholder="Roofing, remodeling, HVAC..." value={trade} />
        <Field label="City" onChangeText={setCity} value={city} />
        <ChoiceRow label="State" onChange={setState} options={states} value={state} />
        <Message tone="success" text={message} />
        <Message tone="error" text={error} />
        <PrimaryButton loading={busy} onPress={submit} title="Create account" />
      </FormStepPanel>
      <Card>
        <StatusPill label="Moderated platform" tone="dark" />
        <Text style={styles.body}>
          Client Bureau uses moderated reports, private evidence summaries, and response-aware records.
        </Text>
        <IconActionRow icon={ShieldCheck} title="Built for documented contractor experiences" />
      </Card>
      <Link href="/login" asChild>
        <IconActionRow icon={LogIn} title="Already have an account?" body="Sign in to your mobile workspace." />
      </Link>
    </Screen>
  )
}
