import 'server-only'
import { BillingConfigurationError } from './errors'
import { getBillingPlan, getBillingPlans, getPlanKeyForPriceId, type BillingPlan, type BillingPlanKey, BILLING_PLAN_KEYS } from './plan-config'

export { BILLING_PLAN_KEYS, getBillingPlan, getBillingPlans, getPlanKeyForPriceId }
export type { BillingPlan, BillingPlanKey }

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new BillingConfigurationError(`Billing is not configured. Set ${name}.`)
  return value
}

export function getBillingSiteUrl(): string {
  const value = requiredEnv('NEXT_PUBLIC_SITE_URL')
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new BillingConfigurationError('NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BillingConfigurationError('NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL.')
  }
  if (url.search || url.hash) {
    throw new BillingConfigurationError('NEXT_PUBLIC_SITE_URL must not contain a query string or hash.')
  }
  return url.toString().replace(/\/$/, '')
}

export function getStripeWebhookSecret(): string {
  return requiredEnv('STRIPE_WEBHOOK_SECRET')
}
