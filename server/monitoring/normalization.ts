import { validateSupportedUrl } from './url-safety'
import type { PriceObservation } from './types'

export function normalizePriceObservation(input: PriceObservation): PriceObservation | null {
  if (!input.canonicalKey || !input.sourceId || !input.sourceListingId || !input.sourceName) return null
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) return null
  if (!/^[A-Z]{3}$/.test(input.currency)) return null
  const sourceUrl = validateSupportedUrl(input.sourceUrl)
  if (!sourceUrl.ok) return null
  const observedAt = new Date(input.observedAt)
  if (Number.isNaN(observedAt.getTime())) return null
  return {
    ...input,
    sourceUrl: sourceUrl.url.toString(),
    observedAt: observedAt.toISOString(),
    availability: input.availability ?? 'unknown',
    metadata: input.metadata ?? {},
  }
}

export function sameMaterialObservation(left: PriceObservation, right: PriceObservation): boolean {
  return left.canonicalKey === right.canonicalKey
    && left.sourceId === right.sourceId
    && left.sourceListingId === right.sourceListingId
    && left.priceCents === right.priceCents
    && left.currency === right.currency
    && left.availability === right.availability
}
