import { apiBaseUrl } from "./config"
import type { ApiResult } from "./types"

export async function mobileFetch<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  })

  const payload = (await response.json().catch(() => ({
    ok: false,
    message: "Client Bureau returned an unreadable response.",
  }))) as ApiResult<T>

  if (!response.ok && payload.ok) {
    return { ok: false, message: "Request failed. Please try again." }
  }

  return payload
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value)
}
