import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PriceObservation } from './types'
export { normalizePriceObservation, sameMaterialObservation } from './normalization'

type MonitoringWriter = SupabaseClient<Database>

export async function persistObservation(writer: MonitoringWriter, observation: PriceObservation): Promise<{ stored: boolean; reason?: string }> {
  const catalogProductId = observation.catalogProductId ?? observation.entityId
  if (!catalogProductId) return { stored: false, reason: 'The observation is missing the canonical catalogue product id required for persistence.' }

  const sourcePayload = {
    catalog_product_id: catalogProductId,
    provider: observation.sourceId,
    listing_identifier: observation.sourceListingId,
    source_url: observation.sourceUrl,
    is_active: true,
    // A source check is not successful until its observation is persisted (or
    // confirmed as an existing duplicate) below.
    last_successful_check: null,
    last_error_at: null,
    last_error_metadata: null,
  }
  const sourceInsert = await writer.from('product_sources').insert(sourcePayload).select('id,last_successful_check').single()
  const sourceResult = sourceInsert.error?.code === '23505'
    ? await writer.from('product_sources').select('id,last_successful_check').eq('provider', observation.sourceId).eq('listing_identifier', observation.sourceListingId).maybeSingle()
    : sourceInsert
  if (sourceResult.error || !sourceResult.data) return { stored: false, reason: sourceResult.error?.message ?? 'The product source could not be recorded.' }

  // The hardening migration adds this unique identity. Insert first and treat
  // a uniqueness conflict as an already-persisted observation; this remains
  // atomic under concurrent writers without changing append-only history.
  const observationPayload = {
    catalog_product_id: catalogProductId,
    product_source_id: sourceResult.data.id,
    observed_price_cents: observation.priceCents,
    currency: observation.currency,
    availability: observation.availability,
    observed_at: observation.observedAt,
    source_url: observation.sourceUrl,
    source_reference: observation.sourceListingId,
    metadata: observation.metadata as unknown as Database['public']['Tables']['price_observations']['Insert']['metadata'],
  }
  const observationResult = await writer.from('price_observations').insert(observationPayload).select('id').single()
  if (observationResult.error && observationResult.error.code !== '23505') return { stored: false, reason: observationResult.error.message }
  if (observationResult.error?.code === '23505') {
    const existing = await writer.from('price_observations')
      .select('id')
      .eq('product_source_id', sourceResult.data.id)
      .eq('observed_at', observation.observedAt)
      .eq('observed_price_cents', observation.priceCents)
      .maybeSingle()
    if (existing.error || !existing.data) return { stored: false, reason: existing.error?.message ?? 'The existing price observation could not be loaded.' }
  } else if (!observationResult.data) {
    return { stored: false, reason: 'The price observation could not be persisted.' }
  }

  const bookkeepingResult = await writer.from('product_sources')
    .update({ last_successful_check: observation.observedAt, last_error_at: null, last_error_metadata: null })
    .eq('id', sourceResult.data.id)
    .or(`last_successful_check.is.null,last_successful_check.lt.${observation.observedAt}`)
  if (bookkeepingResult.error) return { stored: false, reason: bookkeepingResult.error.message }
  return { stored: true }
}
