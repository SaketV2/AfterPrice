import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { deduplicateProducts, normalizeIdentifier, normalizeSearchTerm, productFromCatalogProduct, rankCatalogueProduct } from './normalization'
import type { CatalogueEntityProduct, CatalogueIdentifierType, NormalizedCatalogueProduct } from './types'

type SupabaseServerClient = SupabaseClient<Database>
type CatalogRow = Database['public']['Tables']['catalog_products']['Row']
type AliasRow = Database['public']['Tables']['catalog_product_aliases']['Row']
type IdentifierRow = Database['public']['Tables']['catalog_product_identifiers']['Row']

function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, character => `\\${character}`)
}

function isCatalogueIdentifierType(value: string): value is CatalogueIdentifierType {
  return ['gtin', 'ean', 'upc', 'mpn', 'epid', 'sku'].includes(value)
}

function toProduct(row: CatalogRow, aliases: string[] = [], identifiers: IdentifierRow[] = []): NormalizedCatalogueProduct {
  const grouped: Partial<Record<'gtin' | 'ean' | 'upc' | 'mpn' | 'epid' | 'sku', string[]>> = {}
  for (const identifier of identifiers) {
    const type = identifier.identifier_type === 'ebay_epid' ? 'epid' : identifier.identifier_type === 'retailer_sku' ? 'sku' : identifier.identifier_type
    if (!isCatalogueIdentifierType(type)) continue
    const values = grouped[type] ?? []
    values.push(identifier.identifier_value)
    grouped[type] = values
  }
  return productFromCatalogProduct(row, aliases, grouped)
}

async function hydrateProducts(supabase: SupabaseServerClient, rows: CatalogRow[]): Promise<NormalizedCatalogueProduct[]> {
  const ids = rows.map(row => row.id)
  if (!ids.length) return []
  const [aliasResult, identifierResult] = await Promise.all([
    supabase.from('catalog_product_aliases').select('*').in('catalog_product_id', ids),
    supabase.from('catalog_product_identifiers').select('*').in('catalog_product_id', ids),
  ])
  if (aliasResult.error) throw new Error(`Catalogue alias search failed: ${aliasResult.error.message}`)
  if (identifierResult.error) throw new Error(`Catalogue identifier search failed: ${identifierResult.error.message}`)
  const aliasesByProduct = new Map<string, string[]>()
  for (const alias of (aliasResult.data ?? []) as AliasRow[]) {
    aliasesByProduct.set(alias.catalog_product_id, [...(aliasesByProduct.get(alias.catalog_product_id) ?? []), alias.alias])
  }
  const identifiersByProduct = new Map<string, IdentifierRow[]>()
  for (const identifier of (identifierResult.data ?? []) as IdentifierRow[]) {
    identifiersByProduct.set(identifier.catalog_product_id, [...(identifiersByProduct.get(identifier.catalog_product_id) ?? []), identifier])
  }
  return rows.map(row => toProduct(row, aliasesByProduct.get(row.id), identifiersByProduct.get(row.id)))
}

export async function searchLocalCatalogue(
  supabase: SupabaseServerClient,
  query: string,
  limit: number,
): Promise<NormalizedCatalogueProduct[]> {
  const safeLimit = Math.max(1, Math.min(limit, 20))
  const trimmed = query.trim().slice(0, 80)
  const normalisedSearch = normalizeSearchTerm(trimmed)
  const normalisedIdentifier = normalizeIdentifier(trimmed)
  const base = () => supabase.from('catalog_products').select('*').limit(Math.max(safeLimit * 3, 12))

  const results = trimmed
    ? await Promise.all([
        base().ilike('identity_key', `%${escapeIlike(normalisedIdentifier)}%`),
        base().ilike('name', `%${escapeIlike(trimmed)}%`),
        base().ilike('brand', `%${escapeIlike(trimmed)}%`),
        supabase.from('catalog_product_aliases').select('catalog_product_id').ilike('normalized_alias', `%${escapeIlike(normalisedIdentifier)}%`).limit(Math.max(safeLimit * 3, 12)),
        supabase.from('catalog_product_identifiers').select('catalog_product_id').ilike('normalized_identifier', `%${escapeIlike(normalisedIdentifier)}%`).limit(Math.max(safeLimit * 3, 12)),
      ])
    : [await base().eq('is_featured', true).order('featured_rank', { ascending: true, nullsFirst: false })]

  const productRows: CatalogRow[] = []
  const linkedIds = new Set<string>()
  for (const result of results) {
    if (result.error) throw new Error(`Local catalogue search failed: ${result.error.message}`)
    for (const row of result.data ?? []) {
      if (typeof row === 'object' && row !== null && 'id' in row) productRows.push(row as CatalogRow)
      if (typeof row === 'object' && row !== null && 'catalog_product_id' in row && typeof row.catalog_product_id === 'string') linkedIds.add(row.catalog_product_id)
    }
  }

  if (linkedIds.size) {
    const linked = await supabase.from('catalog_products').select('*').in('id', [...linkedIds]).limit(Math.max(safeLimit * 3, 12))
    if (linked.error) throw new Error(`Catalogue match loading failed: ${linked.error.message}`)
    productRows.push(...(linked.data ?? []) as CatalogRow[])
  }

  return deduplicateProducts(await hydrateProducts(supabase, productRows))
    .map(product => ({ product, rank: rankCatalogueProduct(product, trimmed) }))
    .filter(({ rank }) => !normalisedSearch || rank > 0)
    .sort((left, right) => right.rank - left.rank || (left.product.featuredRank ?? 999) - (right.product.featuredRank ?? 999))
    .slice(0, safeLimit)
    .map(({ product }) => product)
}

export async function findProductById(supabase: SupabaseServerClient, id: string): Promise<CatalogueEntityProduct | null> {
  const result = await supabase.from('catalog_products').select('*').eq('id', id).maybeSingle()
  if (result.error) throw new Error(`Catalogue lookup failed: ${result.error.message}`)
  if (!result.data) return null
  const [product] = await hydrateProducts(supabase, [result.data as CatalogRow])
  return product ? { ...product, id } : null
}

export const findEntityById = findProductById
