import { useEffect, useState } from "react"
import { Text } from "react-native"

import { Card, Field, LoadingState, Message, PrimaryButton, Screen, styles } from "@/components/ui"
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
    <Screen eyebrow="Watchlist" title="Monitor clients and private signals.">
      <Card>
        <Text style={styles.cardTitle}>Add by Client Bureau profile ID</Text>
        <Text style={styles.body}>
          Search first, then add a public profile ID to watch for new moderated signals.
        </Text>
        <Field label="Client profile ID" value={clientId} onChangeText={setClientId} />
        <Field multiline label="Watch reason" value={watchReason} onChangeText={setWatchReason} />
        <PrimaryButton title="Watch this client" onPress={submit} />
      </Card>
      <Message text={message} tone={message?.includes("correct") ? "error" : "success"} />
      {result.ok
        ? result.data.watchlist.map((item) => (
            <Card key={item.id}>
              <Text style={styles.cardTitle}>{item.clientId}</Text>
              <Text style={styles.body}>{item.watchReason}</Text>
              <Text style={styles.helper}>{item.status} / {item.lastSignal}</Text>
            </Card>
          ))
        : <Message text={result.message} tone="error" />}
    </Screen>
  )
}
