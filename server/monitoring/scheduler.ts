import type { NormalizedCatalogueProduct } from '@/server/catalogue/types'
import type { MonitoringCheckResult, PriceObservation, ProductPriceSource } from './types'
import { normalizePriceObservation } from './normalization'

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

export function monitoringIntervalMinutes(cadence: MonitoringCadence): number {
  if (cadence === 'frequent') return MONITORING_POLICY.activeReturnWindowIntervalMinutes
  if (cadence === 'standard') return MONITORING_POLICY.standardProductIntervalMinutes
  return Number.POSITIVE_INFINITY
}

export type MonitoringSweepOptions = {
  persist?: (observation: PriceObservation) => Promise<{ stored: boolean; reason?: string }>
  now?: Date
  concurrency?: number
  /** The nearest active return deadline for each catalogue product. */
  returnDeadlineByProduct?: ReadonlyMap<string, string | null | undefined>
  /** The last successful persisted source check for each catalogue product. */
  lastSuccessfulCheckByProduct?: ReadonlyMap<string, string | null | undefined>
}

export function isProductDue(
  product: NormalizedCatalogueProduct,
  options: Pick<MonitoringSweepOptions, 'now' | 'returnDeadlineByProduct' | 'lastSuccessfulCheckByProduct'> = {},
): boolean {
  const now = options.now ?? new Date()
  const productId = product.catalogProductId
  const deadline = productId ? options.returnDeadlineByProduct?.get(productId) : undefined
  const cadence = cadenceForReturnWindow(deadline, now)
  if (cadence === 'paused') return false
  const lastCheck = productId ? options.lastSuccessfulCheckByProduct?.get(productId) : undefined
  if (!lastCheck) return true
  const lastCheckAt = Date.parse(lastCheck)
  if (Number.isNaN(lastCheckAt)) return true
  return now.getTime() - lastCheckAt >= monitoringIntervalMinutes(cadence) * 60_000
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
  options: MonitoringSweepOptions = {},
): Promise<MonitoringCheckResult[]> {
  const now = options.now ?? new Date()
  const selected = products
    .filter(product => isProductDue(product, { ...options, now }))
    .slice(0, MONITORING_POLICY.maxProductsPerRun)
  if (!selected.length) return []

  // A small native worker pool keeps provider calls bounded without adding a
  // dependency or creating one promise per product at once.
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, selected.length))
  const results = new Array<MonitoringCheckResult>(selected.length)
  let nextIndex = 0
  async function worker() {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= selected.length) return
      results[index] = await checkProductNow(selected[index], sources, options.persist, now)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}
