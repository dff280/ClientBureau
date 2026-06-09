import { apiBaseUrl } from "./config"
import type { ApiResult } from "./types"

export async function mobileFetch<T>(
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)
  headers.set("Accept", "application/json")

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => ({
      ok: false,
      message: "Client Bureau returned an unreadable response.",
    }))) as ApiResult<T>

    if (!response.ok && payload.ok) {
      return { ok: false, message: "Request failed. Please try again." }
    }

    return payload
  } catch (error) {
    const offlineMessage =
      error instanceof Error && error.name === "AbortError"
        ? "Client Bureau took too long to respond. Check your connection and try again."
        : "Could not reach Client Bureau. Check your connection and try again."

    return { ok: false, message: offlineMessage }
  } finally {
    clearTimeout(timeout)
  }
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value)
}
