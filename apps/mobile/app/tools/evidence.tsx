import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { FolderLock, ShieldCheck } from "lucide-react-native"

import {
  BureauHero,
  Card,
  IconActionRow,
  LoadingState,
  Message,
  MetricMini,
  PremiumEmptyState,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatusPill,
  TimelineItem,
  ToolBrief,
  TrustBadge,
  styles,
} from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult, MobileEvidence } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type EvidencePayload = {
  evidenceVault: MobileEvidence[]
  reportEvidence: MobileEvidence[]
  privacyNote: string
}

export default function EvidenceScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<EvidencePayload>>()
  const [message, setMessage] = useState<string>()

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<EvidencePayload>("/api/mobile/evidence", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function markReviewed(id: string) {
    if (!accessToken) return
    const updated = await mobileFetch<MobileEvidence>("/api/mobile/evidence", accessToken, {
      method: "POST",
      body: jsonBody({ evidenceId: id, status: "reviewed" }),
    })
    setMessage(updated.message)
    if (updated.ok) load()
  }

  if (!result) return <LoadingState label="Loading evidence vault..." />
  const evidenceItems = result.ok ? [...result.data.evidenceVault, ...result.data.reportEvidence] : []
  const reviewedItems = evidenceItems.filter((item) => item.status === "reviewed").length
  const needsReviewItems = evidenceItems.filter((item) => item.status !== "reviewed").length

  return (
    <Screen
      eyebrow="Evidence Vault"
      title="Private documents"
      body="Track evidence summaries and review status without exposing raw files."
      badge="Private"
    >
      {result.ok ? (
        <>
          <BureauHero
            eyebrow="Private evidence status"
            title="Keep proof organized without exposing files publicly."
            body="Evidence supports reports, recovery cases, lien service, and contracts. Public pages only show approved summaries such as evidence on file."
          >
            <StatusPill label="Private by default" tone="gold" />
            <TrustBadge label="Evidence on file" tone="green" />
          </BureauHero>
          <ToolBrief
            useWhen="You need invoices, screenshots, contracts, photos, or PDFs tied to a report or service case."
            privateNote="Raw files and storage paths stay private. Public pages only show approved evidence summaries."
            primaryAction="Review status here, then upload or attach files from the web dashboard."
          />
          <View style={styles.metricGrid}>
            <MetricMini label="Items" value={evidenceItems.length} />
            <MetricMini label="Reviewed" value={reviewedItems} />
            <MetricMini label="Needs review" value={needsReviewItems} />
          </View>
          <Card>
            <Text style={styles.cardTitle}>Privacy guardrail</Text>
            <Text style={styles.body}>{result.data.privacyNote}</Text>
            <IconActionRow
              icon={FolderLock}
              title="Upload from the web dashboard"
              body="Mobile shows status summaries first. Use the full dashboard for secure document uploads."
              badge="Secure"
            />
          </Card>
          {evidenceItems.length ? (
            <>
              <SectionHeader title="Evidence items" body="Private document summaries and review status." />
              {evidenceItems.map((item) => (
                <Card key={item.id}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <StatusPill label={(item.status ?? "uploaded").replaceAll("_", " ")} tone={item.status === "reviewed" ? "green" : "gold"} />
                  </View>
                  <Text style={styles.body}>{item.clientName ?? "Report evidence"} / {item.status ?? "uploaded"}</Text>
                  <TimelineItem
                    title="Evidence summary"
                    body={item.publicSummary}
                    meta="Raw files stay private"
                    tone={item.status === "reviewed" ? "green" : "blue"}
                  />
                  {item.status === "reviewed" ? (
                    <IconActionRow
                      icon={ShieldCheck}
                      title="Reviewed privately"
                      body="This item can support a moderated summary without exposing the source file."
                      badge="Reviewed"
                    />
                  ) : item.status ? (
                    <PrimaryButton title="Mark reviewed" tone="light" onPress={() => markReviewed(item.id)} />
                  ) : null}
                </Card>
              ))}
            </>
          ) : (
            <PremiumEmptyState
              title="No evidence yet"
              body="Upload invoices, screenshots, contracts, photos, and PDFs from the web dashboard when a report or service case needs support."
            />
          )}
        </>
      ) : (
        <Message text={result.message} tone="error" />
      )}
      <Message text={message} tone={message?.includes("could") ? "error" : "success"} />
    </Screen>
  )
}
