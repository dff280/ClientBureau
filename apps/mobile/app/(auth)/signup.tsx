import { Redirect, router } from "expo-router"
import { useState } from "react"

import {
  AuthHeroPanel,
  AuthShell,
  AuthSwitchCard,
  ChoiceRow,
  Field,
  LoadingState,
  Message,
  PasswordField,
  PrimaryButton,
  SecondaryButton,
  SecureFormCard,
  SegmentedTabs,
  TrustProofStrip,
} from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

const states = ["FL", "GA", "AL", "SC", "NC", "TX"]
const proofItems = ["Business profile", "Clean data", "Private records"]

export default function SignupScreen() {
  const { loading, session, signUp } = useAuth()
  const [step, setStep] = useState("Account")
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
    <AuthShell>
      <AuthHeroPanel
        eyebrow="Create account"
        title="Build your contractor protection workspace."
        body="Set up your business profile so search, reports, contracts, recovery, and service cases stay matched to the right records."
      />
      <TrustProofStrip items={proofItems} />
      <SegmentedTabs options={["Account", "Business"]} value={step} onChange={setStep} />
      <SecureFormCard
        title={step === "Account" ? "Your account" : "Business details"}
        body={step === "Account" ? "Start with the owner account used to sign in." : "Add the business identity contractors and records should use."}
      >
        {step === "Account" ? (
          <>
            <Field label="Full name" onChangeText={setFullName} value={fullName} />
            <Field keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
            <PasswordField onChangeText={setPassword} value={password} />
            <PrimaryButton onPress={() => setStep("Business")} title="Continue" />
          </>
        ) : (
          <>
            <Field label="Business name" onChangeText={setBusinessName} value={businessName} />
            <Field label="Trade or service" onChangeText={setTrade} placeholder="Roofing, remodeling, HVAC..." value={trade} />
            <Field label="City" onChangeText={setCity} value={city} />
            <ChoiceRow label="State" onChange={setState} options={states} value={state} />
            <Message tone="success" text={message} />
            <Message tone="error" text={error} />
            <PrimaryButton loading={busy} onPress={submit} title="Create account" />
            <SecondaryButton onPress={() => setStep("Account")} title="Back to account details" />
          </>
        )}
      </SecureFormCard>
      <AuthSwitchCard
        action="Sign in"
        label="Already have an account?"
        onPress={() => router.push("/login")}
      />
    </AuthShell>
  )
}
