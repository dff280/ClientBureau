const fallbackReleaseDate = "2026-06-12T00:00:00.000Z"

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }

  return null
}

function dateFromUnixSeconds(value: string) {
  const seconds = Number(value)

  if (!Number.isFinite(seconds) || seconds <= 0) return null

  return new Date(seconds * 1000)
}

function safeDate(value: string | null) {
  if (!value) return null

  if (/^\d+$/.test(value)) return dateFromUnixSeconds(value)

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function getReleaseLastModified() {
  return (
    safeDate(readFirstEnv(["RELEASE_DATE", "NEXT_PUBLIC_RELEASE_DATE", "BUILD_DATE", "SOURCE_DATE_EPOCH"])) ??
    new Date(fallbackReleaseDate)
  )
}

export function getReleaseLastModifiedIso() {
  return getReleaseLastModified().toISOString()
}
