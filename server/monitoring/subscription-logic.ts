import type { Database } from '@/lib/supabase/database.types'

type SubscriptionPlanObservation = Database['public']['Tables']['subscription_plan_observations']['Row']

export type SubscriptionObservationTransition = {
  materialChange: boolean
  priceTransition: boolean
  cheaperThanBaseline: boolean
}

function samePlan(left: SubscriptionPlanObservation, right: SubscriptionPlanObservation): boolean {
  return left.price_cents === right.price_cents
    && left.currency === right.currency
    && left.cadence === right.cadence
    && JSON.stringify(left.feature_data) === JSON.stringify(right.feature_data)
}

export function classifySubscriptionObservationTransition(
  previous: SubscriptionPlanObservation,
  current: SubscriptionPlanObservation,
  baseline: { amountCents: number; currency: string },
): SubscriptionObservationTransition {
  const materialChange = !samePlan(previous, current)
  const priceTransition = previous.price_cents !== current.price_cents || previous.currency !== current.currency
  const currencyMatches = current.currency === null || current.currency === baseline.currency
  return {
    materialChange,
    priceTransition,
    cheaperThanBaseline: priceTransition && currencyMatches && current.price_cents !== null && current.price_cents < baseline.amountCents,
  }
}
