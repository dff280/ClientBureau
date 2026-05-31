import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getSupabaseServiceConfig } from "@/lib/supabase/config"

export function createServiceClient() {
  const { url, serviceKey } = getSupabaseServiceConfig()

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
