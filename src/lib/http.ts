export const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
}

export function withNoStore<T extends Response>(response: T) {
  for (const [key, value] of Object.entries(noStoreHeaders)) {
    response.headers.set(key, value)
  }

  return response
}
