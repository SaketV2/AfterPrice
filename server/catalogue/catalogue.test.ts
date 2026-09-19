import { describe, expect, it } from 'vitest'
import { FEATURED_CATALOGUE } from './featured'
import { deduplicateProducts, normalizeIdentifier, normalizeSearchTerm, rankCatalogueProduct } from './normalization'
import { previewManualProduct } from './manual-preview'

describe('catalogue identity', () => {
  it('normalises headphone model variants to the same identifier', () => {
    expect(normalizeIdentifier('Sony WH-1000XM6')).toBe('sonywh1000xm6')
    expect(normalizeIdentifier('WH1000XM6')).toBe('wh1000xm6')
    expect(normalizeSearchTerm('WH 1000 XM6')).toBe('wh 1000 xm6')
  })

  it('ships exactly eight metadata-only featured ANC identities', () => {
    expect(FEATURED_CATALOGUE).toHaveLength(8)
    expect(FEATURED_CATALOGUE.every(product => product.metadata.live === false)).toBe(true)
    expect(FEATURED_CATALOGUE.every(product => !('priceCents' in product.metadata))).toBe(true)
  })

  it('ranks exact model identity above a broad name match and deduplicates identifiers', () => {
    const sony = FEATURED_CATALOGUE.find(product => product.displayName === 'Sony WH-1000XM6')!
    expect(rankCatalogueProduct(sony, 'WH1000XM6')).toBeGreaterThan(rankCatalogueProduct(sony, 'sony'))
    const duplicate = { ...sony, identifiers: { gtin: ['123456789'] } }
    const duplicateWithSameIdentifier = { ...sony, displayName: 'Sony XM6 listing', identifiers: { gtin: ['123456789'] } }
    expect(deduplicateProducts([duplicate, duplicateWithSameIdentifier])).toHaveLength(1)
  })
})

describe('manual catalogue preview', () => {
  it('does not claim that a shared catalogue resource was created', () => {
    const product = FEATURED_CATALOGUE[0]
    expect(previewManualProduct(product)).toMatchObject({
      product,
      persisted: false,
      mode: 'manual_preview',
    })
  })
})
