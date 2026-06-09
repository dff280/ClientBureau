import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { FileCheck2, Landmark, ShieldCheck } from "lucide-react-native"

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
  const [showForm, setShowForm] = useState(false)
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
    <Screen
      eyebrow="Florida only"
      title="Lien Service"
      body="Start Florida notice or filing review cases with private facts, deadlines, and authorization steps."
      badge="Review"
    >
      <BureauHero
        eyebrow="Attorney/vendor review workflow"
        title="Start a private Florida lien notice or filing case."
        body="Submit project facts, deadline details, and unpaid amount. Client Bureau routes eligible cases through a controlled review workflow."
      >
        <StatusPill label="Florida only" tone="gold" />
        <TrustBadge label="Private review" tone="green" />
      </BureauHero>
      <IconActionRow
        icon={Landmark}
        title={showForm ? "Close lien intake" : "Start Florida case"}
        body="Use this when a Florida project may need notice or claim-of-lien filing support."
        badge="Private"
        onPress={() => setShowForm(!showForm)}
      />
      <Card>
        <Text style={styles.cardTitle}>Important guardrail</Text>
        <Text style={styles.body}>
          This mobile intake is not legal advice and does not publish lien documents. Staff review, authorization, and vendor/attorney steps are tracked privately.
        </Text>
      </Card>
      {showForm ? (
        <>
        <FormStepPanel
          step="Step 1"
          title="Choose workflow and parties"
          body="Tell us whether this is a notice packet or claim-of-lien filing review."
        >
          <ChoiceRow label="Workflow" options={["notice_packet", "claim_of_lien_filing"]} value={form.workflowType} onChange={(v) => setForm({ ...form, workflowType: v })} />
          <Field label="Client name" value={form.clientName} onChangeText={(v) => setForm({ ...form, clientName: v })} />
          <Field label="Owner name" value={form.ownerName} onChangeText={(v) => setForm({ ...form, ownerName: v })} />
          <ChoiceRow label="Contractor role" options={["direct_contractor", "subcontractor", "supplier", "other"]} value={form.contractorRole} onChange={(v) => setForm({ ...form, contractorRole: v })} />
        </FormStepPanel>
        <FormStepPanel
          step="Step 2"
          title="Property and project"
          body="Florida lien workflows depend on accurate property and work-date details."
        >
          <Field label="Florida county" value={form.propertyCounty} onChangeText={(v) => setForm({ ...form, propertyCounty: v })} />
          <Field label="Property city" value={form.propertyCity} onChangeText={(v) => setForm({ ...form, propertyCity: v })} />
          <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
          <Field label="Last work date" placeholder="YYYY-MM-DD" value={form.lastWorkDate} onChangeText={(v) => setForm({ ...form, lastWorkDate: v })} />
        </FormStepPanel>
        <FormStepPanel
          step="Step 3"
          title="Money owed and notice history"
          body="Keep the amount and timeline factual. Staff will review supporting documents before next steps."
        >
          <Field keyboardType="numeric" label="Contract amount" value={form.contractAmount} onChangeText={(v) => setForm({ ...form, contractAmount: v })} />
          <Field keyboardType="numeric" label="Amount due" value={form.amountDue} onChangeText={(v) => setForm({ ...form, amountDue: v })} />
          <Field multiline label="Notice history" value={form.noticeHistory} onChangeText={(v) => setForm({ ...form, noticeHistory: v })} />
          <Field multiline label="Private case summary" value={form.privateSummary} onChangeText={(v) => setForm({ ...form, privateSummary: v })} />
          <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
          <PrimaryButton loading={busy} onPress={submit} title="Submit Florida case" />
        </FormStepPanel>
        </>
      ) : (
        <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      )}
      {result.ok
        ? result.data.floridaLienCases.length ? (
          <>
            <SectionHeader title="Florida cases" body="Track document review, authorization, vendor review, and filing status." />
            {result.data.floridaLienCases.map((item) => (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{item.clientName}</Text>
                  <StatusPill label={item.status.replaceAll("_", " ")} tone="blue" />
                </View>
                <Text style={styles.body}>{item.propertyCounty} County / ${item.amountDue.toLocaleString()}</Text>
                <TimelineItem
                  title="Next action"
                  body={item.nextAction}
                  meta={item.filingDeadline ? `Deadline cue: ${item.filingDeadline}` : "Deadline review required"}
                  tone={item.status === "filed" || item.status === "recording_confirmed" ? "green" : "gold"}
                />
                <IconActionRow
                  icon={item.status === "filed" || item.status === "recording_confirmed" ? ShieldCheck : FileCheck2}
                  title={item.status === "filed" || item.status === "recording_confirmed" ? "Filing status recorded" : "Review case readiness"}
                  body="Use the web dashboard for document uploads, authorization, and staff messages."
                  badge={item.status === "filed" || item.status === "recording_confirmed" ? "Recorded" : "Review"}
                />
              </Card>
            ))}
          </>
        ) : (
          <PremiumEmptyState
            title="No Florida lien cases yet"
            body="Start a private review when a Florida project may need lien notice or filing support."
            actionTitle="Start case"
            onAction={() => setShowForm(true)}
          />
        )
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
