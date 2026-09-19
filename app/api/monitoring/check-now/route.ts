import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { serverErrorResponse } from '@/lib/http/server-error'
import { ProRequiredError, requireProEntitlement } from '@/server/billing/pro-authorization'
import { consumeAccountRateLimit } from '@/server/security/rate-limit'
import { findProductById } from '@/server/catalogue/local'
import { getPriceSources } from '@/server/monitoring/ebay'
import { createPurchaseAlerts } from '@/server/monitoring/alerts'
import { persistObservation } from '@/server/monitoring/observation'
import { checkProductNow } from '@/server/monitoring/scheduler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const requestSchema = z.object({ catalogProductId: z.string().uuid().optional(), entityId: z.string().uuid().optional() }).refine(value => value.catalogProductId || value.entityId, 'A catalogue product id is required.')

const publicReason = (status: string, persistence: boolean | undefined) => {
  if (persistence === false) return 'The observation could not be saved.'
  if (status === 'unavailable') return 'The monitoring source is unavailable.'
  if (status === 'unsupported') return 'The monitoring source does not support this product.'
  if (status === 'failed') return 'The monitoring source could not complete the check.'
  if (status === 'not_persisted') return 'The observation was not saved.'
  return undefined
}

function publicMonitoringResult(result: Awaited<ReturnType<typeof checkProductNow>>) {
  return {
    productKey: result.productKey,
    checkedAt: result.checkedAt,
    results: result.results.map(item => ({
      sourceId: item.sourceId,
      status: item.status,
      reason: publicReason(item.status, item.persistence?.stored),
      observation: item.observation ? {
        sourceId: item.observation.sourceId,
        sourceName: item.observation.sourceName,
        sourceListingId: item.observation.sourceListingId,
        sourceUrl: item.observation.sourceUrl,
        priceCents: item.observation.priceCents,
        currency: item.observation.currency,
        availability: item.observation.availability,
        observedAt: item.observation.observedAt,
      } : undefined,
      persistence: item.persistence ? { stored: item.persistence.stored, reason: publicReason(item.status, item.persistence.stored) } : undefined,
    })),
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims || typeof data.claims.sub !== 'string') return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  let input: z.infer<typeof requestSchema>
  try {
    input = requestSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'catalogProductId must be a valid product UUID.' }, { status: 400 })
  }
  try {
    const catalogProductId = input.catalogProductId ?? input.entityId!
    // Ownership is checked with the authenticated client before any service
    // role client is created or provider work is started.
    const ownership = await supabase.from('purchases').select('id').eq('user_id', data.claims.sub).eq('catalog_product_id', catalogProductId).limit(1).maybeSingle()
    if (ownership.error) return serverErrorResponse('monitoring.check-now.ownership', ownership.error, { code: 'MONITORING_UNAVAILABLE', message: 'Live monitoring is temporarily unavailable.', status: 503, requestId })
    if (!ownership.data) return NextResponse.json({ error: 'Product entity not found.' }, { status: 404 })

    await requireProEntitlement(data.claims.sub)
    const limit = await consumeAccountRateLimit({ key: `monitoring:check-now:${data.claims.sub}`, limit: 5, windowSeconds: 900 })
    if (!limit.allowed) {
      const retryAfter = Math.max(1, Math.ceil(limit.retryAfterSeconds ?? 900))
      return NextResponse.json({ error: 'Monitoring checks are temporarily limited.', code: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
    }

    const product = await findProductById(supabase, catalogProductId)
    if (!product) return NextResponse.json({ error: 'Product entity not found.' }, { status: 404 })
    const writer = createServiceRoleClient()
    if (!writer) return serverErrorResponse('monitoring.check-now.config', new Error('Service-role client unavailable'), { code: 'MONITORING_UNAVAILABLE', message: 'Live monitoring is temporarily unavailable.', status: 503, requestId })
    const sources = getPriceSources()
    const result = await checkProductNow(product, sources, observation => persistObservation(writer, observation))
    let alertsCreated = 0
    for (const item of result.results) {
      if (item.observation && item.persistence?.stored) alertsCreated += await createPurchaseAlerts(writer, data.claims.sub, item.observation)
    }
    const hasAvailableSource = sources.some(source => source.status().available)
    const safeResult = publicMonitoringResult(result)
    if (!hasAvailableSource) return NextResponse.json({ error: 'No live monitoring source is configured.', result: safeResult, alertsCreated }, { status: 503 })
    const persistenceFailed = result.results.some(item => item.persistence && !item.persistence.stored)
    return NextResponse.json({ result: safeResult, alertsCreated }, { status: persistenceFailed ? 502 : 200 })
  } catch (error) {
    if (error instanceof ProRequiredError) return NextResponse.json({ error: 'Pro monitoring is required.', code: 'PRO_REQUIRED' }, { status: 403 })
    return serverErrorResponse('monitoring.check-now', error, { code: 'MONITORING_FAILED', message: 'Live monitoring could not be completed.', status: 502, requestId })
  }
}
