import { BillingPersistenceError } from '@/lib/billing/errors'
import type { Database } from '@/lib/supabase/database.types'
import type { BillingDb } from '@/lib/billing/supabase'
import type { BillingCustomerRow, BillingSubscriptionRow, PendingCheckoutRow, SubscriptionSnapshot } from './types'

function persistenceError(operation: string, error: { message: string } | null | undefined): BillingPersistenceError {
  return new BillingPersistenceError(`${operation} failed: ${error?.message ?? 'unknown database error'}`)
}

export async function findBillingCustomer(db: BillingDb, userId: string): Promise<BillingCustomerRow | null> {
  const { data, error } = await db.from('billing_customers').select('user_id, stripe_customer_id').eq('user_id', userId).maybeSingle()
  if (error) throw persistenceError('Billing customer lookup', error)
  return (data as BillingCustomerRow | null) ?? null
}

export async function findBillingCustomerByStripeId(db: BillingDb, stripeCustomerId: string): Promise<BillingCustomerRow | null> {
  const { data, error } = await db.from('billing_customers').select('user_id, stripe_customer_id').eq('stripe_customer_id', stripeCustomerId).maybeSingle()
  if (error) throw persistenceError('Stripe customer lookup', error)
  return (data as BillingCustomerRow | null) ?? null
}

export async function saveBillingCustomer(db: BillingDb, userId: string, stripeCustomerId: string): Promise<BillingCustomerRow> {
  const existing = await findBillingCustomer(db, userId)
  if (existing && existing.stripe_customer_id !== stripeCustomerId) {
    throw new BillingPersistenceError('The user is already associated with a different Stripe customer.')
  }

  const { data, error } = await db
    .from('billing_customers')
    .upsert({ user_id: userId, stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('user_id, stripe_customer_id')
    .single()
  if (error || !data) throw persistenceError('Billing customer save', error)
  return data as BillingCustomerRow
}

export async function createPendingCheckout(
  db: BillingDb,
  input: Pick<PendingCheckoutRow, 'id' | 'claim_token_hash' | 'email' | 'plan_key' | 'stripe_price_id' | 'expires_at'>,
): Promise<PendingCheckoutRow> {
  const { data, error } = await db
    .from('pending_checkouts')
    .insert({
      id: input.id,
      claim_token_hash: input.claim_token_hash,
      email: input.email,
      plan_key: input.plan_key,
      stripe_price_id: input.stripe_price_id,
      expires_at: input.expires_at,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error || !data) throw persistenceError('Pending checkout creation', error)
  return data as PendingCheckoutRow
}

export async function attachCheckoutSession(db: BillingDb, pendingId: string, checkoutSessionId: string): Promise<PendingCheckoutRow> {
  const { data, error } = await db
    .from('pending_checkouts')
    .update({ checkout_session_id: checkoutSessionId, updated_at: new Date().toISOString() })
    .eq('id', pendingId)
    .select('*')
    .single()
  if (error || !data) throw persistenceError('Pending checkout association', error)
  return data as PendingCheckoutRow
}

export async function markPendingCheckoutExpired(db: BillingDb, pendingId: string): Promise<void> {
  const { error } = await db
    .from('pending_checkouts')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('id', pendingId)
    .eq('status', 'pending')
  if (error) throw persistenceError('Pending checkout expiry', error)
}

export async function expireStalePendingCheckouts(db: BillingDb): Promise<number> {
  const { data, error } = await db
    .from('pending_checkouts')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lte('expires_at', new Date().toISOString())
    .select('id')
  if (error) throw persistenceError('Pending checkout cleanup', error)
  return data?.length ?? 0
}

export async function findPendingCheckoutById(db: BillingDb, id: string): Promise<PendingCheckoutRow | null> {
  const { data, error } = await db.from('pending_checkouts').select('*').eq('id', id).maybeSingle()
  if (error) throw persistenceError('Pending checkout lookup', error)
  return (data as PendingCheckoutRow | null) ?? null
}

export async function findPendingCheckoutBySession(db: BillingDb, checkoutSessionId: string): Promise<PendingCheckoutRow | null> {
  const { data, error } = await db.from('pending_checkouts').select('*').eq('checkout_session_id', checkoutSessionId).maybeSingle()
  if (error) throw persistenceError('Checkout session lookup', error)
  return (data as PendingCheckoutRow | null) ?? null
}

export async function findPendingCheckoutBySubscription(db: BillingDb, subscriptionId: string): Promise<PendingCheckoutRow | null> {
  const { data, error } = await db.from('pending_checkouts').select('*').eq('stripe_subscription_id', subscriptionId).maybeSingle()
  if (error) throw persistenceError('Pending subscription lookup', error)
  return (data as PendingCheckoutRow | null) ?? null
}

type PendingStripeUpdate = {
  checkoutSessionId?: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripeSubscriptionStatus?: string | null
  checkoutPaymentStatus?: string
  paymentState?: string
  status?: PendingCheckoutRow['status']
  cancelAtPeriodEnd?: boolean
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  trialEnd?: string | null
  endedAt?: string | null
}

export async function updatePendingCheckoutFromStripe(db: BillingDb, pendingId: string, update: PendingStripeUpdate): Promise<PendingCheckoutRow | null> {
  const values: Database['public']['Tables']['pending_checkouts']['Update'] = { updated_at: new Date().toISOString() }
  if (update.checkoutSessionId !== undefined) values.checkout_session_id = update.checkoutSessionId
  if (update.stripeCustomerId !== undefined) values.stripe_customer_id = update.stripeCustomerId
  if (update.stripeSubscriptionId !== undefined) values.stripe_subscription_id = update.stripeSubscriptionId
  if (update.stripeSubscriptionStatus !== undefined) values.stripe_subscription_status = update.stripeSubscriptionStatus
  if (update.checkoutPaymentStatus !== undefined) values.checkout_payment_status = update.checkoutPaymentStatus
  if (update.paymentState !== undefined) values.payment_state = update.paymentState
  if (update.status !== undefined) values.status = update.status
  if (update.cancelAtPeriodEnd !== undefined) values.cancel_at_period_end = update.cancelAtPeriodEnd
  if (update.currentPeriodStart !== undefined) values.current_period_start = update.currentPeriodStart
  if (update.currentPeriodEnd !== undefined) values.current_period_end = update.currentPeriodEnd
  if (update.trialEnd !== undefined) values.trial_end = update.trialEnd
  if (update.endedAt !== undefined) values.ended_at = update.endedAt

  const { data, error } = await db.from('pending_checkouts').update(values).eq('id', pendingId).neq('status', 'claimed').select('*').maybeSingle()
  if (error) throw persistenceError('Pending checkout Stripe update', error)
  return (data as PendingCheckoutRow | null) ?? null
}

export async function upsertBillingSubscription(db: BillingDb, snapshot: SubscriptionSnapshot, userId: string): Promise<BillingSubscriptionRow> {
  const { data: existing, error: existingError } = await db
    .from('billing_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', snapshot.id)
    .maybeSingle()
  if (existingError) throw persistenceError('Billing subscription lookup', existingError)
  if (existing && existing.user_id !== userId) throw new BillingPersistenceError('The Stripe subscription is already associated with another user.')

  const { data, error } = await db
    .from('billing_subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: snapshot.customerId,
        stripe_subscription_id: snapshot.id,
        stripe_price_id: snapshot.priceId,
        plan_key: snapshot.planKey,
        status: snapshot.status,
        payment_state: snapshot.paymentState,
        cancel_at_period_end: snapshot.cancelAtPeriodEnd,
        current_period_start: snapshot.currentPeriodStart,
        current_period_end: snapshot.currentPeriodEnd,
        trial_end: snapshot.trialEnd,
        ended_at: snapshot.endedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    )
    .select('*')
    .single()
  if (error || !data) throw persistenceError('Billing subscription save', error)
  return data as BillingSubscriptionRow
}

export async function updateSubscriptionPaymentState(db: BillingDb, subscriptionId: string, paymentState: string): Promise<void> {
  const { error } = await db
    .from('billing_subscriptions')
    .update({ payment_state: paymentState, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId)
  if (error) throw persistenceError('Billing payment state update', error)
}

export async function claimPendingCheckout(
  db: BillingDb,
  input: { checkoutSessionId: string; claimTokenHash: string; userId: string; email: string },
): Promise<PendingCheckoutRow | null> {
  const { data, error } = await db.rpc('claim_pending_checkout', {
    p_checkout_session_id: input.checkoutSessionId,
    p_claim_token_hash: input.claimTokenHash,
    p_user_id: input.userId,
    p_email: input.email,
  })
  if (error) throw persistenceError('Pending checkout claim', error)
  const rows = (data ?? []) as PendingCheckoutRow[]
  return rows[0] ?? null
}

export async function beginStripeEvent(db: BillingDb, eventId: string, eventType: string): Promise<boolean> {
  const now = new Date()
  const { error } = await db.from('stripe_events').insert({ event_id: eventId, event_type: eventType, status: 'processing', attempted_at: now.toISOString() })
  if (!error) return true
  if (error.code !== '23505') throw persistenceError('Stripe event record', error)

  const { data: existing, error: lookupError } = await db.from('stripe_events').select('status, attempted_at').eq('event_id', eventId).maybeSingle()
  if (lookupError) throw persistenceError('Stripe event lookup', lookupError)
  if (!existing || existing.status === 'processed') return false
  if (existing.status === 'processing' && Date.parse(String(existing.attempted_at)) > now.getTime() - 10 * 60 * 1000) return false

  const update = db
    .from('stripe_events')
    .update({ status: 'processing', attempted_at: now.toISOString(), last_error: null })
    .eq('event_id', eventId)
    .neq('status', 'processed')
  if (existing.status === 'processing') update.lt('attempted_at', new Date(now.getTime() - 10 * 60 * 1000).toISOString())
  const { error: updateError } = await update
  if (updateError) throw persistenceError('Stripe event retry claim', updateError)
  return true
}

export async function completeStripeEvent(db: BillingDb, eventId: string): Promise<void> {
  const { error } = await db.from('stripe_events').update({ status: 'processed', processed_at: new Date().toISOString(), last_error: null }).eq('event_id', eventId)
  if (error) throw persistenceError('Stripe event completion', error)
}

export async function failStripeEvent(db: BillingDb, eventId: string, message: string): Promise<void> {
  const { error } = await db.from('stripe_events').update({ status: 'failed', last_error: message.slice(0, 1000) }).eq('event_id', eventId)
  if (error) throw persistenceError('Stripe event failure record', error)
}
