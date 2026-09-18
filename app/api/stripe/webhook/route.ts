import { NextResponse } from 'next/server'
import { getStripeWebhookSecret } from '@/lib/billing/env'
import { BillingConfigurationError } from '@/lib/billing/errors'
import { getStripeClient } from '@/lib/billing/stripe'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { billingErrorResponse } from '@/lib/billing/http'
import { beginStripeEvent, completeStripeEvent, failStripeEvent } from '@/server/billing/repository'
import { handleStripeEvent } from '@/server/billing/stripe-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })

  let event: import('stripe').default.Event
  try {
    const body = await request.text()
    event = getStripeClient().webhooks.constructEvent(body, signature, getStripeWebhookSecret())
  } catch (error) {
    if (error instanceof BillingConfigurationError) return billingErrorResponse(error)
    return NextResponse.json({ error: 'Invalid Stripe webhook signature.' }, { status: 400 })
  }

  try {
    const db = getBillingAdminClient()
    if (!(await beginStripeEvent(db, event.id, event.type))) return NextResponse.json({ received: true })
    try {
      await handleStripeEvent(db, event)
      await completeStripeEvent(db, event.id)
    } catch (error) {
      try {
        await failStripeEvent(db, event.id, error instanceof Error ? error.message : 'Stripe event processing failed.')
      } catch {
        // The original processing error is more useful to Stripe's retry.
      }
      throw error
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof BillingConfigurationError) return billingErrorResponse(error)
    return NextResponse.json({ error: 'Stripe webhook processing failed.' }, { status: 500 })
  }
}
