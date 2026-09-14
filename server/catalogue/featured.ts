import { canonicalProductKey, normalizeCatalogueProduct } from './normalization'
import type { NormalizedCatalogueProduct } from './types'

const FEATURED_DEFINITIONS = [
  { brand: 'Sony', displayName: 'Sony WH-1000XM6', modelNumber: 'WH-1000XM6', aliases: ['WH1000XM6', 'Sony XM6'], rank: 1 },
  { brand: 'Sony', displayName: 'Sony WH-1000XM5', modelNumber: 'WH-1000XM5', aliases: ['WH1000XM5', 'Sony XM5'], rank: 2 },
  { brand: 'Bose', displayName: 'Bose QuietComfort Ultra Headphones', modelNumber: 'QuietComfort Ultra Headphones', aliases: ['Bose QC Ultra', 'QC Ultra Headphones'], rank: 3 },
  { brand: 'Bose', displayName: 'Bose QuietComfort Headphones', modelNumber: 'QuietComfort Headphones', aliases: ['Bose QC Headphones', 'QC Headphones'], rank: 4 },
  { brand: 'Sennheiser', displayName: 'Sennheiser Momentum 4 Wireless', modelNumber: 'Momentum 4 Wireless', aliases: ['Momentum 4'], rank: 5 },
  { brand: 'Apple', displayName: 'Apple AirPods Max (USB-C)', modelNumber: 'AirPods Max USB-C', aliases: ['AirPods Max', 'AirPods Max USB C'], rank: 6 },
  { brand: 'Sonos', displayName: 'Sonos Ace', modelNumber: 'Ace', aliases: ['Sonos Ace Headphones'], rank: 7 },
  { brand: 'Beats', displayName: 'Beats Studio Pro', modelNumber: 'Studio Pro', aliases: ['Beats StudioPro'], rank: 8 },
] as const

export const FEATURED_CATALOGUE: NormalizedCatalogueProduct[] = FEATURED_DEFINITIONS.flatMap(definition => {
  const product = normalizeCatalogueProduct({
    canonicalKey: canonicalProductKey({ brand: definition.brand, modelNumber: definition.modelNumber, displayName: definition.displayName }),
    provider: 'afterprice-featured',
    displayName: definition.displayName,
    brand: definition.brand,
    modelNumber: definition.modelNumber,
    category: 'Audio / ANC headphones',
    aliases: [...definition.aliases],
    identifiers: {},
    metadata: { origin: 'featured', featured: true, featured_rank: definition.rank, live: false },
    isFeatured: true,
    featuredRank: definition.rank,
  })
  return product ? [product] : []
})

export function getFeaturedProducts(limit = FEATURED_CATALOGUE.length): NormalizedCatalogueProduct[] {
  return FEATURED_CATALOGUE.slice(0, Math.max(0, Math.min(limit, FEATURED_CATALOGUE.length))).map(product => ({
    ...product,
    aliases: [...product.aliases],
    identifiers: { ...product.identifiers },
    metadata: { ...product.metadata },
  }))
}
