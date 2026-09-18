import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { BillingConfigurationError } from './errors'

// The generated project types predate the billing migration. Keep billing
// access isolated here until the project's generated types are regenerated.
type DynamicBillingDatabase = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }>
    Views: Record<string, never>
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>
    Enums: Record<string, string>
    CompositeTypes: Record<string, Record<string, unknown>>
  }
}

export type BillingDb = SupabaseClient<DynamicBillingDatabase>

export function getBillingAdminClient(): BillingDb {
  const client = createServiceRoleClient()
  if (!client) {
    throw new BillingConfigurationError('Billing needs the server-only Supabase service key.')
  }
  return client as unknown as BillingDb
}
