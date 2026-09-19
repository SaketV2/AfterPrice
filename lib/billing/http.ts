import { NextResponse } from 'next/server'
import { getBillingSiteUrl } from './env'
import { BillingConfigurationError, BillingPersistenceError } from './errors'

export function sameBillingOrigin(request: Request, siteUrl = getBillingSiteUrl()): boolean {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(siteUrl).origin
}

export function billingErrorResponse(error: unknown): NextResponse {
  if (error instanceof BillingConfigurationError) {
    console.error('Billing configuration error', { code: error.code, message: error.message })
    return NextResponse.json({ error: 'Billing is temporarily unavailable.', code: 'BILLING_UNAVAILABLE' }, { status: 503 })
  }
  if (error instanceof BillingPersistenceError) {
    console.error('Billing persistence error', { code: error.code, message: error.message })
    return NextResponse.json({ error: 'Billing could not be completed. Try again.', code: 'BILLING_UNAVAILABLE' }, { status: 502 })
  }
  console.error('Unexpected billing error', error)
  return NextResponse.json({ error: 'Billing could not be completed. Try again.' }, { status: 502 })
}
