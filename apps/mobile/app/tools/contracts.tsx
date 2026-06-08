import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { Card, ChoiceRow, EmptyState, Field, LoadingState, Message, PrimaryButton, Screen, SectionHeader, styles } from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult, MobileContractPacket } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type ContractsPayload = { contractPackets: MobileContractPacket[] }

export default function ContractsScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<ContractsPayload>>()
  const [message, setMessage] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    clientName: "",
    projectType: "",
    templateType: "service_agreement",
    packetValue: "",
    depositRequired: "",
    milestoneCount: "0",
    scopeSummary: "",
    includedWork: "",
    paymentTerms: "",
    changeOrderPolicy: "All change orders must be documented and approved before added work begins.",
    cancellationPolicy: "Cancellation terms must be reviewed by both parties before scheduling.",
    nextAction: "Generate a private signing link.",
  })

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<ContractsPayload>("/api/mobile/contracts", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function submit() {
    if (!accessToken) return
    setBusy(true)
    const created = await mobileFetch<MobileContractPacket>("/api/mobile/contracts", accessToken, {
      method: "POST",
      body: jsonBody({
        ...form,
        packetValue: Number(form.packetValue || 0),
        depositRequired: Number(form.depositRequired || 0),
        milestoneCount: Number(form.milestoneCount || 0),
        requiredBeforeScheduling: true,
      }),
    })
    setMessage(created.message)
    setBusy(false)
    if (created.ok) load()
  }

  if (!result) return <LoadingState label="Loading contracts..." />

  return (
    <Screen eyebrow="Contracts" title="Create agreement packets clients can sign.">
      <Card>
        <Text style={styles.cardTitle}>Private contract workspace</Text>
        <Text style={styles.body}>
          Use this before scheduling work, buying materials, or accepting a change order.
          Contract content stays private and is not shown on public profiles.
        </Text>
        <PrimaryButton
          title={showForm ? "Close packet form" : "Create agreement packet"}
          onPress={() => setShowForm(!showForm)}
        />
      </Card>
      {showForm ? (
        <Card>
          <Text style={styles.cardTitle}>Create packet</Text>
          <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
          <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
          <ChoiceRow
            label="Template"
            options={["service_agreement", "change_order", "payment_plan"]}
            value={form.templateType}
            onChange={(v) => setForm({ ...form, templateType: v })}
          />
          <Field keyboardType="numeric" label="Agreement value" value={form.packetValue} onChangeText={(v) => setForm({ ...form, packetValue: v })} />
          <Field keyboardType="numeric" label="Deposit required" value={form.depositRequired} onChangeText={(v) => setForm({ ...form, depositRequired: v })} />
          <Field label="Scope summary" multiline value={form.scopeSummary} onChangeText={(v) => setForm({ ...form, scopeSummary: v })} />
          <Field label="Included work" multiline value={form.includedWork} onChangeText={(v) => setForm({ ...form, includedWork: v })} />
          <Field label="Payment terms" multiline value={form.paymentTerms} onChangeText={(v) => setForm({ ...form, paymentTerms: v })} />
          <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
          <PrimaryButton loading={busy} title="Create agreement packet" onPress={submit} />
        </Card>
      ) : (
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      )}
      {result.ok && result.data.contractPackets.length ? (
        <SectionHeader title="Agreement packets" body="Track packet value, signing state, and the next action." />
      ) : null}
      {result.ok
        ? result.data.contractPackets.length ? result.data.contractPackets.map((packet) => (
            <Card key={packet.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={styles.cardTitle}>{packet.clientName}</Text>
                <Text style={styles.helper}>{packet.status}</Text>
              </View>
              <Text style={styles.body}>{packet.projectType} / ${packet.packetValue.toLocaleString()}</Text>
              <Text style={styles.helper}>{packet.nextAction}</Text>
            </Card>
          )) : (
            <EmptyState title="No agreement packets yet" body="Create a private contract packet before scheduling a new job or change order." />
          )
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
