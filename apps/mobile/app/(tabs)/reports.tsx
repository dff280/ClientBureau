import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult, MobileReport } from "@/lib/types"
import { Badge, Card, ChoiceRow, EmptyState, Field, LoadingState, Message, PrimaryButton, Screen, SectionHeader, styles } from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

type ReportsPayload = {
  reports: MobileReport[]
  drafts: Array<{ id: string; clientName: string; projectType: string; status: string; nextStep: string }>
}

export default function ReportsScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<ReportsPayload>>()
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "FL",
    projectType: "",
    contractAmount: "",
    amountUnpaid: "",
    reportCategory: "Non-payment",
    paymentStatus: "Unpaid",
    reportSummary: "",
    detailedExperience: "",
  })

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<ReportsPayload>("/api/mobile/reports", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function submit() {
    if (!accessToken) return
    setBusy(true)
    const payload = {
      ...form,
      projectCity: form.city,
      projectState: form.state,
      contractAmount: Number(form.contractAmount || 0),
      amountUnpaid: Number(form.amountUnpaid || 0),
      detailedExperience: form.detailedExperience,
      truthfulCertification: true,
      documentationCertification: true,
      publicSummaryCertification: true,
      relationshipCertification: true,
      moderationCertification: true,
      evidencePrivacyCertification: true,
      responseRightCertification: true,
      noHarassmentCertification: true,
      evidenceAttached: false,
    }
    const next = await mobileFetch<MobileReport>("/api/mobile/reports", accessToken, {
      method: "POST",
      body: jsonBody(payload),
    })
    setMessage(next.message)
    setBusy(false)
    if (next.ok) {
      setShowForm(false)
      load()
    }
  }

  if (!result) return <LoadingState label="Loading reports..." />

  return (
    <Screen eyebrow="Reports" title="Document client experiences with moderation.">
      <Card>
        <Text style={styles.cardTitle}>What this does</Text>
        <Text style={styles.body}>
          Submit contractor experiences for admin review. Private evidence and sensitive details stay private.
        </Text>
        <PrimaryButton onPress={() => setShowForm(!showForm)} title={showForm ? "Close report form" : "Submit a report"} />
      </Card>
      <Message tone={message?.includes("correct") ? "error" : "success"} text={message} />
      {showForm ? (
        <Card>
          <Field label="Client first name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Client last name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
          <Field label="Client city" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
          <ChoiceRow label="State" options={["FL", "GA", "AL", "SC", "NC", "TX"]} value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
          <Field keyboardType="numeric" label="Contract amount" value={form.contractAmount} onChangeText={(v) => setForm({ ...form, contractAmount: v })} />
          <Field keyboardType="numeric" label="Amount unpaid" value={form.amountUnpaid} onChangeText={(v) => setForm({ ...form, amountUnpaid: v })} />
          <ChoiceRow label="Category" options={["Non-payment", "Late payment", "Positive experience", "Would work with again"]} value={form.reportCategory} onChange={(v) => setForm({ ...form, reportCategory: v })} />
          <Field label="Public summary" multiline value={form.reportSummary} onChangeText={(v) => setForm({ ...form, reportSummary: v })} />
          <Field label="Detailed private experience" multiline value={form.detailedExperience} onChangeText={(v) => setForm({ ...form, detailedExperience: v })} />
          <PrimaryButton loading={busy} onPress={submit} title="Submit for moderation" tone="gold" />
        </Card>
      ) : null}
      {result.ok ? (
        result.data.reports.length ? (
          <>
            <SectionHeader title="Report status" body="Track what is pending, approved, disputed, rejected, or published." />
            {result.data.reports.map((report) => {
              const paymentLabel =
                report.amountUnpaid > 0
                  ? `Reported unpaid: $${report.amountUnpaid.toLocaleString()}`
                  : "Payment issue: none reported"

              return (
                <Card key={report.id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <Text style={styles.cardTitle}>{report.projectType}</Text>
                    <Badge label={report.status} tone={report.status === "approved" ? "green" : "gold"} />
                  </View>
                  <Text style={styles.body}>
                    {report.reportCategory} / {report.paymentStatus} / {report.projectCity}, {report.projectState}
                  </Text>
                  <Text style={styles.helper}>{paymentLabel}</Text>
                </Card>
              )
            })}
          </>
        ) : (
          <EmptyState
            title="No reports yet"
            body="Submit your first documented client experience when you have a real project record to preserve."
          />
        )
      ) : (
        <Message tone="error" text={result.message} />
      )}
    </Screen>
  )
}
