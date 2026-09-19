import 'server-only'
import { BillingPersistenceError } from '@/lib/billing/errors'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { hashRateLimitKey } from '@/lib/billing/rate-limit'

export { hashRateLimitKey }

export type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

export async function consumeAccountRateLimit(input: {
  key: string
  limit: number
  windowSeconds: number
}): Promise<RateLimitResult> {
  const keyHash = hashRateLimitKey(input.key)
  const db = getBillingAdminClient()
  const { data, error } = await db.rpc('consume_rate_limit', {
    p_key_hash: keyHash,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  })
  if (error) throw new BillingPersistenceError('Rate limit could not be checked.')
  const result = Array.isArray(data) ? data[0] : data
  if (!result || typeof result.allowed !== 'boolean') {
    throw new BillingPersistenceError('Rate limit returned an invalid result.')
  }
  return {
    allowed: result.allowed,
    retryAfterSeconds: Math.max(0, Number(result.retry_after_seconds) || 0),
  }
}
