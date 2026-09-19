import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
export { isSubscriptionObservationDue } from './subscription-cadence'
import { classifySubscriptionObservationTransition } from './subscription-logic'

type Writer = SupabaseClient<Database>
type Cadence = Database['public']['Tables']['catalog_subscription_plans']['Row']['cadence']
type SubscriptionPlanObservation = Database['public']['Tables']['subscription_plan_observations']['Row']

export type CanonicalSubscriptionPlan = {
  catalogServiceId: string
  catalogPlanId: string
  priceCents: number | null
  currency: string | null
  cadence: Cadence
  featureData: Database['public']['Tables']['catalog_subscription_plans']['Row']['feature_data']
  source: string | null
  sourceUrl: string | null
  observedAt: string | null
  name?: string | null
}

function validPrice(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 0)
}

function validCurrency(value: string | null): boolean {
  return value === null || /^[A-Z]{3}$/.test(value)
}

function validObservedAt(value: string | null): value is string {
  return Boolean(value && !Number.isNaN(Date.parse(value)))
}

/**
 * Append a trusted catalogue-plan snapshot. This deliberately accepts only
 * canonical catalogue data; it does not fetch or infer prices from websites.
 */
export async function persistSubscriptionPlanObservation(
  writer: Writer,
  plan: CanonicalSubscriptionPlan,
): Promise<{ stored: boolean; observation?: SubscriptionPlanObservation; reason?: string }> {
  const source = plan.source?.trim()
  if (!plan.catalogServiceId || !plan.catalogPlanId || !source || !validObservedAt(plan.observedAt) || !validPrice(plan.priceCents) || !validCurrency(plan.currency)) {
    return { stored: false, reason: 'The canonical plan does not contain a trusted source observation.' }
  }

  const observedAt = new Date(plan.observedAt).toISOString()
  const payload = {
    catalog_service_id: plan.catalogServiceId,
    catalog_plan_id: plan.catalogPlanId,
    price_cents: plan.priceCents,
    currency: plan.currency,
    cadence: plan.cadence,
    feature_data: plan.featureData,
    source,
    source_url: plan.sourceUrl,
    observed_at: observedAt,
  }
  const result = await writer.from('subscription_plan_observations').insert(payload).select('*').single()
  if (!result.error && result.data) return { stored: true, observation: result.data as SubscriptionPlanObservation }
  if (result.error?.code === '23505') {
    const existing = await writer.from('subscription_plan_observations')
      .select('*')
      .eq('catalog_service_id', plan.catalogServiceId)
      .eq('catalog_plan_id', plan.catalogPlanId)
      .eq('observed_at', observedAt)
      .eq('source', source)
      .maybeSingle()
    if (!existing.error && existing.data) return { stored: false, observation: existing.data as SubscriptionPlanObservation, reason: 'The trusted snapshot was already recorded.' }
  }
  return { stored: false, reason: result.error?.message ?? 'The subscription observation could not be persisted.' }
}

type SubscriptionForAlerts = Database['public']['Tables']['subscriptions']['Row']

/** Create only transition alerts for a trusted, newly observed canonical plan. */
export async function createSubscriptionObservationAlerts(
  writer: Writer,
  subscription: SubscriptionForAlerts,
  observation: SubscriptionPlanObservation,
): Promise<number> {
  let historyQuery = writer
    .from('subscription_plan_observations')
    .select('*')
    .eq('catalog_service_id', observation.catalog_service_id)
    .order('observed_at', { ascending: false })
    .limit(3)
  historyQuery = observation.catalog_plan_id === null
    ? historyQuery.is('catalog_plan_id', null)
    : historyQuery.eq('catalog_plan_id', observation.catalog_plan_id)
  const historyResult = await historyQuery
  if (historyResult.error) throw new Error(`Subscription observation history lookup failed: ${historyResult.error.message}`)
  const previous = (historyResult.data ?? []).find(item => item.id !== observation.id) as SubscriptionPlanObservation | undefined
  // A first trusted snapshot can still reveal a price below the user's saved
  // baseline. Material plan-change alerts require a previous snapshot.
  const transition = classifySubscriptionObservationTransition(previous ?? observation, observation, { amountCents: subscription.amount_cents, currency: subscription.currency })
  const { materialChange, cheaperThanBaseline: cheaper } = transition
  if (!materialChange && !cheaper) return 0

  let created = 0
  if (cheaper) {
    const result = await writer.from('alerts').upsert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      alert_type: 'cheaper_plan',
      severity: 'medium',
      title: 'A cheaper plan was observed',
      summary: `The trusted ${observation.source} snapshot is below your recorded subscription amount.`,
      source: observation.source,
      source_url: observation.source_url,
      observed_at: observation.observed_at,
      next_action: 'Review the provider’s current plan details before your next renewal.',
      dedupe_key: `subscription-cheaper:${subscription.id}:${observation.id}`,
    }, { onConflict: 'user_id,dedupe_key' })
    if (result.error) throw new Error(`Subscription alert write failed: ${result.error.message}`)
    created += 1
  }
  if (materialChange) {
    const result = await writer.from('alerts').upsert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      alert_type: 'plan_change',
      severity: 'info',
      title: 'Subscription plan details changed',
      summary: `A trusted ${observation.source} snapshot changed price, cadence, or plan details.`,
      source: observation.source,
      source_url: observation.source_url,
      observed_at: observation.observed_at,
      next_action: 'Review the provider’s current plan details before your next renewal.',
      dedupe_key: `subscription-plan-change:${subscription.id}:${observation.id}`,
    }, { onConflict: 'user_id,dedupe_key' })
    if (result.error) throw new Error(`Subscription alert write failed: ${result.error.message}`)
    created += 1
  }
  return created
}
