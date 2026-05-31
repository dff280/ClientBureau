import type { ZodError } from "zod"

import type { ActionResult } from "@/lib/types"

export function ok<T>(data: T, message: string): ActionResult<T> {
  return { ok: true, data, message }
}

export function fail<T = never>(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { ok: false, message, fieldErrors }
}

export function zodFieldErrors(error: ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>
}

export function formDataToObject(formData: FormData) {
  const data: Record<string, FormDataEntryValue | boolean> = {}

  formData.forEach((value, key) => {
    data[key] = value
  })

  return data
}
