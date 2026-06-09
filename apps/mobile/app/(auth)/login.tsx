import { Redirect, router } from "expo-router"
import { useState } from "react"

import {
  AuthHeroPanel,
  AuthShell,
  AuthSwitchCard,
  Field,
  LoadingState,
  Message,
  PasswordField,
  PrimaryButton,
  SecureFormCard,
  TrustProofStrip,
} from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

const proofItems = ["Private matching", "Secure session", "Moderated records"]

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
    <AuthShell>
      {!configured ? (
        <Message
          tone="error"
          text="Mobile sign-in is temporarily unavailable. Please use the web dashboard while support checks the app connection."
        />
      ) : null}
      <AuthHeroPanel
        title="Check the client before you take the job."
        body="Search client records, manage reports, contracts, recovery, lien service, and private evidence from one secure mobile workspace."
      />
      <TrustProofStrip items={proofItems} />
      <SecureFormCard title="Sign in" body="Access your contractor workspace.">
        <Field
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@business.com"
          value={email}
        />
        <PasswordField onChangeText={setPassword} value={password} />
        <Message tone="success" text={message} />
        <Message tone="error" text={error} />
        <PrimaryButton loading={busy} onPress={configured ? submit : undefined} title="Sign in" />
      </SecureFormCard>
      <AuthSwitchCard
        action="Create account"
        label="New to Client Bureau?"
        onPress={() => router.push("/signup")}
      />
    </AuthShell>
  )
}
