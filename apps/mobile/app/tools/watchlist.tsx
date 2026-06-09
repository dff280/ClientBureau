import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { Bell, Search, ShieldCheck } from "lucide-react-native"

import {
  BureauHero,
  Card,
  EmptyState,
  Field,
  FormStepPanel,
  IconActionRow,
  LoadingState,
  Message,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatusPill,
  TimelineItem,
  styles,
} from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import type { ApiResult } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type WatchItem = {
  id: string
  clientId: string
  status: string
  watchReason: string
  alertLevel: string
  lastSignal: string
  privateMatch: boolean
}
type WatchPayload = { watchlist: WatchItem[]; alerts: number }

export default function WatchlistScreen() {
  const { accessToken } = useAuth()
  const [result, setResult] = useState<ApiResult<WatchPayload>>()
  const [clientId, setClientId] = useState("")
  const [watchReason, setWatchReason] = useState("")
  const [message, setMessage] = useState<string>()
  const [showForm, setShowForm] = useState(false)

  async function load() {
    if (!accessToken) return
    setResult(await mobileFetch<WatchPayload>("/api/mobile/watchlist", accessToken))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  async function submit() {
    if (!accessToken) return
    const created = await mobileFetch("/api/mobile/watchlist", accessToken, {
      method: "POST",
      body: jsonBody({ clientId, watchReason, alertLevel: "normal" }),
    })
    setMessage(created.message)
    if (created.ok) load()
  }

  if (!result) return <LoadingState label="Loading watchlist..." />

  return (
    <Screen eyebrow="Watchlist" title="Client monitoring">
      <BureauHero
        eyebrow="Search alerts"
        title="Watch clients you may work with again."
        body="Save a profile after searching and monitor for new approved reports, response activity, or private-match signals."
      >
        <StatusPill label={`${result.ok ? result.data.alerts : 0} active alerts`} tone="gold" />
      </BureauHero>
      <IconActionRow
        icon={Bell}
        title={showForm ? "Close watch form" : "Watch a client"}
        body="Add a public Client Bureau profile ID after search, then track new moderated signals."
        badge="Monitor"
        onPress={() => setShowForm(!showForm)}
      />
      {showForm ? (
        <FormStepPanel
          step="Step 1"
          title="Add by Client Bureau profile ID"
          body="This creates a private watch record for your account only."
        >
          <Field label="Client profile ID" value={clientId} onChangeText={setClientId} />
          <Field multiline label="Watch reason" value={watchReason} onChangeText={setWatchReason} />
          <PrimaryButton title="Watch this client" onPress={submit} />
        </FormStepPanel>
      ) : null}
      <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      {result.ok
        ? result.data.watchlist.length ? (
          <>
            <SectionHeader title="Watched clients" body={`${result.data.alerts} alert(s) currently need attention.`} />
            {result.data.watchlist.map((item) => (
              <Card key={item.id}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{item.clientId}</Text>
                  <StatusPill label={item.alertLevel} tone={item.alertLevel === "high" ? "red" : "blue"} />
                </View>
                <Text style={styles.body}>{item.watchReason}</Text>
                <TimelineItem
                  title="Latest signal"
                  body={item.lastSignal}
                  meta={item.privateMatch ? "Private identifier match available" : "Public profile monitoring"}
                  tone={item.privateMatch ? "gold" : "blue"}
                />
                <IconActionRow
                  icon={item.privateMatch ? ShieldCheck : Search}
                  title={item.privateMatch ? "Private match noted" : "Review public profile"}
                  body="Open search or the web dashboard for deeper context before accepting work."
                  badge={item.status}
                />
              </Card>
            ))}
          </>
        ) : (
          <EmptyState
            title="No watched clients yet"
            body="Search a client first, then save profiles that matter to your pipeline."
          />
        )
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
