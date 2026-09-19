import 'server-only'

import { deduplicateProducts, rankCatalogueProduct, normalizeCatalogueProduct } from './normalization'
import { getFeaturedProducts } from './featured'
import { getCatalogueProviders } from './ebay'
import { searchLocalCatalogue } from './local'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { persistDiscoveredProducts } from './persistence'
import type { CatalogueSearchOptions, CatalogueSearchResult, NormalizedCatalogueProduct, ProductCatalogueProvider } from './types'

const externalRequests = new Map<string, { expiresAt: number; promise: Promise<NormalizedCatalogueProduct[]> }>()
const successfulExternalCache = new Map<string, { expiresAt: number; products: NormalizedCatalogueProduct[] }>()
const EXTERNAL_REQUEST_TTL_MS = 15_000
const SUCCESSFUL_EXTERNAL_CACHE_TTL_MS = 10 * 60_000

function clampLimit(limit: number | undefined): number {
  return Math.max(1, Math.min(limit ?? 8, 20))
}

function externalSearch(provider: ProductCatalogueProvider, query: string, limit: number): Promise<NormalizedCatalogueProduct[]> {
  const key = `${provider.id}:${query.toLowerCase()}:${limit}`
  const cached = successfulExternalCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.products)
  const existing = externalRequests.get(key)
  if (existing && existing.expiresAt > Date.now()) return existing.promise
  const promise = provider.search(query, { limit }).then(products => {
    if (products.length) successfulExternalCache.set(key, { expiresAt: Date.now() + SUCCESSFUL_EXTERNAL_CACHE_TTL_MS, products })
    return products
  }).catch(error => {
    externalRequests.delete(key)
    throw error
  })
  externalRequests.set(key, { expiresAt: Date.now() + EXTERNAL_REQUEST_TTL_MS, promise })
  return promise
}

export async function searchCatalogue(
  supabase: Parameters<typeof searchLocalCatalogue>[0],
  query: string,
  options: CatalogueSearchOptions = {},
): Promise<CatalogueSearchResult> {
  const safeQuery = query.trim().slice(0, 80)
  const limit = clampLimit(options.limit)
  const localProducts = await searchLocalCatalogue(supabase, safeQuery, limit)
  const localWithFeatured = deduplicateProducts([
    ...localProducts,
    ...getFeaturedProducts(limit).filter(product => !safeQuery || rankCatalogueProduct(product, safeQuery) > 0),
  ])
  const enoughLocal = localWithFeatured.length >= (options.minimumLocalResults ?? 3)
  const canSearchExternally = safeQuery.length >= 3 && options.allowExternal !== false
  if (!canSearchExternally || enoughLocal) {
    return {
      products: localWithFeatured.sort((left, right) => rankCatalogueProduct(right, safeQuery) - rankCatalogueProduct(left, safeQuery)).slice(0, limit),
      source: localWithFeatured.some(product => product.isFeatured) && !localProducts.length ? 'featured' : 'local',
      externalLookupAttempted: false,
      externalLookupSkippedReason: !canSearchExternally ? 'External lookup waits for a query of at least three characters.' : undefined,
      cache: { attempted: false, persisted: 0, reason: 'Catalogue cache writes require a trusted catalogue writer; the current schema only permits user-authored entities.' },
    }
  }

  const provider = getCatalogueProviders().find(candidate => candidate.status().available)
  if (!provider) {
    return {
      products: localWithFeatured.slice(0, limit),
      source: localWithFeatured.length ? 'local' : 'featured',
      externalLookupAttempted: false,
      externalLookupSkippedReason: 'No catalogue provider credentials are configured.',
      cache: { attempted: false, persisted: 0, reason: 'No live provider was available.' },
    }
  }

  let externalProducts: NormalizedCatalogueProduct[] = []
  try {
    externalProducts = (await externalSearch(provider, safeQuery, Math.min(6, limit)))
      .map(product => normalizeCatalogueProduct(product))
      .filter((product): product is NormalizedCatalogueProduct => Boolean(product))
  } catch (error) {
    console.error(`[catalogue.search:${options.requestId ?? 'untracked'}] Provider request failed.`, error)
    return {
      products: localWithFeatured.slice(0, limit),
      source: localWithFeatured.length ? 'local' : 'featured',
      externalLookupAttempted: true,
      externalLookupSkippedReason: 'The live catalogue source is temporarily unavailable.',
      cache: { attempted: false, persisted: 0, reason: 'Provider request failed before a cache write.' },
    }
  }
  const writer = createServiceRoleClient()
  let persistedProducts = externalProducts
  let persisted = 0
  let persistenceReason = 'Successful discoveries use a short-lived process cache.'
  if (writer && externalProducts.length) {
    try {
      persistedProducts = await persistDiscoveredProducts(writer, externalProducts)
      persisted = persistedProducts.filter(product => Boolean(product.catalogProductId)).length
      persistenceReason = persisted ? 'Successful discoveries were cached in the shared Supabase catalogue.' : 'The provider returned products that could not be cached.'
    } catch (error) {
      console.error(`[catalogue.search:${options.requestId ?? 'untracked'}] Catalogue cache write failed.`, error)
      persistenceReason = 'Catalogue results could not be cached.'
    }
  } else if (!writer) {
    persistenceReason = 'No server-only Supabase catalogue writer is configured.'
  }
  const products = deduplicateProducts([...localWithFeatured, ...persistedProducts])
    .sort((left, right) => rankCatalogueProduct(right, safeQuery) - rankCatalogueProduct(left, safeQuery))
    .slice(0, limit)
  return {
    products,
    source: 'local+external',
    externalLookupAttempted: true,
    cache: { attempted: externalProducts.length > 0, persisted, reason: externalProducts.length ? persistenceReason : 'The provider returned no cacheable product.' },
  }
}
