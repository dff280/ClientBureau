import { useEffect, useState } from "react"
import { Text } from "react-native"

import { Card, ChoiceRow, Field, LoadingState, Message, PrimaryButton, Screen, styles } from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type RecoveryCase = {
  id: string
  clientName: string
  amountDue: number
  invoiceAgeDays: number
  status: string
  nextAction: string
}
type RecoveryPayload = { managedRecoveryCases: RecoveryCase[] }

export default function RecoveryScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<RecoveryPayload>>()
  const [message, setMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    city: "",
    state: "FL",
    amountDue: "",
    invoiceAgeDays: "",
    preferredChannel: "email",
    summary: "",
  })

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<RecoveryPayload>("/api/mobile/recovery", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function submit() {
    if (!accessToken) return
    setBusy(true)
    const created = await mobileFetch("/api/mobile/recovery", accessToken, {
      method: "POST",
      body: jsonBody({
        ...form,
        amountDue: Number(form.amountDue || 0),
        invoiceAgeDays: Number(form.invoiceAgeDays || 0),
        factualCertification: true,
        serviceTermsCertification: true,
      }),
    })
    setMessage(created.message)
    setBusy(false)
    if (created.ok) load()
  }

  if (!result) return <LoadingState label="Loading recovery cases..." />

  return (
    <Screen eyebrow="Resolution Desk" title="Get help recovering payment.">
      <Card>
        <Text style={styles.cardTitle}>Managed payment recovery</Text>
        <Text style={styles.body}>
          Client Bureau staff can review your case, contact the client, document the response,
          and help seek a contractor-direct resolution. This is not automated collection.
        </Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Open a case</Text>
        <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
        <Field keyboardType="email-address" label="Client email" value={form.clientEmail} onChangeText={(v) => setForm({ ...form, clientEmail: v })} />
        <Field label="City" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
        <ChoiceRow label="State" options={["FL", "GA", "AL", "SC", "NC", "TX"]} value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Field keyboardType="numeric" label="Amount due" value={form.amountDue} onChangeText={(v) => setForm({ ...form, amountDue: v })} />
        <Field keyboardType="numeric" label="Invoice age in days" value={form.invoiceAgeDays} onChangeText={(v) => setForm({ ...form, invoiceAgeDays: v })} />
        <ChoiceRow label="Preferred channel" options={["email", "phone", "letter", "client_portal"]} value={form.preferredChannel} onChange={(v) => setForm({ ...form, preferredChannel: v })} />
        <Field multiline label="Case summary" value={form.summary} onChangeText={(v) => setForm({ ...form, summary: v })} />
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
        <PrimaryButton loading={busy} onPress={submit} title="Submit recovery case" />
      </Card>
      {result.ok
        ? result.data.managedRecoveryCases.map((item) => (
            <Card key={item.id}>
              <Text style={styles.cardTitle}>{item.clientName}</Text>
              <Text style={styles.body}>${item.amountDue.toLocaleString()} / {item.invoiceAgeDays} days old</Text>
              <Text style={styles.helper}>{item.status} / {item.nextAction}</Text>
            </Card>
          ))
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
