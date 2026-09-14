import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { getSupabasePublicEnv } from './env'

export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim()
  if (!serviceKey) return null
  const { url } = getSupabasePublicEnv()
  return createSupabaseClient<Database>(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } })
}
