import type { NormalizedCatalogueProduct } from '@/server/catalogue/types'

export type ObservationAvailability = 'in_stock' | 'out_of_stock' | 'unknown'

export type PriceObservation = {
  canonicalKey: string
  catalogProductId?: string
  entityId?: string
  sourceId: string
  sourceName: string
  sourceListingId: string
  sourceUrl: string
  priceCents: number
  currency: 'AUD' | string
  availability: ObservationAvailability
  observedAt: string
  metadata: Record<string, unknown>
}

export type PriceSourceStatus = {
  id: string
  available: boolean
  reason?: string
}

export type ProductPriceSource = {
  readonly id: string
  status(): PriceSourceStatus
  supports(product: NormalizedCatalogueProduct): boolean
  observe(product: NormalizedCatalogueProduct): Promise<PriceObservation | null>
}

export type ReturnWindowStatus = 'active' | 'expired' | 'unknown'

export type ProductOpportunity = {
  status: 'opportunity' | 'no_opportunity' | 'not_actionable' | 'variant_mismatch'
  potentialSavingCents: number
  priceDeltaCents: number
  returnWindow: ReturnWindowStatus
  actionable: boolean
  reason: string
  confidence: 'high' | 'estimated' | 'unknown'
}

export type MonitoringSourceResult = {
  sourceId: string
  status: 'observed' | 'unsupported' | 'unavailable' | 'failed' | 'not_persisted'
  observation?: PriceObservation
  persistence?: { stored: boolean; reason?: string }
  reason?: string
}

export type MonitoringCheckResult = {
  productKey: string
  checkedAt: string
  results: MonitoringSourceResult[]
}
