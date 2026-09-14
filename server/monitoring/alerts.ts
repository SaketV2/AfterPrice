import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateProductOpportunity } from './opportunity'
import type { PriceObservation } from './types'

type Writer = SupabaseClient<Database>

export async function createPurchaseAlerts(writer: Writer, userId: string, observation: PriceObservation) {
  const catalogProductId = observation.catalogProductId ?? observation.entityId
  if (!catalogProductId) return 0
  const { data: purchases, error } = await writer.from('purchases').select('*').eq('user_id', userId).eq('catalog_product_id', catalogProductId)
  if (error) throw new Error(`Purchase alert lookup failed: ${error.message}`)
  let created = 0
  for (const purchase of purchases ?? []) {
    const opportunity = calculateProductOpportunity({
      canonicalKey: observation.canonicalKey,
      paidAmountCents: purchase.paid_amount_cents,
      purchaseDate: `${purchase.purchase_date}T00:00:00.000Z`,
      returnDeadline: purchase.return_deadline ? `${purchase.return_deadline}T23:59:59.999Z` : null,
      returnDeadlineConfidence: purchase.return_deadline_source === 'user_confirmed' ? 'user_confirmed' : purchase.return_deadline_source === 'estimated' || purchase.return_deadline_source === 'retailer_policy' ? 'estimated' : 'unknown',
      observation,
    })
    if (opportunity.status !== 'opportunity') continue
    const daysLeft = purchase.return_deadline ? Math.ceil((Date.parse(`${purchase.return_deadline}T23:59:59.999Z`) - Date.now()) / 86_400_000) : null
    const severity = daysLeft !== null && daysLeft <= 3 ? 'urgent' : daysLeft !== null && daysLeft <= 7 ? 'high' : 'medium'
    const dedupeKey = `price-drop:${purchase.id}:${observation.sourceId}:${observation.sourceListingId}:${observation.priceCents}`
    const result = await writer.from('alerts').upsert({
      user_id: userId,
      purchase_id: purchase.id,
      alert_type: 'price_drop',
      severity,
      title: 'Price drop found',
      summary: `A compatible ${observation.sourceName} observation is ${formatMoney(opportunity.potentialSavingCents)} below what you paid.`,
      source: observation.sourceName,
      source_url: observation.sourceUrl,
      observed_at: observation.observedAt,
      next_action: daysLeft === null ? 'Check the retailer’s price-adjustment or returns policy.' : `Review the retailer’s policy with ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in the recorded return window.`,
      dedupe_key: dedupeKey,
    }, { onConflict: 'user_id,dedupe_key' })
    if (result.error) throw new Error(`Purchase alert write failed: ${result.error.message}`)
    created += 1
  }
  return created
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}
