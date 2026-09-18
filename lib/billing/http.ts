import { NextResponse } from 'next/server'
import { getBillingSiteUrl } from './env'
import { BillingConfigurationError, BillingPersistenceError } from './errors'

export function sameBillingOrigin(request: Request, siteUrl = getBillingSiteUrl()): boolean {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(siteUrl).origin
}

export function billingErrorResponse(error: unknown): NextResponse {
  if (error instanceof BillingConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 })
  if (error instanceof BillingPersistenceError) return NextResponse.json({ error: 'Billing could not be completed. Try again.' }, { status: 502 })
  return NextResponse.json({ error: 'Billing could not be completed. Try again.' }, { status: 502 })
}
