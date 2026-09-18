import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashClaimToken, normalizeBillingEmail, PENDING_CHECKOUT_COOKIE } from '@/lib/billing/claims'
import { CHECKOUT_SESSION_ID_PATTERN, CLAIM_TOKEN_PATTERN } from '@/lib/billing/validation'
import { BillingConfigurationError } from '@/lib/billing/errors'
import { billingErrorResponse, sameBillingOrigin } from '@/lib/billing/http'
import { getBillingSiteUrl } from '@/lib/billing/env'
import { getBillingAdminClient } from '@/lib/billing/supabase'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { claimPendingCheckout } from '@/server/billing/repository'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const claimSchema = z.object({
  sessionId: z.string().regex(CHECKOUT_SESSION_ID_PATTERN),
  claimToken: z.string().regex(CLAIM_TOKEN_PATTERN),
})

export async function POST(request: Request) {
  let siteUrl: string
  try {
    siteUrl = getBillingSiteUrl()
  } catch (error) {
    return billingErrorResponse(error)
  }
  if (!sameBillingOrigin(request, siteUrl)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })

  let input: z.infer<typeof claimSchema>
  try {
    input = claimSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid claim request.' : 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    const context = await getAuthenticatedContext()
    if (!context.userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    const { data, error } = await context.supabase.auth.getUser()
    if (error || !data.user || data.user.id !== context.userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    if (!data.user.email_confirmed_at || !data.user.email) return NextResponse.json({ error: 'Verify your Supabase email before claiming this checkout.' }, { status: 403 })

    const db = getBillingAdminClient()
    const claimed = await claimPendingCheckout(db, {
      checkoutSessionId: input.sessionId,
      claimTokenHash: hashClaimToken(input.claimToken),
      userId: context.userId,
      email: normalizeBillingEmail(data.user.email),
    })
    if (!claimed) return NextResponse.json({ error: 'This checkout claim is invalid, expired, already used, or not paid.' }, { status: 400 })
    const response = NextResponse.json({ claimed: true })
    response.cookies.delete(PENDING_CHECKOUT_COOKIE)
    return response
  } catch (error) {
    if (error instanceof BillingConfigurationError) return billingErrorResponse(error)
    return billingErrorResponse(error)
  }
}
