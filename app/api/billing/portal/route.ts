import { NextResponse } from 'next/server'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { getBillingSiteUrl } from '@/lib/billing/env'
import { BillingConfigurationError } from '@/lib/billing/errors'
import { billingErrorResponse, sameBillingOrigin } from '@/lib/billing/http'
import { getStripeClient } from '@/lib/billing/stripe'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { findBillingCustomer } from '@/server/billing/repository'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  let siteUrl: string
  try {
    siteUrl = getBillingSiteUrl()
  } catch (error) {
    return billingErrorResponse(error)
  }
  if (!sameBillingOrigin(request, siteUrl)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })

  try {
    const context = await getAuthenticatedContext()
    if (!context.userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    const db = getBillingAdminClient()
    const customer = await findBillingCustomer(db, context.userId)
    if (!customer) return NextResponse.json({ error: 'No Stripe billing account is linked to this user.' }, { status: 404 })

    const portal = await getStripeClient().billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${siteUrl}/app/settings`,
    })
    return NextResponse.json({ url: portal.url })
  } catch (error) {
    if (error instanceof BillingConfigurationError) return billingErrorResponse(error)
    return billingErrorResponse(error)
  }
}
