import { describe, expect, it } from 'vitest'
import { calculateProductOpportunity } from './opportunity'
import { validateSupportedUrl } from './url-safety'
import type { PriceObservation } from './types'

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
