import type { CatalogueEntityProduct, NormalizedCatalogueProduct } from './types'

export function normalizeSearchTerm(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function normalizeIdentifier(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function normalizeModelNumber(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalised = normalizeIdentifier(value)
  return normalised || undefined
}

export function canonicalProductKey(input: {
  brand?: string
  modelNumber?: string
  displayName: string
}): string {
  const identity = [input.brand, input.modelNumber].filter(Boolean).join(' ')
  return normalizeIdentifier(identity || input.displayName)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map(item => item.trim())
}

function asMetadata(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function productFromEntity(row: {
  id: string
  provider: string
  external_id: string
  display_name: string
  brand: string | null
  variant: string | null
  category: string | null
  source_url: string | null
  metadata: unknown
}): CatalogueEntityProduct {
  const metadata = asMetadata(row.metadata)
  const identifiers = metadata.identifiers !== null && typeof metadata.identifiers === 'object' && !Array.isArray(metadata.identifiers)
    ? metadata.identifiers as NormalizedCatalogueProduct['identifiers']
    : {}
  const modelNumber = asString(metadata.model_number) ?? asString(metadata.modelNumber)
  const aliases = asStringArray(metadata.aliases)
  const displayName = row.display_name.trim()
  return {
    id: row.id,
    canonicalKey: asString(metadata.canonical_key) ?? canonicalProductKey({ brand: row.brand ?? undefined, modelNumber, displayName }),
    provider: row.provider,
    providerProductId: asString(metadata.provider_product_id),
    displayName,
    brand: row.brand ?? undefined,
    modelNumber,
    variant: row.variant ?? undefined,
    category: row.category ?? undefined,
    imageUrl: asString(metadata.image_url),
    sourceUrl: row.source_url ?? undefined,
    aliases,
    identifiers,
    metadata,
    isFeatured: metadata.featured === true,
    featuredRank: typeof metadata.featured_rank === 'number' ? metadata.featured_rank : undefined,
  }
}

export function productFromCatalogProduct(
  row: {
    id: string
    brand: string | null
    name: string
    model_number: string | null
    manufacturer_part_number: string | null
    category: string | null
    image_url: string | null
    variant_data: unknown
    is_featured: boolean
    featured_rank: number | null
  },
  aliases: string[] = [],
  identifiers: Partial<Record<'gtin' | 'ean' | 'upc' | 'mpn' | 'epid' | 'sku', string[]>> = {},
): NormalizedCatalogueProduct {
  const variantData = asMetadata(row.variant_data)
  const displayName = [row.brand, row.name].filter(Boolean).join(' ')
  return {
    catalogProductId: row.id,
    canonicalKey: canonicalProductKey({ brand: row.brand ?? undefined, modelNumber: row.model_number ?? undefined, displayName: row.name }),
    provider: 'afterprice-catalogue',
    displayName,
    brand: row.brand ?? undefined,
    modelNumber: row.model_number ?? undefined,
    variant: typeof variantData.variant === 'string' ? variantData.variant : undefined,
    category: row.category ?? undefined,
    imageUrl: row.image_url ?? undefined,
    aliases: Array.from(new Set([row.name, displayName, ...aliases].map(normalizeSearchTerm).filter(Boolean))),
    identifiers,
    metadata: variantData,
    isFeatured: row.is_featured,
    featuredRank: row.featured_rank ?? undefined,
  }
}

export function normalizeCatalogueProduct(input: Omit<NormalizedCatalogueProduct, 'canonicalKey'> & { canonicalKey?: string }): NormalizedCatalogueProduct | null {
  const displayName = input.displayName.trim()
  if (!displayName) return null
  const brand = input.brand?.trim() || undefined
  const modelNumber = input.modelNumber?.trim() || undefined
  const aliases = Array.from(new Set([displayName, ...(input.aliases ?? [])].map(normalizeSearchTerm).filter(Boolean)))
  const canonicalKey = input.canonicalKey?.trim() || canonicalProductKey({ brand, modelNumber, displayName })
  if (!canonicalKey) return null
  return {
    ...input,
    canonicalKey,
    displayName,
    brand,
    modelNumber,
    variant: input.variant?.trim() || undefined,
    category: input.category?.trim() || undefined,
    aliases,
    identifiers: normaliseIdentifiers(input.identifiers),
    metadata: input.metadata ?? {},
  }
}

function normaliseIdentifiers(input: NormalizedCatalogueProduct['identifiers']): NormalizedCatalogueProduct['identifiers'] {
  const output: NormalizedCatalogueProduct['identifiers'] = {}
  for (const [type, values] of Object.entries(input ?? {})) {
    if (!Array.isArray(values)) continue
    const clean = Array.from(new Set(values.filter(Boolean).map(value => normalizeIdentifier(value)).filter(Boolean)))
    if (clean.length) output[type as keyof typeof output] = clean
  }
  return output
}

export function rankCatalogueProduct(product: NormalizedCatalogueProduct, query: string): number {
  const normalisedQuery = normalizeSearchTerm(query)
  if (!normalisedQuery) return product.featuredRank ? 1000 - product.featuredRank : 0
  const identifierQuery = normalizeIdentifier(query)
  const identifiers = Object.values(product.identifiers).flat()
  if (identifiers.some(identifier => normalizeIdentifier(identifier) === identifierQuery)) return 1000
  if (product.modelNumber && normalizeIdentifier(product.modelNumber) === identifierQuery) return 950
  const aliases = product.aliases.map(normalizeSearchTerm)
  if (aliases.includes(normalisedQuery)) return 900
  const title = normalizeSearchTerm(product.displayName)
  if (title.startsWith(normalisedQuery)) return 800
  if (title.includes(normalisedQuery)) return 700
  const brand = normalizeSearchTerm(product.brand ?? '')
  if (brand === normalisedQuery) return 650
  if (brand.includes(normalisedQuery) || aliases.some(alias => alias.includes(normalisedQuery))) return 500
  return 0
}

export function deduplicateProducts(products: NormalizedCatalogueProduct[]): NormalizedCatalogueProduct[] {
  const byKey = new Map<string, NormalizedCatalogueProduct>()
  for (const product of products) {
    const identifierKey = Object.values(product.identifiers).flat().map(normalizeIdentifier).find(Boolean)
    const modelKey = product.modelNumber ? `${normalizeIdentifier(product.brand ?? '')}:${normalizeIdentifier(product.modelNumber)}` : undefined
    const key = identifierKey ? `identifier:${identifierKey}` : modelKey ? `model:${modelKey}` : `product:${product.canonicalKey}`
    const current = byKey.get(key)
    if (!current) {
      byKey.set(key, product)
      continue
    }
    byKey.set(key, mergeProducts(current, product))
  }
  return Array.from(byKey.values())
}

function mergeProducts(left: NormalizedCatalogueProduct, right: NormalizedCatalogueProduct): NormalizedCatalogueProduct {
  const aliases = Array.from(new Set([...left.aliases, ...right.aliases].map(normalizeSearchTerm).filter(Boolean)))
  const identifiers: NormalizedCatalogueProduct['identifiers'] = { ...left.identifiers }
  for (const [type, values] of Object.entries(right.identifiers)) {
    identifiers[type as keyof typeof identifiers] = Array.from(new Set([...(identifiers[type as keyof typeof identifiers] ?? []), ...(values ?? [])]))
  }
  return {
    ...left,
    catalogProductId: left.catalogProductId ?? right.catalogProductId,
    providerProductId: left.providerProductId ?? right.providerProductId,
    brand: left.brand ?? right.brand,
    modelNumber: left.modelNumber ?? right.modelNumber,
    variant: left.variant ?? right.variant,
    category: left.category ?? right.category,
    imageUrl: left.imageUrl ?? right.imageUrl,
    sourceUrl: left.sourceUrl ?? right.sourceUrl,
    aliases,
    identifiers,
    metadata: { ...right.metadata, ...left.metadata },
    isFeatured: left.isFeatured || right.isFeatured,
    featuredRank: left.featuredRank ?? right.featuredRank,
  }
}
