import 'server-only'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import type { BillingSubscriptionRow } from './types'

const ENTITLED_STATUSES = new Set(['active', 'trialing'])
const ENTITLED_PAYMENT_STATES = new Set(['paid', 'no_payment_required'])

export type BillingEntitlement = {
  entitled: boolean
  planKey: 'monthly' | 'yearly' | null
  subscriptionId: string | null
  status: string | null
  paymentState: string | null
  currentPeriodEnd: string | null
}

export async function getUserBillingEntitlement(userId: string, now = new Date()): Promise<BillingEntitlement> {
  const db = getBillingAdminClient()
  const { data, error } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(`Billing entitlement lookup failed: ${error.message}`)

  const rows = (data ?? []) as BillingSubscriptionRow[]
  const active = rows.find(row => {
    if (!ENTITLED_STATUSES.has(row.status) || !ENTITLED_PAYMENT_STATES.has(row.payment_state)) return false
    return !row.current_period_end || Date.parse(row.current_period_end) > now.getTime()
  })
  const planKey = active?.plan_key === 'monthly' || active?.plan_key === 'yearly' ? active.plan_key : null
  return {
    entitled: Boolean(active && planKey),
    planKey,
    subscriptionId: active?.stripe_subscription_id ?? null,
    status: active?.status ?? null,
    paymentState: active?.payment_state ?? null,
    currentPeriodEnd: active?.current_period_end ?? null,
  }
}

export async function getCurrentUserBillingEntitlement(): Promise<BillingEntitlement | null> {
  const { userId } = await getAuthenticatedContext()
  return userId ? getUserBillingEntitlement(userId) : null
}

export async function hasBillingEntitlement(userId: string, now = new Date()): Promise<boolean> {
  return (await getUserBillingEntitlement(userId, now)).entitled
}
