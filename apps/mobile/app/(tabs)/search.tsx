import { router } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { Bell, Eye, FileText, Save, Search, Share2, ShieldCheck, UserPlus } from "lucide-react-native"
import { useState } from "react"
import { Text, View } from "react-native"

import {
  BureauHero,
  BureauSearchBox,
  Card,
  CommandCard,
  IconActionRow,
  LaunchChecklist,
  Message,
  MetricMini,
  PremiumEmptyState,
  Screen,
  SectionHeader,
  SegmentedTabs,
  StatusPill,
  SuggestionChip,
  TrustBadge,
  TrustScoreCard,
  styles,
} from "@/components/ui"
import { jsonBody, mobileFetch } from "@/lib/api"
import { siteUrl } from "@/lib/config"
import { inviteContractorToClientBureau, shareClientBureauApp, shareClientProfile } from "@/lib/share"
import type { ApiResult, MobileSearchResult } from "@/lib/types"
import { useAuth } from "@/providers/auth-provider"

type SearchPayload = {
  query: string
  results: MobileSearchResult[]
  suggestions: Array<{ id: string; label: string; description: string; query?: string; state?: string }>
  privacyNote: string
}

const stateOptions = ["FL", "GA", "AL", "SC", "NC", "TX"]
const quickSearches = ["Homeowner Orlando", "Property owner Tampa", "Kitchen remodel", "Late payment"]

export default function SearchScreen() {
  const { accessToken } = useAuth()
  const [query, setQuery] = useState("")
  const [state, setState] = useState("FL")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ApiResult<SearchPayload>>()
  const [message, setMessage] = useState<string>()
  const [savedQueryKey, setSavedQueryKey] = useState<string>()
  const [watchedIds, setWatchedIds] = useState<Record<string, boolean>>({})

  async function runSearch() {
    if (!accessToken) return
    if (!query.trim()) {
      setMessage("Enter a client name, business, city, phone, or email to start a private search.")
      return
    }
    setBusy(true)
    setMessage(undefined)
    const params = new URLSearchParams()
    if (query.trim()) params.set("q", query.trim())
    if (state) params.set("state", state)
    const next = await mobileFetch<SearchPayload>(`/api/mobile/search?${params.toString()}`, accessToken)
    setResult(next)
    setSavedQueryKey(undefined)
    setBusy(false)
  }

  async function saveSearch(resultCount: number) {
    if (!accessToken) return
    const saved = await mobileFetch("/api/mobile/saved-searches", accessToken, {
      method: "POST",
      body: jsonBody({ query, state, resultCount }),
    })
    setMessage(saved.message)
    if (saved.ok) setSavedQueryKey(`${query.trim().toLowerCase()}-${state}`)
  }

  async function watchClient(item: MobileSearchResult) {
    if (!accessToken) return
    const watched = await mobileFetch("/api/mobile/watchlist", accessToken, {
      method: "POST",
      body: jsonBody({
        clientId: item.id,
        watchReason: `Mobile watch from search: ${item.displayName}`,
        alertLevel: item.riskLevel === "High" ? "high" : "normal",
      }),
    })
    setMessage(watched.message)
    if (watched.ok) setWatchedIds((current) => ({ ...current, [item.id]: true }))
  }

  const currentQuerySaved = savedQueryKey === `${query.trim().toLowerCase()}-${state}`

  return (
    <Screen
      eyebrow="Client search"
      title="Check a client before you take the job."
      body="Search names, businesses, cities, and private identifiers. Sensitive matching details stay protected."
      badge="Private"
    >
      <BureauHero
        eyebrow="Search before you sign"
        title="Fast context before you commit."
        body="Use search as the first step before labor, materials, scheduling, deposits, or payment follow-up."
      >
        <StatusPill label="Private matching" tone="gold" />
        <TrustBadge label="Moderated profiles" tone="green" />
      </BureauHero>

      <View style={styles.metricGrid}>
        <CommandCard
          icon={Search}
          label="Search intent"
          title="Name, business, city, phone, or email"
          body="Private identifiers are used for matching only. Public profiles do not show raw contact details."
          tone="gold"
        />
        <CommandCard
          icon={Bell}
          label="After search"
          title="Save or watch"
          body="Keep useful searches in your account and monitor profiles before accepting more work."
        />
        <CommandCard
          icon={Share2}
          label="Growth"
          title="Share the app"
          body="Send Client Bureau to another contractor who should check clients before scheduling work."
          onPress={shareClientBureauApp}
        />
      </View>

      <BureauSearchBox
        buttonLabel="Search a Client"
        loading={busy}
        onChangeText={setQuery}
        onSubmit={runSearch}
        placeholder="John Smith Orlando"
        value={query}
      />
      <View style={styles.chipRail}>
        {quickSearches.map((item) => (
          <SuggestionChip
            key={item}
            label={item}
            onPress={() => {
              setQuery(item)
              setMessage("Suggestion added. Tap Search a Client to run the lookup.")
            }}
          />
        ))}
      </View>
      <SegmentedTabs options={stateOptions} value={state} onChange={setState} />

      <LaunchChecklist
        title="Search workflow"
        items={[
          { label: "Enter a name, business, city, phone, or email", done: query.trim().length > 0 },
          { label: "Run a private match before taking the job", done: Boolean(result?.ok) },
          { label: "Open a profile, save the search, or watch the client", done: currentQuerySaved || Object.values(watchedIds).some(Boolean) },
        ]}
      />

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
                  {item.businessName ? <Text style={styles.helper}>{item.businessName}</Text> : null}
                  <Text style={styles.body}>
                    {item.city}, {item.state} / {item.reportCount} approved signal(s)
                  </Text>
                  <Text style={styles.helper}>Match confidence: {Math.round(item.matchScore)} / 100</Text>
                </View>
                <StatusPill label={item.riskLevel} tone={item.riskLevel === "Low" ? "green" : item.riskLevel === "High" ? "red" : "gold"} />
              </View>
              <View style={styles.signalRail}>
                <StatusPill label={item.evidenceOnFile ? "Evidence on file" : "No evidence summary"} tone={item.evidenceOnFile ? "green" : "neutral"} />
                <StatusPill label={`${item.positiveSignalCount} positive`} tone="blue" />
                <StatusPill label={`${item.openDisputeCount} dispute`} tone={item.openDisputeCount ? "gold" : "neutral"} />
              </View>
              <TrustScoreCard
                score={item.score}
                label="Client Bureau signal"
                body={item.latestSummary ?? item.paymentContextLabel}
              />
              <Text style={styles.helper}>{item.matchedBy}</Text>
              <View style={styles.metricGrid}>
                <MetricMini label="Reports" value={item.reportCount} />
                <MetricMini label="Resolved" value={item.resolvedReportCount} />
                <MetricMini label="Positive" value={item.positiveSignalCount} />
              </View>
              <IconActionRow
                icon={Eye}
                title="Open public profile"
                body="View approved report context and response status."
                onPress={() => WebBrowser.openBrowserAsync(`${siteUrl}/client/${item.publicSlug}`)}
              />
              <IconActionRow
                icon={Bell}
                title={watchedIds[item.id] ? "Client is on your watchlist" : "Watch this client"}
                body={
                  watchedIds[item.id]
                    ? "You will see this client in your watchlist workspace."
                    : "Save this profile to monitor approved updates and response activity."
                }
                badge={watchedIds[item.id] ? "Saved" : "Watch"}
                onPress={() => watchClient(item)}
              />
              <IconActionRow
                icon={Share2}
                title="Share public profile"
                body="Send the approved public profile link without exposing private evidence or identifiers."
                onPress={() => shareClientProfile(item)}
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
                body="Save this search, try a broader city/name search, or document a real client experience if you have project records."
                actionTitle={currentQuerySaved ? "Search saved" : "Save this search"}
                onAction={() => saveSearch(0)}
              />
              <IconActionRow
                icon={Bell}
                title={currentQuerySaved ? "Saved for follow-up" : "Save this search"}
                body={
                  currentQuerySaved
                    ? "This lookup is saved in your account for later follow-up."
                    : "Saved searches help you return to leads before scheduling or buying materials."
                }
                badge={currentQuerySaved ? "Saved" : undefined}
                onPress={() => saveSearch(0)}
              />
              <IconActionRow
                icon={FileText}
                title="Document this client experience"
                body="Create a report draft if you have a real project record and supporting context."
                onPress={() => router.push("/reports")}
              />
              <IconActionRow
                icon={UserPlus}
                title="Invite another contractor"
                body="Know someone else who should check clients first? Share Client Bureau."
                badge="Share"
                onPress={inviteContractorToClientBureau}
              />
            </>
          ) : (
            <IconActionRow
              icon={Save}
              title={currentQuerySaved ? "Search saved" : "Save this search"}
              body={
                currentQuerySaved
                  ? "This lookup is saved in your account for later follow-up."
                  : "Keep this client lookup in your account for later follow-up."
              }
              badge={currentQuerySaved ? "Saved" : undefined}
              onPress={() => saveSearch(result.data.results.length)}
            />
          )}
          {result.data.results.length ? (
            <IconActionRow
              icon={UserPlus}
              title="Invite another contractor"
              body="Share the app with a contractor who should search before taking the job."
              badge="Share"
              onPress={inviteContractorToClientBureau}
            />
          ) : null}
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
