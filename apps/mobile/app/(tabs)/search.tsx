import * as WebBrowser from "expo-web-browser"
import { Eye, Save, Search, ShieldCheck } from "lucide-react-native"
import { useState } from "react"
import { Text, View } from "react-native"

import {
  BureauHero,
  BureauSearchBox,
  Card,
  IconActionRow,
  Message,
  PremiumEmptyState,
  Screen,
  SectionHeader,
  SegmentedTabs,
  StatusPill,
  TrustBadge,
  TrustScoreCard,
  styles,
} from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import { siteUrl } from "@/lib/config"
import type { ApiResult, MobileSearchResult } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type SearchPayload = {
  query: string
  results: MobileSearchResult[]
  suggestions: Array<{ id: string; label: string; description: string; query?: string; state?: string }>
  privacyNote: string
}

const stateOptions = ["FL", "GA", "AL", "SC", "NC", "TX"]

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
      <BureauHero
        eyebrow="Search before you sign"
        title="Look up the client, then decide the next move."
        body="Search names, businesses, cities, and private identifiers without exposing sensitive matching details publicly."
      >
        <StatusPill label="Private matching" tone="gold" />
        <TrustBadge label="Moderated profiles" tone="green" />
      </BureauHero>

      <BureauSearchBox
        buttonLabel="Search a Client"
        loading={busy}
        onChangeText={setQuery}
        onSubmit={runSearch}
        placeholder="John Smith Orlando"
        value={query}
      />
      <SegmentedTabs options={stateOptions} value={state} onChange={setState} />

      <Message text={message} tone="success" />

      {result?.ok ? (
        <>
          <IconActionRow icon={ShieldCheck} title="Private matching" body={result.data.privacyNote} />
          {result.data.results.length ? (
            <SectionHeader
              title="Search results"
              body="Open the public profile for approved context, or save this search to watch it later."
            />
          ) : null}
          {result.data.results.map((item) => (
            <Card key={item.id}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.displayName}</Text>
                  <Text style={styles.body}>
                    {item.city}, {item.state} / {item.reportCount} approved signal(s)
                  </Text>
                </View>
                <StatusPill label={item.riskLevel} tone={item.riskLevel === "Low" ? "green" : item.riskLevel === "High" ? "red" : "gold"} />
              </View>
              <TrustScoreCard
                score={item.score}
                label="Client Bureau signal"
                body={item.latestSummary ?? item.paymentContextLabel}
              />
              <Text style={styles.helper}>{item.matchedBy}</Text>
              <IconActionRow
                icon={Eye}
                title="Open public profile"
                body="View approved report context and response status."
                onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/client/${item.publicSlug}`)}
              />
            </Card>
          ))}
          {!result.data.results.length ? (
            <>
              {result.data.suggestions.length ? (
                <Card>
                  <Text style={styles.cardTitle}>Try a related search</Text>
                  {result.data.suggestions.slice(0, 3).map((suggestion) => (
                    <IconActionRow
                      icon={Search}
                      key={suggestion.id}
                      title={suggestion.label}
                      body={suggestion.description}
                      onPress={() => {
                        setQuery(suggestion.query ?? suggestion.label)
                        if (suggestion.state) setState(suggestion.state)
                      }}
                    />
                  ))}
                </Card>
              ) : null}
              <PremiumEmptyState
                title="No public profile found yet"
                body="Save this search or submit a documented report if you have a real client experience."
                actionTitle="Save this search"
                onAction={() => saveSearch(0)}
              />
            </>
          ) : (
            <IconActionRow
              icon={Save}
              title="Save this search"
              body="Keep this client lookup in your account for later follow-up."
              onPress={() => saveSearch(result.data.results.length)}
            />
          )}
        </>
      ) : result && !result.ok ? (
        <Message text={result.message} tone="error" />
      ) : (
        <IconActionRow
          icon={Search}
          title="Start with a name or business"
          body="Try a client name, business name, city, phone, or email."
        />
      )}
    </Screen>
  )
}
