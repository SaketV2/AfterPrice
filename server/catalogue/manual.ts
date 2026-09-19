import 'server-only'

import { normalizeCatalogueProduct, canonicalProductKey } from './normalization'
import type { NormalizedCatalogueProduct } from './types'

export type ManualProductInput = {
  displayName: string
  brand?: string
  modelNumber?: string
  variant?: string
  category?: string
  aliases?: string[]
  sourceUrl?: string
}

export function normalizeManualProduct(input: ManualProductInput): NormalizedCatalogueProduct {
  const product = normalizeCatalogueProduct({
    canonicalKey: canonicalProductKey(input),
    provider: 'manual',
    displayName: input.displayName,
    brand: input.brand,
    modelNumber: input.modelNumber,
    variant: input.variant,
    category: input.category,
    sourceUrl: input.sourceUrl,
    aliases: input.aliases ?? [],
    identifiers: {},
    metadata: { origin: 'manual', monitoring: 'manual' },
  })
  if (!product) throw new Error('A product name is required.')
  return product
}
