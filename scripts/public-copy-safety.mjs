export const productionCopyLeakPatterns = [
  { label: "MVP language", pattern: /\bmvp\b/i },
  { label: "demo language", pattern: /\bdemo\b/i },
  { label: "mock language", pattern: /\bmock\b/i },
  { label: "seeded-data language", pattern: /\bseeded data\b/i },
  { label: "test checkout language", pattern: /\b(?:test checkout|mock checkout|stripe test|test mode)\b/i },
  { label: "developer-facing language", pattern: /\bdeveloper[-\s]facing\b/i },
  { label: "mobile build implementation term", pattern: /\bversioncode\b/i },
  { label: "API auth implementation term", pattern: /\bbearer auth\b/i },
  { label: "environment variable leak", pattern: /\b(?:data_mode|platform_feature_data_mode)\b/i },
  { label: "secret/configuration implementation term", pattern: /\b(?:service role|webhook secret|publishable key)\b/i },
  { label: "internal platform-mode language", pattern: /\b(?:supabase-backed|safe mode)\b/i },
  {
    label: "inflammatory public language",
    pattern: /\b(?:blacklist|expose|shame|fraudster|scammer|deadbeat|guilty)\b/i,
  },
]

export function visiblePageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#x27;|&#39;|&amp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function findProductionCopyLeaks(html) {
  const text = visiblePageText(html)

  return productionCopyLeakPatterns
    .map(({ label, pattern }) => {
      const match = text.match(pattern)

      return match ? `${label}: "${match[0]}"` : ""
    })
    .filter(Boolean)
}
