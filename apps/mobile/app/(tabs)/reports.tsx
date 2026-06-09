import { ClipboardCheck, FileText, ShieldCheck } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

import {
  BureauHero,
  Card,
  ChoiceRow,
  CommandCard,
  Field,
  FormStepPanel,
  IconActionRow,
  LoadingState,
  Message,
  MetricMini,
  PremiumEmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  SegmentedTabs,
  StatusPill,
  TimelineItem,
  styles,
} from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult, MobileReport } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type ReportsPayload = {
  reports: MobileReport[]
  drafts: Array<{ id: string; clientName: string; projectType: string; status: string; nextStep: string }>
}

const statusOptions = ["All", "Draft", "Pending", "Approved", "Published", "Needs info", "Disputed", "Rejected"]
const positiveCategories = ["Positive experience", "Would work with again"]

function normalizeStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ").trim()
}

export default function ReportsScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<ReportsPayload>>()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
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
    const positive = positiveCategories.includes(form.reportCategory)
    const payload = {
      ...form,
      projectCity: form.city,
      projectState: form.state,
      contractAmount: Number(form.contractAmount || 0),
      amountUnpaid: positive ? 0 : Number(form.amountUnpaid || 0),
      paymentStatus: positive ? "No issue reported" : form.paymentStatus,
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

  const visibleReports = result.ok
    ? result.data.reports.filter((report) => statusFilter === "All" || normalizeStatus(report.status) === normalizeStatus(statusFilter))
    : []
  const approvedCount = result.ok ? result.data.reports.filter((report) => report.status === "approved").length : 0
  const positiveCount = result.ok ? result.data.reports.filter((report) => positiveCategories.includes(report.reportCategory)).length : 0
  const pendingCount = result.ok ? result.data.reports.filter((report) => report.status === "pending").length : 0
  const isPositiveForm = positiveCategories.includes(form.reportCategory)

  return (
    <Screen
      eyebrow="Reports"
      title="Document client experiences."
      body="Track drafts, pending reports, approved records, positive experiences, and disputes from one simple status view."
      badge="Moderated"
    >
      <BureauHero
        eyebrow="Moderated reports"
        title="Document the experience clearly."
        body="Submit documented contractor experiences for review. Private evidence and sensitive details stay private."
      >
        <StatusPill label="Admin reviewed" tone="gold" />
      </BureauHero>

      <View style={styles.metricGrid}>
        <CommandCard
          icon={ShieldCheck}
          label="Positive"
          title="Good clients count too"
          body="Document clients you would work with again and keep positive signals visible."
          metric={positiveCount}
          tone="gold"
        />
        <CommandCard
          icon={ClipboardCheck}
          label="Moderation"
          title="Track status"
          body="Pending, approved, published, disputed, and rejected records stay easy to scan."
          metric={pendingCount}
        />
      </View>

      <IconActionRow
        icon={FileText}
        title={showForm ? "Close report form" : "Submit a report"}
        body="Use this for payment issues, positive experiences, disputes, and project context."
        onPress={() => setShowForm(!showForm)}
      />
      <Message tone={message?.includes("correct") ? "error" : "success"} text={message} />

      {result.ok && result.data.drafts.length ? (
        <Card>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Draft reports</Text>
              <Text style={styles.body}>Continue reports that are not ready for moderation yet.</Text>
            </View>
            <StatusPill label={`${result.data.drafts.length} draft`} tone="blue" />
          </View>
          {result.data.drafts.slice(0, 3).map((draft) => (
            <TimelineItem
              key={draft.id}
              title={draft.clientName}
              body={draft.projectType}
              meta={draft.nextStep}
              tone="blue"
            />
          ))}
        </Card>
      ) : null}

      {showForm ? (
        <>
          <FormStepPanel step="Step 1" title="Client identity" body="Use the client information you have from the real project record.">
            <Field label="Client first name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <Field label="Client last name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
            <Field label="Client city" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
            <ChoiceRow label="State" options={["FL", "GA", "AL", "SC", "NC", "TX"]} value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </FormStepPanel>
          <FormStepPanel step="Step 2" title="Project and payment" body="Summarize the project and payment status in plain English.">
            <Field label="Project type" value={form.projectType} onChangeText={(v) => setForm({ ...form, projectType: v })} />
            <Field keyboardType="numeric" label="Contract amount" value={form.contractAmount} onChangeText={(v) => setForm({ ...form, contractAmount: v })} />
            {!isPositiveForm ? (
              <Field keyboardType="numeric" label="Amount unpaid" value={form.amountUnpaid} onChangeText={(v) => setForm({ ...form, amountUnpaid: v })} />
            ) : null}
            <ChoiceRow label="Experience type" options={["Non-payment", "Late payment", "Positive experience", "Would work with again"]} value={form.reportCategory} onChange={(v) => setForm({ ...form, reportCategory: v })} />
            {isPositiveForm ? (
              <Message text="Positive reports publish as client experience signals without unpaid-amount language." tone="success" />
            ) : null}
          </FormStepPanel>
          <FormStepPanel step="Step 3" title="Summary for moderation" body="Keep public wording factual, neutral, and response-aware.">
            <Field label="Public summary" multiline value={form.reportSummary} onChangeText={(v) => setForm({ ...form, reportSummary: v })} />
            <Field label="Detailed private experience" multiline value={form.detailedExperience} onChangeText={(v) => setForm({ ...form, detailedExperience: v })} />
            <PrimaryButton loading={busy} onPress={submit} title="Submit for moderation" tone="gold" />
          </FormStepPanel>
        </>
      ) : null}

      {result.ok ? (
        result.data.reports.length ? (
          <>
            <SectionHeader title="Report status" body="Track what is pending, approved, disputed, rejected, or published." />
            <SegmentedTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
            <View style={styles.metricGrid}>
              <MetricMini label="Approved" value={approvedCount} />
              <MetricMini label="Pending" value={pendingCount} />
              <MetricMini label="Positive" value={positiveCount} />
            </View>
            {visibleReports.map((report) => {
              const positive = positiveCategories.includes(report.reportCategory)
              const paymentLabel =
                positive
                  ? "Client experience: positive"
                  : report.amountUnpaid > 0
                  ? `Reported unpaid: $${report.amountUnpaid.toLocaleString()}`
                  : "Payment issue: none reported"

              return (
                <Card key={report.id}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{report.projectType}</Text>
                    <StatusPill label={report.status} tone={report.status === "approved" ? "green" : "gold"} />
                  </View>
                  <TimelineItem
                    title={report.reportCategory}
                    body={`${report.paymentStatus} / ${report.projectCity}, ${report.projectState}`}
                    meta={paymentLabel}
                    tone={positive || report.status === "approved" ? "green" : "gold"}
                  />
                </Card>
              )
            })}
            {!visibleReports.length ? (
              <PremiumEmptyState
                title={`No ${statusFilter.toLowerCase()} reports`}
                body="Switch filters or submit a new documented client experience when the project record is ready."
                actionTitle="Submit report"
                onAction={() => setShowForm(true)}
              />
            ) : null}
          </>
        ) : (
          <PremiumEmptyState
            title="No reports yet"
            body="Submit your first documented client experience when you have a real project record to preserve."
            actionTitle="Start report"
            onAction={() => setShowForm(true)}
          />
        )
      ) : (
        <Message tone="error" text={result.message} />
      )}

      <IconActionRow icon={ShieldCheck} title="Moderation guardrail" body="Public records use admin-approved summaries and private evidence indicators." />
      <IconActionRow icon={ClipboardCheck} title="Positive reports are supported" body="Good clients can be documented too." />
    </Screen>
  )
}
