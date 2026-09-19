import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/service'
import type { Database } from '@/lib/supabase/database.types'
import { BillingConfigurationError } from './errors'

export type BillingDb = SupabaseClient<Database>

export function getBillingAdminClient(): BillingDb {
  const client = createServiceRoleClient()
  if (!client) {
    throw new BillingConfigurationError('Billing needs the server-only Supabase service key.')
  }
  return client
}
