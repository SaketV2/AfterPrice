import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { BillingConfigurationError } from '@/lib/billing/errors'
import { billingErrorResponse, sameBillingOrigin } from '@/lib/billing/http'
import { getBillingSiteUrl } from '@/lib/billing/env'
import { PENDING_CHECKOUT_COOKIE, PENDING_CHECKOUT_TTL_MS } from '@/lib/billing/claims'
import { createCheckoutSession } from '@/server/billing/checkout'
import { getUserBillingEntitlement } from '@/server/billing/entitlements'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly']).optional(),
  planKey: z.enum(['monthly', 'yearly']).optional(),
  email: z.string().trim().email().max(320).optional(),
}).refine(input => Boolean(input.plan ?? input.planKey), { message: 'Choose a billing plan.' })

export async function POST(request: Request) {
  let siteUrl: string
  try {
    siteUrl = getBillingSiteUrl()
  } catch (error) {
    return billingErrorResponse(error)
  }
  if (!sameBillingOrigin(request, siteUrl)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })

  let input: z.infer<typeof checkoutSchema>
  try {
    input = checkoutSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0]?.message ?? 'Invalid checkout request.' : 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    const context = await getAuthenticatedContext()
    if (context.userId) {
      const { data, error } = await context.supabase.auth.getUser()
      if (error || !data.user || data.user.id !== context.userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
      if ((await getUserBillingEntitlement(context.userId)).entitled) return NextResponse.json({ error: 'Your Pro subscription is already active. Manage it from Settings.' }, { status: 409 })
      const result = await createCheckoutSession({ planKey: input.plan ?? input.planKey!, userId: context.userId, userEmail: data.user.email })
      return NextResponse.json({ url: result.checkoutUrl, sessionId: result.checkoutSessionId })
    }

    if (!input.email) return NextResponse.json({ error: 'An email address is required before signup.' }, { status: 400 })
    const result = await createCheckoutSession({ planKey: input.plan ?? input.planKey!, guestEmail: input.email })
    const response = NextResponse.json({ url: result.checkoutUrl, sessionId: result.checkoutSessionId })
    if (result.claimToken) {
      response.cookies.set(PENDING_CHECKOUT_COOKIE, result.claimToken, {
        httpOnly: true,
        maxAge: PENDING_CHECKOUT_TTL_MS / 1000,
        path: '/',
        sameSite: 'lax',
        secure: new URL(siteUrl).protocol === 'https:',
      })
    }
    return response
  } catch (error) {
    if (error instanceof BillingConfigurationError) return billingErrorResponse(error)
    return billingErrorResponse(error)
  }
}
