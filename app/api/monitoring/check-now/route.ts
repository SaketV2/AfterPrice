import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { findProductById } from '@/server/catalogue/local'
import { getPriceSources } from '@/server/monitoring/ebay'
import { createPurchaseAlerts } from '@/server/monitoring/alerts'
import { persistObservation } from '@/server/monitoring/observation'
import { checkProductNow } from '@/server/monitoring/scheduler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const requestSchema = z.object({ catalogProductId: z.string().uuid().optional(), entityId: z.string().uuid().optional() }).refine(value => value.catalogProductId || value.entityId, 'A catalogue product id is required.')

export async function POST(request: Request) {
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
    const product = await findProductById(supabase, catalogProductId)
    if (!product) return NextResponse.json({ error: 'Product entity not found.' }, { status: 404 })
    const writer = createServiceRoleClient()
    if (!writer) return NextResponse.json({ error: 'A server-only Supabase ingestion key is required before live observations can be persisted.' }, { status: 503 })
    const sources = getPriceSources()
    const result = await checkProductNow(product, sources, observation => persistObservation(writer, observation))
    let alertsCreated = 0
    for (const item of result.results) {
      if (item.observation && item.persistence?.stored) alertsCreated += await createPurchaseAlerts(writer, data.claims.sub, item.observation)
    }
    const hasAvailableSource = result.results.some(item => item.status !== 'unavailable')
    if (!hasAvailableSource) return NextResponse.json({ error: 'No live monitoring source is configured.', result, alertsCreated }, { status: 503 })
    const persistenceFailed = result.results.some(item => item.persistence && !item.persistence.stored)
    return NextResponse.json({ result, alertsCreated }, { status: persistenceFailed ? 502 : 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Monitoring check failed.' }, { status: 502 })
  }
}
