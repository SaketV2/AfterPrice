export type CatalogueIdentifierType = 'gtin' | 'ean' | 'upc' | 'mpn' | 'epid' | 'sku'

export type CatalogueProviderStatus = {
  id: string
  available: boolean
  reason?: string
}

export type NormalizedCatalogueProduct = {
  catalogProductId?: string
  canonicalKey: string
  provider: string
  providerProductId?: string
  displayName: string
  brand?: string
  modelNumber?: string
  variant?: string
  category?: string
  imageUrl?: string
  sourceUrl?: string
  aliases: string[]
  identifiers: Partial<Record<CatalogueIdentifierType, string[]>>
  metadata: Record<string, unknown>
  isFeatured?: boolean
  featuredRank?: number
}

export type CatalogueEntityProduct = NormalizedCatalogueProduct & {
  id: string
  createdAt?: string
  updatedAt?: string
}

export type CatalogueSearchOptions = {
  limit?: number
  minimumLocalResults?: number
  allowExternal?: boolean
}

export type CatalogueSearchResult = {
  products: NormalizedCatalogueProduct[]
  source: 'featured' | 'local' | 'local+external'
  externalLookupAttempted: boolean
  externalLookupSkippedReason?: string
  cache: {
    attempted: boolean
    persisted: number
    reason?: string
  }
}

export type ProductCatalogueProvider = {
  readonly id: string
  status(): CatalogueProviderStatus
  search(query: string, options?: { limit?: number }): Promise<NormalizedCatalogueProduct[]>
  lookupByGtin(gtin: string): Promise<NormalizedCatalogueProduct[]>
  lookupByExternalId(id: string): Promise<NormalizedCatalogueProduct | null>
  normalize(result: unknown): NormalizedCatalogueProduct | null
}
