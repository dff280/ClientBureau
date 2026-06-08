import * as WebBrowser from "expo-web-browser"
import { useState } from "react"
import { Text, View } from "react-native"

import { jsonBody, mobileFetch } from "@/lib/api"
import { siteUrl } from "@/lib/config"
import type { ApiResult, MobileSearchResult } from "@/lib/types"
import { Badge, Card, ChoiceRow, Field, Message, PrimaryButton, Screen, SecondaryButton, styles } from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

type SearchPayload = {
  query: string
  results: MobileSearchResult[]
  suggestions: Array<{ id: string; label: string; description: string; query?: string; state?: string }>
  privacyNote: string
}

export default function SearchScreen() {
  const { accessToken } = useAuth()
  const [query, setQuery] = useState("")
  const [state, setState] = useState("FL")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ApiResult<SearchPayload>>()
  const [message, setMessage] = useState<string>()

  async function runSearch() {
    if (!accessToken) return
    setBusy(true)
    setMessage(undefined)
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (state) params.set("state", state)
    const next = await mobileFetch<SearchPayload>(`/api/mobile/search?${params.toString()}`, accessToken)
    setResult(next)
    setBusy(false)
  }

  async function saveSearch(resultCount: number) {
    if (!accessToken) return
    const saved = await mobileFetch("/api/mobile/saved-searches", accessToken, {
      method: "POST",
      body: jsonBody({ query, state, resultCount }),
    })
    setMessage(saved.message)
  }

  return (
    <Screen eyebrow="Client search" title="Check a client before you take the job.">
      <Card>
        <Field
          label="Client name, business, phone, email, or city"
          onChangeText={setQuery}
          placeholder="John Smith Orlando"
          value={query}
        />
        <ChoiceRow label="State" onChange={setState} options={["FL", "GA", "AL", "SC", "NC", "TX"]} value={state} />
        <PrimaryButton loading={busy} onPress={runSearch} title="Search a Client" />
      </Card>

      <Message text={message} tone="success" />

      {result?.ok ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Private matching</Text>
            <Text style={styles.body}>{result.data.privacyNote}</Text>
          </Card>
          {result.data.results.map((item) => (
            <Card key={item.id}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.displayName}</Text>
                  <Text style={styles.body}>
                    {item.city}, {item.state} / {item.reportCount} approved signal(s)
                  </Text>
                </View>
                <Badge label={`${item.score}`} tone="gold" />
              </View>
              <Text style={styles.helper}>{item.matchedBy}</Text>
              <Text style={styles.body}>{item.latestSummary ?? item.paymentContextLabel}</Text>
              <SecondaryButton
                title="Open public profile"
                onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/client/${item.publicSlug}`)}
              />
            </Card>
          ))}
          {!result.data.results.length ? (
            <Card>
              <Text style={styles.cardTitle}>No public profile found yet</Text>
              <Text style={styles.body}>
                Save this search or submit a documented report if you have a real client experience.
              </Text>
              <PrimaryButton onPress={() => saveSearch(0)} title="Save this search" tone="gold" />
            </Card>
          ) : (
            <PrimaryButton onPress={() => saveSearch(result.data.results.length)} title="Save this search" tone="light" />
          )}
        </>
      ) : result && !result.ok ? (
        <Message text={result.message} tone="error" />
      ) : null}
    </Screen>
  )
}
