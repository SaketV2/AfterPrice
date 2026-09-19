import 'server-only'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { BillingPersistenceError } from '@/lib/billing/errors'
import { isEntitledBillingSubscription } from '@/lib/billing/entitlement'
import type { BillingSubscriptionRow } from './types'

type BillingAdminClient = ReturnType<typeof getBillingAdminClient>

export type BillingEntitlement = {
  entitled: boolean
  planKey: 'monthly' | 'yearly' | null
  subscriptionId: string | null
  status: string | null
  paymentState: string | null
  currentPeriodEnd: string | null
}

export class ProRequiredError extends Error {
  readonly code = 'PRO_REQUIRED'

  constructor() {
    super('Pro entitlement required.')
    this.name = 'ProRequiredError'
  }
}

export class BillingEntitlementLookupError extends BillingPersistenceError {
  readonly code = 'BILLING_ENTITLEMENT_LOOKUP_FAILED'

  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : 'Billing entitlement lookup failed.')
    this.name = 'BillingEntitlementLookupError'
  }
}

export async function getUserBillingEntitlement(userId: string, now = new Date()): Promise<BillingEntitlement> {
  const db = getBillingAdminClient()
  const { data, error } = await db
    .from('billing_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20)
  if (error) throw new BillingEntitlementLookupError(error)

  const rows = (data ?? []) as BillingSubscriptionRow[]
  const active = rows.find(row => isEntitledBillingSubscription(row, now))
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

export async function requireProEntitlement(userId: string, now = new Date()): Promise<BillingEntitlement> {
  const entitlement = await getUserBillingEntitlement(userId, now)
  if (!entitlement.entitled) throw new ProRequiredError()
  return entitlement
}

export async function getEntitledUserIds(
  userIds: string[],
  now = new Date(),
  db: BillingAdminClient = getBillingAdminClient(),
): Promise<Set<string>> {
  const uniqueUserIds = [...new Set(userIds)]
  if (!uniqueUserIds.length) return new Set()
  const { data, error } = await db
    .from('billing_subscriptions')
    .select('*')
    .in('user_id', uniqueUserIds)
    .limit(uniqueUserIds.length * 20)
  if (error) throw new BillingEntitlementLookupError(error)

  const entitled = new Set<string>()
  for (const row of (data ?? []) as BillingSubscriptionRow[]) {
    if (isEntitledBillingSubscription(row, now)) entitled.add(row.user_id)
  }
  return entitled
}
