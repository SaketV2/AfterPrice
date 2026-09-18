import { BillingConfigurationError } from './errors'

export const BILLING_PLAN_KEYS = ['monthly', 'yearly'] as const
export type BillingPlanKey = (typeof BILLING_PLAN_KEYS)[number]

export type BillingPlan = {
  key: BillingPlanKey
  priceId: string
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new BillingConfigurationError(`Billing is not configured. Set ${name}.`)
  return value
}

function requirePriceId(name: string): string {
  const value = requiredEnv(name)
  if (!/^price_[A-Za-z0-9]+$/.test(value)) {
    throw new BillingConfigurationError(`${name} must be a Stripe Price ID.`)
  }
  return value
}

export function getBillingPlans(): readonly BillingPlan[] {
  const plans: BillingPlan[] = [
    { key: 'monthly', priceId: requirePriceId('STRIPE_PRICE_MONTHLY') },
    { key: 'yearly', priceId: requirePriceId('STRIPE_PRICE_YEARLY') },
  ]
  if (new Set(plans.map(plan => plan.priceId)).size !== plans.length) {
    throw new BillingConfigurationError('Monthly and yearly Stripe Price IDs must be different.')
  }
  return plans
}

export function getBillingPlan(planKey: string): BillingPlan {
  if (!BILLING_PLAN_KEYS.includes(planKey as BillingPlanKey)) {
    throw new BillingConfigurationError('Unsupported billing plan.')
  }
  const plan = getBillingPlans().find(item => item.key === planKey)
  if (!plan) throw new BillingConfigurationError('Unsupported billing plan.')
  return plan
}

export function getPlanKeyForPriceId(priceId: string): BillingPlanKey | 'unknown' {
  const monthlyPriceId = process.env.STRIPE_PRICE_MONTHLY?.trim()
  const yearlyPriceId = process.env.STRIPE_PRICE_YEARLY?.trim()
  if (priceId === monthlyPriceId) return 'monthly'
  if (priceId === yearlyPriceId) return 'yearly'
  return 'unknown'
}
