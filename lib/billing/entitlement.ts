export type BillingSubscriptionForEntitlement = {
  status: string
  payment_state: string
  plan_key: string
  current_period_end: string | null
}

const ENTITLED_STATUSES = new Set(['active', 'trialing'])
const ENTITLED_PAYMENT_STATES = new Set(['paid', 'no_payment_required'])

export function isEntitledBillingSubscription(row: BillingSubscriptionForEntitlement, now = new Date()): boolean {
  if (!ENTITLED_STATUSES.has(row.status) || !ENTITLED_PAYMENT_STATES.has(row.payment_state)) return false
  if (row.plan_key !== 'monthly' && row.plan_key !== 'yearly') return false
  return !row.current_period_end || Date.parse(row.current_period_end) > now.getTime()
}
