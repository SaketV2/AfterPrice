import type { NormalizedCatalogueProduct } from './types'

export function previewManualProduct(product: NormalizedCatalogueProduct) {
  return { product, persisted: false as const, mode: 'manual_preview' as const }
}
