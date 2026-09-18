import type Stripe from 'stripe'

export type BillingCustomerRow = {
  user_id: string
  stripe_customer_id: string
}

export type BillingSubscriptionRow = {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  plan_key: string
  status: string
  payment_state: string
  cancel_at_period_end: boolean
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export type PendingCheckoutRow = {
  id: string
  checkout_session_id: string | null
  claim_token_hash: string
  email: string
  plan_key: string
  stripe_price_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  checkout_payment_status: string
  payment_state: string
  status: 'pending' | 'paid' | 'claimed' | 'expired'
  user_id: string | null
  expires_at: string
  claimed_at: string | null
  created_at: string
  updated_at: string
  cancel_at_period_end: boolean
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  ended_at: string | null
}

export type SubscriptionSnapshot = {
  id: string
  customerId: string
  priceId: string
  planKey: string
  status: string
  paymentState: string
  cancelAtPeriodEnd: boolean
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEnd: string | null
  endedAt: string | null
}

export type StripeSubscriptionLike = Stripe.Subscription
