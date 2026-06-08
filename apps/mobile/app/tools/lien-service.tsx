import { useEffect, useState } from "react"
import { Text } from "react-native"

import { Card, ChoiceRow, Field, LoadingState, Message, PrimaryButton, Screen, styles } from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type LienCase = {
  id: string
  clientName: string
  propertyCounty: string
  amountDue: number
  filingDeadline?: string
  status: string
  nextAction: string
}
type LienPayload = { floridaLienCases: LienCase[] }

export default function LienServiceScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<LienPayload>>()
  const [message, setMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    workflowType: "notice_packet",
    clientName: "",
    ownerName: "",
    propertyCounty: "",
    propertyCity: "",
    projectType: "",
    contractorRole: "direct_contractor",
    contractAmount: "",
    amountDue: "",
    lastWorkDate: "",
    noticeHistory: "",
    privateSummary: "",
  })

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<LienPayload>("/api/mobile/lien-service", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function submit() {
    if (!accessToken) return
    setBusy(true)
    const created = await mobileFetch("/api/mobile/lien-service", accessToken, {
      method: "POST",
      body: jsonBody({
        ...form,
        state: "FL",
        contractAmount: Number(form.contractAmount || 0),
        amountDue: Number(form.amountDue || 0),
        noticeHistory: form.noticeHistory || "No prior notice details provided in mobile intake.",
        privateSummary: form.privateSummary || "Mobile lien service intake submitted for staff review.",
        accuracyCertification: true,
        filingTermsCertification: true,
      }),
    })
    setMessage(created.message)
    setBusy(false)
    if (created.ok) load()
  }

  if (!result) return <LoadingState label="Loading Florida lien service..." />

  return (
    <Screen eyebrow="Florida only" title="Florida lien notice and filing service.">
      <Card>
        <Text style={styles.cardTitle}>Private filing workflow</Text>
        <Text style={styles.body}>
          Client Bureau routes eligible Florida cases through attorney/vendor review.
          This app tracks private case state; it does not publish lien documents.
        </Text>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Start case</Text>
        <ChoiceRow label="Workflow" options={["notice_packet", "claim_of_lien_filing"]} value={form.workflowType} onChange={(v) => setForm({ ...form, workflowType: v })} />
        <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
        <Field label="Owner name" value={form.ownerName} onChangeText={(v) => setForm({ ...form, ownerName: v })} />
        <Field label="Florida county" value={form.propertyCounty} onChangeText={(v) => setForm({ ...form, propertyCounty: v })} />
        <Field label="Property city" value={form.propertyCity} onChangeText={(v) => setForm({ ...form, propertyCity: v })} />
        <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
        <ChoiceRow label="Contractor role" options={["direct_contractor", "subcontractor", "supplier", "other"]} value={form.contractorRole} onChange={(v) => setForm({ ...form, contractorRole: v })} />
        <Field keyboardType="numeric" label="Contract amount" value={form.contractAmount} onChangeText={(v) => setForm({ ...form, contractAmount: v })} />
        <Field keyboardType="numeric" label="Amount due" value={form.amountDue} onChangeText={(v) => setForm({ ...form, amountDue: v })} />
        <Field label="Last work date" placeholder="YYYY-MM-DD" value={form.lastWorkDate} onChangeText={(v) => setForm({ ...form, lastWorkDate: v })} />
        <Field multiline label="Notice history" value={form.noticeHistory} onChangeText={(v) => setForm({ ...form, noticeHistory: v })} />
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
        <PrimaryButton loading={busy} onPress={submit} title="Submit Florida case" />
      </Card>
      {result.ok
        ? result.data.floridaLienCases.map((item) => (
            <Card key={item.id}>
              <Text style={styles.cardTitle}>{item.clientName}</Text>
              <Text style={styles.body}>{item.propertyCounty} County / ${item.amountDue.toLocaleString()}</Text>
              <Text style={styles.helper}>{item.status} / {item.nextAction}</Text>
            </Card>
          ))
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
