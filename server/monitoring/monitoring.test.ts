import { describe, expect, it } from 'vitest'
import { calculateProductOpportunity } from './opportunity'
import { validateSupportedUrl } from './url-safety'
import type { PriceObservation } from './types'
import { isProductDue, runMonitoringSweep } from './scheduler'
import { isSubscriptionObservationDue } from './subscription-cadence'
import { classifySubscriptionObservationTransition } from './subscription-logic'
import type { NormalizedCatalogueProduct } from '@/server/catalogue/types'

const observation = (overrides: Partial<PriceObservation> = {}): PriceObservation => ({
  canonicalKey: 'sony-wh1000xm6',
  sourceId: 'test-source',
  sourceName: 'Test source',
  sourceListingId: 'listing-1',
  sourceUrl: 'https://www.ebay.com.au/itm/listing-1',
  priceCents: 29900,
  currency: 'AUD',
  availability: 'in_stock',
  observedAt: '2026-09-10T00:00:00Z',
  metadata: {},
  ...overrides,
})

describe('opportunity calculation', () => {
  const base = { canonicalKey: 'sony-wh1000xm6', paidAmountCents: 34900, purchaseDate: '2026-09-01T00:00:00Z', returnDeadline: '2026-09-20T00:00:00Z', returnDeadlineConfidence: 'user_confirmed' as const }

  it('finds an active post-purchase saving', () => {
    const result = calculateProductOpportunity({ ...base, observation: observation() }, new Date('2026-09-14T00:00:00Z'))
    expect(result.status).toBe('opportunity')
    expect(result.potentialSavingCents).toBe(5000)
  })

  it('does not create an opportunity for equal or higher prices', () => {
    expect(calculateProductOpportunity({ ...base, observation: observation({ priceCents: 34900 }) }).status).toBe('no_opportunity')
    expect(calculateProductOpportunity({ ...base, observation: observation({ priceCents: 39900 }) }).status).toBe('no_opportunity')
  })

  it('does not claim action after expiry or when the deadline is unknown', () => {
    expect(calculateProductOpportunity({ ...base, returnDeadline: '2026-09-10T00:00:00Z', observation: observation() }, new Date('2026-09-14T00:00:00Z')).actionable).toBe(false)
    expect(calculateProductOpportunity({ ...base, returnDeadline: null, returnDeadlineConfidence: 'unknown', observation: observation() }).reason).toContain('unknown')
  })

  it('rejects variant mismatches and observations before purchase', () => {
    expect(calculateProductOpportunity({ ...base, observation: observation({ canonicalKey: 'sony-wh1000xm5' }) }).status).toBe('variant_mismatch')
    expect(calculateProductOpportunity({ ...base, observation: observation({ observedAt: '2026-08-31T00:00:00Z' }) }).status).toBe('not_actionable')
  })
})

describe('supported URL safety', () => {
  it('allows supported HTTPS provider URLs only', () => {
    expect(validateSupportedUrl('https://www.ebay.com.au/itm/123').ok).toBe(true)
    expect(validateSupportedUrl('http://www.ebay.com.au/itm/123').ok).toBe(false)
    expect(validateSupportedUrl('https://localhost/secret').ok).toBe(false)
    expect(validateSupportedUrl('https://169.254.169.254/latest/meta-data').ok).toBe(false)
    expect(validateSupportedUrl('https://attacker.example/redirect').ok).toBe(false)
  })
})

describe('monitoring cadence and bounded workers', () => {
  const product = (id: string): NormalizedCatalogueProduct => ({
    catalogProductId: id,
    canonicalKey: id,
    provider: 'test',
    displayName: `Test ${id}`,
    aliases: [],
    identifiers: {},
    metadata: {},
  })

  it('does not recheck a standard product before its interval', () => {
    const now = new Date('2026-09-19T12:00:00Z')
    expect(isProductDue(product('00000000-0000-4000-8000-000000000001'), {
      now,
      lastSuccessfulCheckByProduct: new Map([['00000000-0000-4000-8000-000000000001', '2026-09-19T00:00:00Z']]),
    })).toBe(false)
    expect(isProductDue(product('00000000-0000-4000-8000-000000000001'), {
      now,
      lastSuccessfulCheckByProduct: new Map([['00000000-0000-4000-8000-000000000001', '2026-09-18T00:00:00Z']]),
    })).toBe(true)
  })

  it('respects paused return windows', () => {
    expect(isProductDue(product('00000000-0000-4000-8000-000000000002'), {
      now: new Date('2026-09-19T12:00:00Z'),
      returnDeadlineByProduct: new Map([['00000000-0000-4000-8000-000000000002', '2026-09-19T11:00:00Z']]),
    })).toBe(false)
  })

  it('does not exceed the configured worker concurrency', async () => {
    let active = 0
    let maximum = 0
    const source = {
      id: 'test-source',
      status: () => ({ id: 'test-source', available: true }),
      supports: () => true,
      observe: async (item: NormalizedCatalogueProduct) => {
        active += 1
        maximum = Math.max(maximum, active)
        await new Promise(resolve => setTimeout(resolve, 5))
        active -= 1
        return observation({ canonicalKey: item.canonicalKey, sourceListingId: item.catalogProductId })
      },
    }
    const results = await runMonitoringSweep(Array.from({ length: 6 }, (_, index) => product(`00000000-0000-4000-8000-${String(index + 10).padStart(12, '0')}`)), [source], { concurrency: 2 })
    expect(results).toHaveLength(6)
    expect(maximum).toBeLessThanOrEqual(2)
  })
})

describe('subscription cadence', () => {
  it('allows a first snapshot and waits for the configured interval', () => {
    const now = new Date('2026-09-19T12:00:00Z')
    expect(isSubscriptionObservationDue(undefined, now)).toBe(true)
    expect(isSubscriptionObservationDue('2026-09-19T00:00:00Z', now)).toBe(false)
    expect(isSubscriptionObservationDue('2026-09-18T00:00:00Z', now)).toBe(true)
  })

  const plan = (overrides: Partial<Parameters<typeof classifySubscriptionObservationTransition>[0]> = {}) => ({
    id: '00000000-0000-4000-8000-000000000010',
    catalog_service_id: '00000000-0000-4000-8000-000000000011',
    catalog_plan_id: '00000000-0000-4000-8000-000000000012',
    price_cents: 1200,
    currency: 'AUD',
    cadence: 'monthly' as const,
    feature_data: {},
    source: 'catalogue',
    source_url: 'https://example.com/plan',
    observed_at: '2026-09-19T00:00:00Z',
    created_at: '2026-09-19T00:00:00Z',
    ...overrides,
  })

  it('classifies trusted plan transitions without alerting on unchanged snapshots', () => {
    const baseline = { amountCents: 1500, currency: 'AUD' }
    expect(classifySubscriptionObservationTransition(plan(), plan(), baseline)).toEqual({ materialChange: false, priceTransition: false, cheaperThanBaseline: false })
    expect(classifySubscriptionObservationTransition(plan(), plan({ price_cents: 1000 }), baseline).cheaperThanBaseline).toBe(true)
    expect(classifySubscriptionObservationTransition(plan(), plan({ price_cents: 1800 }), baseline).materialChange).toBe(true)
    expect(classifySubscriptionObservationTransition(plan(), plan({ cadence: 'annual' }), baseline).materialChange).toBe(true)
  })
})
