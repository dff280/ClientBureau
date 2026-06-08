import { useEffect, useState } from "react"
import { Text } from "react-native"

import { Card, EmptyState, LoadingState, Message, PrimaryButton, Screen, SectionHeader, styles } from "@/components/ui"
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

  return (
    <Screen eyebrow="Evidence Vault" title="Private evidence, clear status.">
      {result.ok ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Privacy guardrail</Text>
            <Text style={styles.body}>{result.data.privacyNote}</Text>
          </Card>
          {[...result.data.evidenceVault, ...result.data.reportEvidence].length ? (
            <>
              <SectionHeader title="Evidence items" body="Private document summaries and review status." />
              {[...result.data.evidenceVault, ...result.data.reportEvidence].map((item) => (
                <Card key={item.id}>
                  <Text style={styles.cardTitle}>{item.label}</Text>
                  <Text style={styles.body}>{item.clientName ?? "Report evidence"} / {item.status ?? "uploaded"}</Text>
                  <Text style={styles.helper}>{item.publicSummary}</Text>
                  {item.status && item.status !== "reviewed" ? (
                    <PrimaryButton title="Mark reviewed" tone="light" onPress={() => markReviewed(item.id)} />
                  ) : null}
                </Card>
              ))}
            </>
          ) : (
            <EmptyState title="No evidence yet" body="Upload evidence from report, recovery, lien, or contract workflows on the web dashboard." />
          )}
        </>
      ) : (
        <Message text={result.message} tone="error" />
      )}
      <Message text={message} tone={message?.includes("could") ? "error" : "success"} />
    </Screen>
  )
}
