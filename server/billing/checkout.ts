import type Stripe from 'stripe'
import { createPendingCheckoutClaim, PENDING_CHECKOUT_TTL_MS, normalizeBillingEmail, randomIntegrationSuffix } from '@/lib/billing/claims'
import { getBillingPlan, getBillingSiteUrl, type BillingPlanKey } from '@/lib/billing/env'
import { BillingPersistenceError } from '@/lib/billing/errors'
import { getStripeClient } from '@/lib/billing/stripe'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import {
  attachCheckoutSession,
  createPendingCheckout,
  findBillingCustomer,
  markPendingCheckoutExpired,
  saveBillingCustomer,
} from './repository'

export type CreateCheckoutInput = {
  planKey: BillingPlanKey
  userId?: string
  userEmail?: string | null
  guestEmail?: string
}

export type CheckoutCreationResult = {
  checkoutSessionId: string
  checkoutUrl: string
  claimToken?: string
}

async function getOrCreateStripeCustomer(db: ReturnType<typeof getBillingAdminClient>, stripe: Stripe, userId: string, email: string): Promise<string> {
  const existing = await findBillingCustomer(db, userId)
  if (existing) return existing.stripe_customer_id

  const customer = await stripe.customers.create(
    { email, metadata: { afterprice_user_id: userId } },
    { idempotencyKey: `afterprice_customer_${userId}` },
  )
  try {
    await saveBillingCustomer(db, userId, customer.id)
  } catch (error) {
    throw new BillingPersistenceError(error instanceof Error ? error.message : 'Billing customer could not be saved.')
  }
  return customer.id
}

export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutCreationResult> {
  const plan = getBillingPlan(input.planKey)
  const siteUrl = getBillingSiteUrl()
  const stripe = getStripeClient()
  const db = getBillingAdminClient()
  const isAuthenticated = Boolean(input.userId)
  const email = isAuthenticated ? normalizeBillingEmail(input.userEmail ?? '') : normalizeBillingEmail(input.guestEmail ?? '')
  if (!email) throw new BillingPersistenceError('A checkout email address is required.')

  const claim = isAuthenticated ? null : createPendingCheckoutClaim()
  if (claim) {
    await createPendingCheckout(db, {
      id: claim.id,
      claim_token_hash: claim.tokenHash,
      email,
      plan_key: plan.key,
      stripe_price_id: plan.priceId,
      expires_at: new Date(Date.now() + PENDING_CHECKOUT_TTL_MS).toISOString(),
    })
  }

  let customerId: string | null = null
  if (input.userId) customerId = await getOrCreateStripeCustomer(db, stripe, input.userId, email)

  const metadata: Stripe.MetadataParam = {
    plan_key: plan.key,
    price_id: plan.priceId,
  }
  if (input.userId) metadata.user_id = input.userId
  if (claim) metadata.pending_checkout_id = claim.id

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    client_reference_id: input.userId ?? claim?.id,
    success_url: `${siteUrl}/${input.userId ? 'app?checkout=success' : 'signup?checkout=success'}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pricing`,
    integration_identifier: `afterprice_${randomIntegrationSuffix()}`,
  }
  if (customerId) params.customer = customerId
  else params.customer_email = email

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create(params)
  } catch (error) {
    if (claim) {
      try {
        await markPendingCheckoutExpired(db, claim.id)
      } catch {
        // Preserve the Stripe error. The pending row remains non-claimable if
        // cleanup is unavailable, and will be excluded after its expiry.
      }
    }
    throw error
  }

  if (!session.url) throw new BillingPersistenceError('Stripe did not return a hosted Checkout URL.')
  if (claim) await attachCheckoutSession(db, claim.id, session.id)

  return { checkoutSessionId: session.id, checkoutUrl: session.url, ...(claim ? { claimToken: claim.token } : {}) }
}
