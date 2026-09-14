export type NormalizedCatalogueProduct = {
  brand: string | null
  name: string
  modelNumber: string | null
  manufacturerPartNumber: string | null
  category: string | null
  imageUrl: string | null
  variantData: Record<string, unknown>
  identifiers: Array<{ type: 'gtin' | 'ean' | 'upc' | 'mpn' | 'ebay_epid' | 'retailer_sku'; value: string; provider: string; providerProductId?: string | null }>
  aliases: string[]
}

export type ExternalCatalogueProduct = {
  provider: string
  providerProductId?: string | null
  brand?: string | null
  name: string
  modelNumber?: string | null
  manufacturerPartNumber?: string | null
  category?: string | null
  imageUrl?: string | null
  variantData?: Record<string, unknown>
  identifiers?: NormalizedCatalogueProduct['identifiers']
  aliases?: string[]
}

export interface ProductCatalogueProvider {
  readonly name: string
  search(query: string): Promise<ExternalCatalogueProduct[]>
  lookupByGtin(gtin: string): Promise<ExternalCatalogueProduct | null>
  lookupByExternalId(id: string): Promise<ExternalCatalogueProduct | null>
  normalize(result: ExternalCatalogueProduct): NormalizedCatalogueProduct
}

export function normalizeCatalogueText(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '')
}

export function normalizeProviderProduct(result: ExternalCatalogueProduct): NormalizedCatalogueProduct {
  const cleanUrl = (value?: string | null) => value && /^https?:\/\//i.test(value) ? value : null
  const aliases = [...new Set([result.name, ...(result.aliases ?? [])].map((value) => value.trim()).filter(Boolean))]
  return {
    brand: result.brand?.trim() || null,
    name: result.name.trim(),
    modelNumber: result.modelNumber?.trim() || null,
    manufacturerPartNumber: result.manufacturerPartNumber?.trim() || null,
    category: result.category?.trim() || null,
    imageUrl: cleanUrl(result.imageUrl),
    variantData: result.variantData ?? {},
    identifiers: result.identifiers ?? [],
    aliases,
  }
}

export function getConfiguredCatalogueProviders(): ProductCatalogueProvider[] {
  // A provider is deliberately absent until its credentials are configured. This
  // prevents a catalogue search from silently becoming a fake or unauthorised
  // upstream request.
  return []
}

export async function searchExternalCatalogue(query: string) {
  const normalizedQuery = normalizeCatalogueText(query)
  if (normalizedQuery.length < 3) return [] as NormalizedCatalogueProduct[]

  const products: NormalizedCatalogueProduct[] = []
  for (const provider of getConfiguredCatalogueProviders()) {
    const results = await provider.search(query)
    products.push(...results.map((result) => provider.normalize(result)))
  }
  return dedupeCatalogueProducts(products)
}

export function dedupeCatalogueProducts(products: NormalizedCatalogueProduct[]) {
  const seen = new Set<string>()
  return products.filter((product) => {
    const key = normalizeCatalogueText(`${product.brand ?? ''}:${product.name}:${product.modelNumber ?? ''}:${product.manufacturerPartNumber ?? ''}`)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
