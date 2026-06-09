import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { MessageCircle, ShieldCheck, TrendingUp } from "lucide-react-native"

import {
  BureauHero,
  Card,
  ChoiceRow,
  Field,
  FormStepPanel,
  IconActionRow,
  LoadingState,
  Message,
  PremiumEmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatusPill,
  TimelineItem,
  TrustBadge,
  styles,
} from "@/components/ui"
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
  const [showForm, setShowForm] = useState(false)
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
    <Screen eyebrow="Resolution Desk" title="Payment Recovery">
      <BureauHero
        eyebrow="Managed recovery workflow"
        title="Get organized help on unpaid invoices."
        body="Submit the facts, upload supporting documents on the web dashboard, and track staff-reviewed follow-up toward a contractor-direct resolution."
      >
        <StatusPill label="Private case record" tone="gold" />
        <TrustBadge label="Resolution desk" tone="green" />
      </BureauHero>
      <IconActionRow
        icon={MessageCircle}
        title={showForm ? "Close recovery intake" : "Open recovery case"}
        body="Use this when a payment issue needs documented follow-up and a clear next step."
        badge="Staff review"
        onPress={() => setShowForm(!showForm)}
      />
      <Card>
        <Text style={styles.cardTitle}>Plain-English guardrail</Text>
        <Text style={styles.body}>
          Recovery cases are private service records. Client Bureau helps document outreach and resolution options; payments remain contractor-direct.
        </Text>
      </Card>
      {showForm ? (
        <>
        <FormStepPanel
          step="Step 1"
          title="Client and project location"
          body="Give staff enough context to identify the case without publishing private identifiers."
        >
          <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
          <Field keyboardType="email-address" label="Client email" value={form.clientEmail} onChangeText={(v) => setForm({ ...form, clientEmail: v })} />
          <Field label="City" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
          <ChoiceRow label="State" options={["FL", "GA", "AL", "SC", "NC", "TX"]} value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        </FormStepPanel>
        <FormStepPanel
          step="Step 2"
          title="Amount and invoice age"
          body="These details help prioritize next actions and document the timeline."
        >
          <Field keyboardType="numeric" label="Amount due" value={form.amountDue} onChangeText={(v) => setForm({ ...form, amountDue: v })} />
          <Field keyboardType="numeric" label="Invoice age in days" value={form.invoiceAgeDays} onChangeText={(v) => setForm({ ...form, invoiceAgeDays: v })} />
          <ChoiceRow label="Preferred channel" options={["email", "phone", "letter", "client_portal"]} value={form.preferredChannel} onChange={(v) => setForm({ ...form, preferredChannel: v })} />
        </FormStepPanel>
        <FormStepPanel
          step="Step 3"
          title="What happened?"
          body="Keep it factual. Staff can ask for more details if documents are missing."
        >
          <Field multiline label="Case summary" value={form.summary} onChangeText={(v) => setForm({ ...form, summary: v })} />
          <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
          <PrimaryButton loading={busy} onPress={submit} title="Submit recovery case" />
        </FormStepPanel>
        </>
      ) : (
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      )}
      {result.ok
        ? result.data.managedRecoveryCases.length ? (
          <>
            <SectionHeader title="Recovery cases" body="Track amount due, age, status, and next action." />
            {result.data.managedRecoveryCases.map((item) => (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{item.clientName}</Text>
                  <StatusPill label={item.status.replaceAll("_", " ")} tone="blue" />
                </View>
                <Text style={styles.body}>${item.amountDue.toLocaleString()} / {item.invoiceAgeDays} days old</Text>
                <TimelineItem
                  title="Next action"
                  body={item.nextAction}
                  meta="Contractor-direct payment resolution"
                  tone={item.status === "resolved" ? "green" : "gold"}
                />
                <IconActionRow
                  icon={item.status === "resolved" ? ShieldCheck : TrendingUp}
                  title={item.status === "resolved" ? "Resolution documented" : "Track recovery progress"}
                  body="Use the web dashboard for documents, communication notes, and staff updates."
                  badge={item.status === "resolved" ? "Resolved" : "Active"}
                />
              </Card>
            ))}
          </>
        ) : (
          <PremiumEmptyState
            title="No recovery cases yet"
            body="Open a case when an invoice needs documented follow-up."
            actionTitle="Open case"
            onAction={() => setShowForm(true)}
          />
        )
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
