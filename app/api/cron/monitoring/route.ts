import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { productFromCatalogProduct } from '@/server/catalogue/normalization'
import { createPurchaseAlerts } from '@/server/monitoring/alerts'
import { getPriceSources } from '@/server/monitoring/ebay'
import { persistObservation } from '@/server/monitoring/observation'
import { MONITORING_POLICY, runMonitoringSweep } from '@/server/monitoring/scheduler'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorised(request: Request, secret: string): boolean {
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return NextResponse.json({ error: 'Monitoring scheduler is not configured. Set CRON_SECRET before enabling the cron route.' }, { status: 503 })
  if (!authorised(request, secret)) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const writer = createServiceRoleClient()
  if (!writer) return NextResponse.json({ error: 'Monitoring scheduler needs the server-only Supabase ingestion key.' }, { status: 503 })

  const sources = getPriceSources()
  const availableSources = sources.filter(source => source.status().available)
  if (!availableSources.length) return NextResponse.json({ error: 'No live monitoring source is configured.', sources: sources.map(source => source.status()) }, { status: 503 })

  const trackedProductsResult = await writer
    .from('purchases')
    .select('catalog_product_id')
    .not('catalog_product_id', 'is', null)
    .limit(MONITORING_POLICY.maxProductsPerRun)
  if (trackedProductsResult.error) return NextResponse.json({ error: `Tracked product lookup failed: ${trackedProductsResult.error.message}` }, { status: 502 })

  const productIds = [...new Set((trackedProductsResult.data ?? []).map(row => row.catalog_product_id).filter((id): id is string => Boolean(id)))]
  if (!productIds.length) return NextResponse.json({ status: 'ok', productsChecked: 0, observationsStored: 0, alertsCreated: 0, reason: 'No canonical purchases are currently eligible for monitoring.' })

  const productsResult = await writer.from('catalog_products').select('*').in('id', productIds)
  if (productsResult.error) return NextResponse.json({ error: `Tracked catalogue lookup failed: ${productsResult.error.message}` }, { status: 502 })
  const products = (productsResult.data ?? []).map(product => productFromCatalogProduct(product as Database['public']['Tables']['catalog_products']['Row']))
  const results = await runMonitoringSweep(products, availableSources, { persist: observation => persistObservation(writer, observation) })
  let observationsStored = 0
  let alertsCreated = 0

  for (const result of results) {
    for (const item of result.results) {
      if (!item.observation || !item.persistence?.stored) continue
      observationsStored += 1
      const catalogProductId = item.observation.catalogProductId ?? item.observation.entityId
      if (!catalogProductId) continue
      const purchasesResult = await writer.from('purchases').select('user_id').eq('catalog_product_id', catalogProductId)
      if (purchasesResult.error) return NextResponse.json({ error: `Purchase alert lookup failed: ${purchasesResult.error.message}` }, { status: 502 })
      const userIds = [...new Set((purchasesResult.data ?? []).map(purchase => purchase.user_id))]
      for (const userId of userIds) alertsCreated += await createPurchaseAlerts(writer, userId, item.observation)
    }
  }

  return NextResponse.json({ status: 'ok', productsChecked: products.length, observationsStored, alertsCreated, results })
}
