import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { FileSignature, Link2, ShieldCheck } from "lucide-react-native"

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
    <Screen eyebrow="Contracts" title="Agreement packets">
      <BureauHero
        eyebrow="Private contract workspace"
        title="Create a signing packet before the job starts."
        body="Document scope, payment terms, deposits, and change-order expectations in a private record your client can sign."
      >
        <StatusPill label="Private by default" tone="gold" />
        <TrustBadge label="E-sign workflow" tone="green" />
      </BureauHero>
      <IconActionRow
        icon={FileSignature}
        title={showForm ? "Close agreement builder" : "Create agreement packet"}
        body="Use this before scheduling work, ordering materials, or approving a change order."
        badge="E-sign ready"
        onPress={() => setShowForm(!showForm)}
      />
      <Card>
        <Text style={styles.cardTitle}>What stays private</Text>
        <Text style={styles.body}>
          Contract terms, client details, signing links, and payment terms stay off public Client Bureau profiles.
        </Text>
      </Card>
      {showForm ? (
        <>
        <FormStepPanel
          step="Step 1"
          title="Client and packet type"
          body="Start with the client, project, and agreement template."
        >
          <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
          <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
          <ChoiceRow
            label="Template"
            options={["service_agreement", "change_order", "payment_plan"]}
            value={form.templateType}
            onChange={(v) => setForm({ ...form, templateType: v })}
          />
        </FormStepPanel>
        <FormStepPanel
          step="Step 2"
          title="Agreement value and payment terms"
          body="Record deposit, milestone, and payment expectations clearly."
        >
          <Field keyboardType="numeric" label="Agreement value" value={form.packetValue} onChangeText={(v) => setForm({ ...form, packetValue: v })} />
          <Field keyboardType="numeric" label="Deposit required" value={form.depositRequired} onChangeText={(v) => setForm({ ...form, depositRequired: v })} />
          <Field keyboardType="numeric" label="Milestone count" value={form.milestoneCount} onChangeText={(v) => setForm({ ...form, milestoneCount: v })} />
          <Field label="Payment terms" multiline value={form.paymentTerms} onChangeText={(v) => setForm({ ...form, paymentTerms: v })} />
        </FormStepPanel>
        <FormStepPanel
          step="Step 3"
          title="Scope and change-order rules"
          body="Keep the packet useful by separating included work from later changes."
        >
          <Field label="Scope summary" multiline value={form.scopeSummary} onChangeText={(v) => setForm({ ...form, scopeSummary: v })} />
          <Field label="Included work" multiline value={form.includedWork} onChangeText={(v) => setForm({ ...form, includedWork: v })} />
          <Field label="Change-order policy" multiline value={form.changeOrderPolicy} onChangeText={(v) => setForm({ ...form, changeOrderPolicy: v })} />
          <Field label="Cancellation policy" multiline value={form.cancellationPolicy} onChangeText={(v) => setForm({ ...form, cancellationPolicy: v })} />
          <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
          <PrimaryButton loading={busy} title="Create agreement packet" onPress={submit} />
        </FormStepPanel>
        </>
      ) : (
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      )}
      {result.ok && result.data.contractPackets.length ? (
        <SectionHeader title="Agreement packets" body="Track packet value, signing state, and the next action." />
      ) : null}
      {result.ok
        ? result.data.contractPackets.length ? result.data.contractPackets.map((packet) => (
            <Card key={packet.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{packet.clientName}</Text>
                <StatusPill label={packet.status.replaceAll("_", " ")} tone="blue" />
              </View>
              <Text style={styles.body}>{packet.projectType} / ${packet.packetValue.toLocaleString()}</Text>
              <TimelineItem
                title="Next action"
                body={packet.nextAction}
                meta="Private agreement packet"
                tone={packet.status === "signed" ? "green" : "gold"}
              />
              <IconActionRow
                icon={packet.status === "signed" ? ShieldCheck : Link2}
                title={packet.status === "signed" ? "Signed packet on file" : "Review signing link status"}
                body="Open the web dashboard to copy links, review signatures, or archive packets."
                badge={packet.status === "signed" ? "Signed" : "Track"}
              />
            </Card>
          )) : (
            <PremiumEmptyState
              title="No agreement packets yet"
              body="Create a private contract packet before scheduling a new job or change order."
              actionTitle="Create packet"
              onAction={() => setShowForm(true)}
            />
          )
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
