import 'server-only'
import Stripe from 'stripe'
import { BillingConfigurationError } from './errors'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!secretKey) throw new BillingConfigurationError('Stripe is not configured. Set STRIPE_SECRET_KEY.')
  if (!stripeClient) stripeClient = new Stripe(secretKey, { maxNetworkRetries: 2 })
  return stripeClient
}
