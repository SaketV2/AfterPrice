import type Stripe from 'stripe'
import { getPlanKeyForPriceId } from '@/lib/billing/env'
import { getStripeClient } from '@/lib/billing/stripe'
import type { BillingDb } from '@/lib/billing/supabase'
import {
  findBillingCustomerByStripeId,
  findPendingCheckoutById,
  findPendingCheckoutBySession,
  findPendingCheckoutBySubscription,
  saveBillingCustomer,
  updatePendingCheckoutFromStripe,
  updateSubscriptionPaymentState,
  upsertBillingSubscription,
} from './repository'
import type { PendingCheckoutRow, SubscriptionSnapshot } from './types'

function expandableId(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id
  return null
}

function metadataValue(metadata: Stripe.Metadata | null | undefined, key: string): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function userIdFromMetadata(metadata: Stripe.Metadata | null | undefined, fallback: string | null = null): string | null {
  const value = metadataValue(metadata, 'user_id') ?? fallback
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null
}

function toIsoTimestamp(value: number | null | undefined): string | null {
  return typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null
}

function paymentStateForSubscriptionStatus(status: string): string {
  if (status === 'active') return 'paid'
  if (status === 'trialing') return 'no_payment_required'
  if (status === 'past_due') return 'past_due'
  if (status === 'unpaid') return 'unpaid'
  if (status === 'incomplete') return 'incomplete'
  if (status === 'incomplete_expired') return 'failed'
  if (status === 'paused') return 'paused'
  if (status === 'canceled') return 'canceled'
  return 'unknown'
}

function subscriptionPriceId(subscription: Stripe.Subscription, fallbackPriceId?: string | null): string | null {
  const item = subscription.items.data[0]
  return expandableId(item?.price) ?? fallbackPriceId ?? null
}

function subscriptionSnapshot(subscription: Stripe.Subscription, fallbackPriceId?: string | null): SubscriptionSnapshot {
  const customerId = expandableId(subscription.customer)
  const priceId = subscriptionPriceId(subscription, fallbackPriceId)
  if (!customerId || !priceId) throw new Error('Stripe subscription is missing its customer or Price ID.')
  const item = subscription.items.data[0]
  return {
    id: subscription.id,
    customerId,
    priceId,
    planKey: getPlanKeyForPriceId(priceId),
    status: subscription.status,
    paymentState: paymentStateForSubscriptionStatus(subscription.status),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: toIsoTimestamp(item?.current_period_start),
    currentPeriodEnd: toIsoTimestamp(item?.current_period_end),
    trialEnd: toIsoTimestamp(subscription.trial_end),
    endedAt: toIsoTimestamp(subscription.ended_at),
  }
}

function checkoutIsPaid(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === 'paid' || paymentStatus === 'no_payment_required'
}

function paymentStateIsPaid(paymentState: string): boolean {
  return paymentState === 'paid' || paymentState === 'no_payment_required'
}

async function pendingForSubscriptionEvent(db: BillingDb, subscription: Stripe.Subscription): Promise<PendingCheckoutRow | null> {
  const pendingId = metadataValue(subscription.metadata, 'pending_checkout_id')
  if (pendingId) {
    const pending = await findPendingCheckoutById(db, pendingId)
    if (pending) return pending
  }
  return findPendingCheckoutBySubscription(db, subscription.id)
}

async function syncSubscription(db: BillingDb, subscription: Stripe.Subscription, options: { fallbackPriceId?: string | null; userId?: string | null } = {}): Promise<void> {
  const pending = await pendingForSubscriptionEvent(db, subscription)
  const snapshot = subscriptionSnapshot(subscription, options.fallbackPriceId ?? pending?.stripe_price_id)
  const customer = await findBillingCustomerByStripeId(db, snapshot.customerId)
  const metadataUserId = userIdFromMetadata(subscription.metadata, options.userId ?? null)
  const userId = metadataUserId ?? customer?.user_id ?? null

  if (pending) {
    const status = pending.status === 'expired'
      ? 'expired'
      : checkoutIsPaid(pending.checkout_payment_status) || paymentStateIsPaid(snapshot.paymentState)
        ? 'paid'
        : pending.status
    await updatePendingCheckoutFromStripe(db, pending.id, {
      stripeCustomerId: snapshot.customerId,
      stripeSubscriptionId: snapshot.id,
      stripeSubscriptionStatus: snapshot.status,
      paymentState: snapshot.paymentState,
      status,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      currentPeriodStart: snapshot.currentPeriodStart,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      trialEnd: snapshot.trialEnd,
      endedAt: snapshot.endedAt,
    })
  }

  if (!userId) return
  await saveBillingCustomer(db, userId, snapshot.customerId)
  await upsertBillingSubscription(db, snapshot, userId)
}

async function handleCheckoutCompleted(db: BillingDb, session: Stripe.Checkout.Session): Promise<void> {
  if (session.mode !== 'subscription') return
  const subscriptionId = expandableId(session.subscription)
  if (!subscriptionId) throw new Error('Completed subscription Checkout Session has no subscription ID.')

  const pendingId = metadataValue(session.metadata, 'pending_checkout_id')
  const pending = pendingId ? await findPendingCheckoutById(db, pendingId) : await findPendingCheckoutBySession(db, session.id)
  const stripe = getStripeClient()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const fallbackPriceId = metadataValue(session.metadata, 'price_id') ?? pending?.stripe_price_id
  const snapshot = subscriptionSnapshot(subscription, fallbackPriceId)
  const userId = userIdFromMetadata(session.metadata, session.client_reference_id)
  const customerId = expandableId(session.customer) ?? snapshot.customerId

  if (pending) {
    const status = pending.status === 'expired'
      ? 'expired'
      : checkoutIsPaid(session.payment_status) || paymentStateIsPaid(snapshot.paymentState)
        ? 'paid'
        : pending.status
    await updatePendingCheckoutFromStripe(db, pending.id, {
      checkoutSessionId: session.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: snapshot.id,
      stripeSubscriptionStatus: snapshot.status,
      checkoutPaymentStatus: session.payment_status,
      paymentState: snapshot.paymentState,
      status,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      currentPeriodStart: snapshot.currentPeriodStart,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      trialEnd: snapshot.trialEnd,
      endedAt: snapshot.endedAt,
    })
  }

  if (!userId) return
  await saveBillingCustomer(db, userId, customerId)
  await upsertBillingSubscription(db, snapshot, userId)
}

async function handleInvoicePayment(db: BillingDb, invoice: Stripe.Invoice, paymentState: string): Promise<void> {
  const invoiceData = invoice as unknown as Record<string, unknown>
  const parent = invoiceData.parent as Record<string, unknown> | null | undefined
  const subscriptionDetails = parent?.subscription_details as Record<string, unknown> | null | undefined
  const subscriptionId = expandableId(invoiceData.subscription) ?? expandableId(subscriptionDetails?.subscription)
  if (!subscriptionId) return

  const pending = await findPendingCheckoutBySubscription(db, subscriptionId)
  if (pending) {
    const status = pending.status === 'expired'
      ? 'expired'
      : paymentStateIsPaid(paymentState)
        ? 'paid'
        : pending.status
    await updatePendingCheckoutFromStripe(db, pending.id, { paymentState, status })
  }
  await updateSubscriptionPaymentState(db, subscriptionId, paymentState)
}

const subscriptionEventTypes = new Set<Stripe.Event.Type>([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.pending_update_applied',
  'customer.subscription.pending_update_expired',
  'customer.subscription.trial_will_end',
])

export async function handleStripeEvent(db: BillingDb, event: Stripe.Event): Promise<void> {
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(db, event.data.object as Stripe.Checkout.Session)
    return
  }
  if (subscriptionEventTypes.has(event.type)) {
    await syncSubscription(db, event.data.object as Stripe.Subscription)
    return
  }
  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    await handleInvoicePayment(db, event.data.object as Stripe.Invoice, 'paid')
    return
  }
  if (event.type === 'invoice.payment_failed') {
    await handleInvoicePayment(db, event.data.object as Stripe.Invoice, 'failed')
    return
  }
  if (event.type === 'invoice.payment_action_required' || event.type === 'invoice.payment_attempt_required') {
    await handleInvoicePayment(db, event.data.object as Stripe.Invoice, 'action_required')
  }
}
