import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
import { serverErrorResponse } from '@/lib/http/server-error'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getEntitledUserIds } from '@/server/billing/entitlements'
import { productFromCatalogProduct } from '@/server/catalogue/normalization'
import { createPurchaseAlerts } from '@/server/monitoring/alerts'
import { getPriceSources } from '@/server/monitoring/ebay'
import { persistObservation } from '@/server/monitoring/observation'
import { createSubscriptionObservationAlerts, isSubscriptionObservationDue, persistSubscriptionPlanObservation } from '@/server/monitoring/subscription'
import { MONITORING_POLICY, runMonitoringSweep } from '@/server/monitoring/scheduler'
import type { SubscriptionWithCatalogue } from '@/features/afterprice/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorised(request: Request, secret: string): boolean {
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function nearestReturnDeadlines(rows: Array<{ catalog_product_id: string; return_deadline: string | null }>): Map<string, string | null> {
  const deadlines = new Map<string, string | null>()
  const grouped = new Map<string, Array<string | null>>()
  for (const row of rows) grouped.set(row.catalog_product_id, [...(grouped.get(row.catalog_product_id) ?? []), row.return_deadline])
  const now = Date.now()
  for (const [productId, candidates] of grouped) {
    const future = candidates
      .filter((value): value is string => Boolean(value) && !Number.isNaN(Date.parse(value!)) && Date.parse(value!) > now)
      .sort((left, right) => Date.parse(left) - Date.parse(right))
    if (future.length) deadlines.set(productId, future[0])
    else if (candidates.some(value => !value)) deadlines.set(productId, null)
    else deadlines.set(productId, candidates[0] ?? null)
  }
  return deadlines
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  // GET is intentional: native Vercel Cron invokes configured cron paths with
  // GET and supplies Authorization: Bearer <CRON_SECRET>.
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return serverErrorResponse('cron.monitoring.config', new Error('CRON_SECRET is not configured'), { code: 'CRON_UNAVAILABLE', message: 'Monitoring scheduler is temporarily unavailable.', status: 503, requestId })
  if (!authorised(request, secret)) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  try {
    const writer = createServiceRoleClient()
    if (!writer) return serverErrorResponse('cron.monitoring.config', new Error('Service-role client unavailable'), { code: 'CRON_UNAVAILABLE', message: 'Monitoring scheduler is temporarily unavailable.', status: 503, requestId })

    const sources = getPriceSources()
    const availableSources = sources.filter(source => source.status().available)

    const trackedPurchasesResult = await writer
      .from('purchases')
      .select('id,user_id,catalog_product_id,return_deadline,monitoring_status')
      .not('catalog_product_id', 'is', null)
      .in('monitoring_status', ['monitoring', 'limited'])
      .limit(MONITORING_POLICY.maxProductsPerRun * 10)
    if (trackedPurchasesResult.error) throw new Error(`Tracked product lookup failed: ${trackedPurchasesResult.error.message}`)

    const trackedPurchases = (trackedPurchasesResult.data ?? []) as Array<{ id: string; user_id: string; catalog_product_id: string | null; return_deadline: string | null; monitoring_status: string }>
    const subscriptionsResult = await writer.from('subscriptions').select('*, catalog_services(*), catalog_subscription_plans(*)').limit(MONITORING_POLICY.maxProductsPerRun * 10)
    if (subscriptionsResult.error) throw new Error(`Tracked subscription lookup failed: ${subscriptionsResult.error.message}`)
    const allSubscriptions = (subscriptionsResult.data ?? []) as unknown as SubscriptionWithCatalogue[]
    const userIds = [...new Set([...trackedPurchases.map(row => row.user_id), ...allSubscriptions.map(row => row.user_id)])]
    const now = new Date()
    const entitled = await getEntitledUserIds(userIds, now, writer)
    const eligiblePurchases = trackedPurchases.filter(row => row.catalog_product_id && entitled.has(row.user_id)) as Array<{ id: string; user_id: string; catalog_product_id: string; return_deadline: string | null; monitoring_status: string }>
    const ownersByProduct = new Map<string, string[]>()
    for (const purchase of eligiblePurchases) {
      const owners = ownersByProduct.get(purchase.catalog_product_id) ?? []
      if (!owners.includes(purchase.user_id)) owners.push(purchase.user_id)
      ownersByProduct.set(purchase.catalog_product_id, owners)
    }

    const productIds = [...ownersByProduct.keys()].slice(0, MONITORING_POLICY.maxProductsPerRun)
    let productsChecked = 0
    let productsDue = 0
    let observationsStored = 0
    let alertsCreated = 0
    if (productIds.length && availableSources.length) {
      const productsResult = await writer.from('catalog_products').select('*').in('id', productIds)
      if (productsResult.error) throw new Error(`Tracked catalogue lookup failed: ${productsResult.error.message}`)
      const products = (productsResult.data ?? []).map(product => productFromCatalogProduct(product as Database['public']['Tables']['catalog_products']['Row']))
      const sourcesResult = await writer.from('product_sources').select('catalog_product_id,last_successful_check').in('catalog_product_id', productIds)
      if (sourcesResult.error) throw new Error(`Product source lookup failed: ${sourcesResult.error.message}`)
      const lastSuccessfulCheckByProduct = new Map<string, string>()
      for (const row of sourcesResult.data ?? []) {
        if (!row.last_successful_check) continue
        const current = lastSuccessfulCheckByProduct.get(row.catalog_product_id)
        if (!current || Date.parse(row.last_successful_check) > Date.parse(current)) lastSuccessfulCheckByProduct.set(row.catalog_product_id, row.last_successful_check)
      }
      const deadlines = nearestReturnDeadlines(eligiblePurchases.filter(row => productIds.includes(row.catalog_product_id)))
      const results = await runMonitoringSweep(products, availableSources, {
        persist: observation => persistObservation(writer, observation),
        now,
        concurrency: 4,
        returnDeadlineByProduct: deadlines,
        lastSuccessfulCheckByProduct,
      })
      productsChecked = products.length
      productsDue = results.length
      for (const result of results) {
        for (const item of result.results) {
          if (!item.observation || !item.persistence?.stored) continue
          observationsStored += 1
          const catalogProductId = item.observation.catalogProductId ?? item.observation.entityId
          if (!catalogProductId) continue
          for (const userId of ownersByProduct.get(catalogProductId) ?? []) alertsCreated += await createPurchaseAlerts(writer, userId, item.observation)
        }
      }
    }

    // Subscription monitoring uses only trusted canonical catalogue snapshots;
    // custom plans and plans without source evidence remain source-unavailable.
    let subscriptionsChecked = 0
    let subscriptionObservationsStored = 0
    let subscriptionAlertsCreated = 0
    const entitledUserIdsList = [...entitled]
    if (entitledUserIdsList.length) {
      const subscriptions = allSubscriptions.filter(subscription => entitled.has(subscription.user_id))
      const serviceIds = [...new Set(subscriptions.map(subscription => subscription.catalog_service_id).filter((value): value is string => Boolean(value)))]
      const historyResult = serviceIds.length
        ? await writer.from('subscription_plan_observations').select('id,catalog_service_id,catalog_plan_id,observed_at').in('catalog_service_id', serviceIds).order('observed_at', { ascending: false })
        : { data: [], error: null }
      if (historyResult.error) throw new Error(`Subscription observation lookup failed: ${historyResult.error.message}`)
      const latestByPlan = new Map<string, string>()
      for (const row of historyResult.data ?? []) {
        const key = `${row.catalog_service_id}:${row.catalog_plan_id ?? ''}`
        if (!latestByPlan.has(key)) latestByPlan.set(key, row.observed_at)
      }
      for (const subscription of subscriptions) {
        subscriptionsChecked += 1
        const plan = subscription.catalog_subscription_plans
        const canonical = plan && subscription.catalog_service_id && subscription.catalog_plan_id
          ? {
              catalogServiceId: subscription.catalog_service_id,
              catalogPlanId: subscription.catalog_plan_id,
              priceCents: plan.price_cents,
              currency: plan.currency,
              cadence: plan.cadence,
              featureData: plan.feature_data,
              source: plan.source,
              sourceUrl: plan.source_url,
              observedAt: plan.observed_at,
              name: plan.name,
            }
          : null
        if (!canonical || !canonical.source || !canonical.observedAt) {
          const statusResult = await writer.from('subscriptions').update({ monitoring_status: 'source_unavailable' }).eq('id', subscription.id).eq('user_id', subscription.user_id).neq('monitoring_status', 'source_unavailable')
          if (statusResult.error) throw new Error(`Subscription status update failed: ${statusResult.error.message}`)
          continue
        }
        const key = `${canonical.catalogServiceId}:${canonical.catalogPlanId}`
        if (!isSubscriptionObservationDue(latestByPlan.get(key), now, MONITORING_POLICY.subscriptionIntervalMinutes)) continue
        const persisted = await persistSubscriptionPlanObservation(writer, canonical)
        if (!persisted.stored || !persisted.observation) continue
        subscriptionObservationsStored += 1
        latestByPlan.set(key, persisted.observation.observed_at)
        subscriptionAlertsCreated += await createSubscriptionObservationAlerts(writer, subscription, persisted.observation)
      }
    }

    return NextResponse.json({
      status: availableSources.length ? 'ok' : 'product_source_unavailable',
      productsChecked,
      productsDue,
      observationsStored,
      alertsCreated,
      subscriptionsChecked,
      subscriptionObservationsStored,
      subscriptionAlertsCreated,
      entitledUsers: entitled.size,
    }, { status: availableSources.length ? 200 : 503 })
  } catch (error) {
    return serverErrorResponse('cron.monitoring', error, { code: 'CRON_FAILED', message: 'Monitoring scheduler could not complete.', status: 502, requestId })
  }
}
