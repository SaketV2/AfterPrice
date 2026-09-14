import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { validateSupportedUrl } from './url-safety'
import type { PriceObservation } from './types'

export function normalizePriceObservation(input: PriceObservation): PriceObservation | null {
  if (!input.canonicalKey || !input.sourceId || !input.sourceListingId || !input.sourceName) return null
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) return null
  if (!/^[A-Z]{3}$/.test(input.currency)) return null
  const sourceUrl = validateSupportedUrl(input.sourceUrl)
  if (!sourceUrl.ok) return null
  const observedAt = new Date(input.observedAt)
  if (Number.isNaN(observedAt.getTime())) return null
  return {
    ...input,
    sourceUrl: sourceUrl.url.toString(),
    observedAt: observedAt.toISOString(),
    availability: input.availability ?? 'unknown',
    metadata: input.metadata ?? {},
  }
}

export function sameMaterialObservation(left: PriceObservation, right: PriceObservation): boolean {
  return left.canonicalKey === right.canonicalKey
    && left.sourceId === right.sourceId
    && left.sourceListingId === right.sourceListingId
    && left.priceCents === right.priceCents
    && left.currency === right.currency
    && left.availability === right.availability
}

type MonitoringWriter = SupabaseClient<Database>

export async function persistObservation(writer: MonitoringWriter, observation: PriceObservation): Promise<{ stored: boolean; reason?: string }> {
  const catalogProductId = observation.catalogProductId ?? observation.entityId
  if (!catalogProductId) return { stored: false, reason: 'The observation is missing the canonical catalogue product id required for persistence.' }

  const sourceResult = await writer.from('product_sources').upsert({
    catalog_product_id: catalogProductId,
    provider: observation.sourceId,
    listing_identifier: observation.sourceListingId,
    source_url: observation.sourceUrl,
    is_active: true,
    last_successful_check: observation.observedAt,
    last_error_at: null,
    last_error_metadata: null,
  }, { onConflict: 'provider,listing_identifier' }).select('id').single()
  if (sourceResult.error || !sourceResult.data) return { stored: false, reason: sourceResult.error?.message ?? 'The product source could not be recorded.' }

  const existing = await writer.from('price_observations').select('id').eq('product_source_id', sourceResult.data.id).eq('observed_at', observation.observedAt).eq('observed_price_cents', observation.priceCents).maybeSingle()
  if (existing.error) return { stored: false, reason: existing.error.message }
  if (!existing.data) {
    const insertResult = await writer.from('price_observations').insert({
      catalog_product_id: catalogProductId,
      product_source_id: sourceResult.data.id,
      observed_price_cents: observation.priceCents,
      currency: observation.currency,
      availability: observation.availability,
      observed_at: observation.observedAt,
      source_url: observation.sourceUrl,
      source_reference: observation.sourceListingId,
      metadata: observation.metadata as unknown as Database['public']['Tables']['price_observations']['Insert']['metadata'],
    })
    if (insertResult.error) return { stored: false, reason: insertResult.error.message }
  }
  await writer.from('product_sources').update({ last_successful_check: observation.observedAt, last_error_at: null, last_error_metadata: null }).eq('id', sourceResult.data.id)
  return { stored: true }
}
