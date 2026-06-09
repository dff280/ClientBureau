import { Redirect, router } from "expo-router"
import { useRef, useState } from "react"
import type { TextInput } from "react-native"

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
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const tradeRef = useRef<TextInput>(null)
  const cityRef = useRef<TextInput>(null)
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

  const canContinue =
    fullName.trim().length > 1 &&
    email.trim().length > 3 &&
    password.length >= 6
  const canCreate =
    canContinue &&
    businessName.trim().length > 1 &&
    trade.trim().length > 1 &&
    city.trim().length > 1 &&
    !busy

  async function submit() {
    if (!canCreate) return
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
            <Field
              label="Full name"
              onChangeText={setFullName}
              onSubmitEditing={() => emailRef.current?.focus()}
              returnKeyType="next"
              submitBehavior="submit"
              textContentType="name"
              value={fullName}
            />
            <Field
              ref={emailRef}
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              onSubmitEditing={() => passwordRef.current?.focus()}
              returnKeyType="next"
              submitBehavior="submit"
              autoComplete="email"
              textContentType="emailAddress"
              importantForAutofill="yes"
              value={email}
            />
            <PasswordField
              ref={passwordRef}
              autoComplete="new-password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                if (canContinue) setStep("Business")
              }}
              returnKeyType="next"
              submitBehavior="submit"
              textContentType="newPassword"
              value={password}
            />
            <PrimaryButton onPress={canContinue ? () => setStep("Business") : undefined} title="Continue" />
          </>
        ) : (
          <>
            <Field
              label="Business name"
              onChangeText={setBusinessName}
              onSubmitEditing={() => tradeRef.current?.focus()}
              returnKeyType="next"
              submitBehavior="submit"
              value={businessName}
            />
            <Field
              ref={tradeRef}
              label="Trade or service"
              onChangeText={setTrade}
              onSubmitEditing={() => cityRef.current?.focus()}
              placeholder="Roofing, remodeling, HVAC..."
              returnKeyType="next"
              submitBehavior="submit"
              value={trade}
            />
            <Field
              ref={cityRef}
              label="City"
              onChangeText={setCity}
              returnKeyType="done"
              submitBehavior="submit"
              value={city}
            />
            <ChoiceRow label="State" onChange={setState} options={states} value={state} />
            <Message tone="success" text={message} />
            <Message tone="error" text={error} />
            <PrimaryButton loading={busy} onPress={canCreate ? submit : undefined} title="Create account" />
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
