import type { NormalizedCatalogueProduct } from '@/server/catalogue/types'
import type { MonitoringCheckResult, PriceObservation, ProductPriceSource } from './types'
import { normalizePriceObservation } from './observation'

export const MONITORING_POLICY = {
  activeReturnWindowHours: 12,
  activeReturnWindowIntervalMinutes: 360,
  standardProductIntervalMinutes: 1440,
  subscriptionIntervalMinutes: 1440,
  maxProductsPerRun: 50,
  maxSourcesPerProduct: 3,
} as const

export type MonitoringCadence = 'frequent' | 'standard' | 'paused'

export function cadenceForReturnWindow(returnDeadline: string | null | undefined, now = new Date()): MonitoringCadence {
  if (!returnDeadline) return 'standard'
  const deadline = new Date(returnDeadline)
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= now.getTime()) return 'paused'
  const hoursRemaining = (deadline.getTime() - now.getTime()) / 3_600_000
  return hoursRemaining <= MONITORING_POLICY.activeReturnWindowHours ? 'frequent' : 'standard'
}

export async function checkProductNow(
  product: NormalizedCatalogueProduct,
  sources: ProductPriceSource[],
  persist?: (observation: PriceObservation) => Promise<{ stored: boolean; reason?: string }>,
  now = new Date(),
): Promise<MonitoringCheckResult> {
  const results: MonitoringCheckResult['results'] = []
  for (const source of sources.slice(0, MONITORING_POLICY.maxSourcesPerProduct)) {
    const status = source.status()
    if (!status.available) {
      results.push({ sourceId: source.id, status: 'unavailable', reason: status.reason })
      continue
    }
    if (!source.supports(product)) {
      results.push({ sourceId: source.id, status: 'unsupported', reason: 'The source does not support this product category.' })
      continue
    }
    try {
      const raw = await source.observe(product)
      if (!raw) {
        results.push({ sourceId: source.id, status: 'observed', reason: 'The source returned no comparable listing.' })
        continue
      }
      const productId = 'catalogProductId' in product && typeof product.catalogProductId === 'string' ? product.catalogProductId : 'id' in product && typeof product.id === 'string' ? product.id : undefined
      const observation = normalizePriceObservation({ ...raw, catalogProductId: raw.catalogProductId ?? productId, entityId: raw.entityId ?? productId })
      if (!observation) {
        results.push({ sourceId: source.id, status: 'failed', reason: 'The source returned an invalid observation.' })
        continue
      }
      if (!persist) {
        results.push({ sourceId: source.id, status: 'not_persisted', observation, reason: 'No trusted observation writer was supplied.' })
        continue
      }
      const persistence = await persist(observation)
      results.push({ sourceId: source.id, status: persistence.stored ? 'observed' : 'not_persisted', observation, persistence })
    } catch (error) {
      results.push({ sourceId: source.id, status: 'failed', reason: error instanceof Error ? error.message : 'Source check failed.' })
    }
  }
  return { productKey: product.canonicalKey, checkedAt: now.toISOString(), results }
}

export async function runMonitoringSweep(
  products: NormalizedCatalogueProduct[],
  sources: ProductPriceSource[],
  options: { persist?: (observation: PriceObservation) => Promise<{ stored: boolean; reason?: string }>; now?: Date } = {},
): Promise<MonitoringCheckResult[]> {
  const selected = products.slice(0, MONITORING_POLICY.maxProductsPerRun)
  const results: MonitoringCheckResult[] = []
  for (const product of selected) results.push(await checkProductNow(product, sources, options.persist, options.now))
  return results
}
