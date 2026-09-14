import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeIdentifier } from './normalization'
import type { NormalizedCatalogueProduct } from './types'

type CatalogueWriter = SupabaseClient<Database>

function identityKey(product: NormalizedCatalogueProduct) {
  const name = product.displayName
  const mpn = product.identifiers.mpn?.[0] ?? ''
  return normalizeIdentifier(`${product.brand ?? ''}:${name}:${product.modelNumber ?? ''}:${mpn}:${product.variant ?? ''}`)
}

export async function persistDiscoveredProducts(writer: CatalogueWriter, products: NormalizedCatalogueProduct[]) {
  const persisted: NormalizedCatalogueProduct[] = []
  for (const product of products) {
    if (product.catalogProductId) {
      persisted.push(product)
      continue
    }
    const mpn = product.identifiers.mpn?.[0] ?? null
    let id: string | null = null
    if (product.brand && product.modelNumber) {
      const existing = await writer.from('catalog_products').select('id').eq('brand', product.brand).eq('model_number', product.modelNumber).limit(1).maybeSingle()
      if (existing.error) throw new Error(`Catalogue identity lookup failed: ${existing.error.message}`)
      id = existing.data?.id ?? null
    }
    if (!id) {
      const result = await writer.from('catalog_products').insert({
        brand: product.brand ?? null,
        name: product.displayName,
        model_number: product.modelNumber ?? null,
        manufacturer_part_number: mpn,
        category: product.category ?? null,
        image_url: product.imageUrl ?? null,
        variant_data: { ...product.metadata, variant: product.variant ?? null } as unknown as Database['public']['Tables']['catalog_products']['Insert']['variant_data'],
        is_featured: false,
      }).select('id').maybeSingle()
      id = result.data?.id ?? null
      if (!id && result.error?.code === '23505') {
        const existing = await writer.from('catalog_products').select('id').eq('identity_key', identityKey(product)).limit(1).maybeSingle()
        if (existing.error) throw new Error(`Catalogue identity lookup failed: ${existing.error.message}`)
        id = existing.data?.id ?? null
      } else if (result.error) {
        throw new Error(`Catalogue cache insert failed: ${result.error.message}`)
      }
    }
    if (!id) continue

    if (product.aliases.length) {
      await writer.from('catalog_product_aliases').upsert(product.aliases.map(alias => ({ catalog_product_id: id!, alias })), { onConflict: 'catalog_product_id,normalized_alias' })
    }
    type IdentifierInsert = Database['public']['Tables']['catalog_product_identifiers']['Insert']
    const identifiers: IdentifierInsert[] = Object.entries(product.identifiers).flatMap(([type, values]) => (values ?? []).map(value => ({
      catalog_product_id: id!,
      identifier_type: (type === 'epid' ? 'ebay_epid' : type === 'sku' ? 'retailer_sku' : type) as IdentifierInsert['identifier_type'],
      identifier_value: value,
      provider: product.provider,
      provider_product_id: product.providerProductId ?? null,
    })))
    if (identifiers.length) await writer.from('catalog_product_identifiers').upsert(identifiers, { onConflict: 'identifier_type,normalized_identifier,provider' })
    persisted.push({ ...product, catalogProductId: id })
  }
  return persisted
}
