import type { Database } from '@/lib/supabase/database.types'

export type Baseline = Database['public']['Tables']['baselines']['Row']
export type Entity = Database['public']['Tables']['entities']['Row']
export type Observation = Database['public']['Tables']['observations']['Row']
export type BaselineRecord = Baseline & { entities: Entity & { observations: Observation[] } }

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type CatalogProduct = Database['public']['Tables']['catalog_products']['Row']
export type CatalogProductAlias = Database['public']['Tables']['catalog_product_aliases']['Row']
export type CatalogService = Database['public']['Tables']['catalog_services']['Row']
export type CatalogSubscriptionPlan = Database['public']['Tables']['catalog_subscription_plans']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionUsageEvent = Database['public']['Tables']['subscription_usage_events']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type ProductSource = Database['public']['Tables']['product_sources']['Row']
export type PriceObservation = Database['public']['Tables']['price_observations']['Row']
export type SubscriptionPlanObservation = Database['public']['Tables']['subscription_plan_observations']['Row']

export type PurchaseWithProduct = Purchase & { catalog_products: CatalogProduct | null }
export type SubscriptionWithCatalogue = Subscription & {
  catalog_services: CatalogService | null
  catalog_subscription_plans: CatalogSubscriptionPlan | null
}
export type PurchaseWithObservations = PurchaseWithProduct & {
  price_observations: PriceObservation[]
}
export type SubscriptionWithObservations = SubscriptionWithCatalogue & {
  subscription_plan_observations: SubscriptionPlanObservation[]
  subscription_usage_events: SubscriptionUsageEvent[]
}

export type ReturnWindowState = 'active' | 'expired' | 'uncertain' | 'not_applicable'
export type ProductComparison = {
  state: 'price_drop' | 'unchanged' | 'price_increase' | 'no_observation'
  paidAmountCents: number
  currentPriceCents: number | null
  potentialSavingCents: number
  returnWindow: ReturnWindowState
  observation: PriceObservation | null
}

export type SubscriptionComparison = {
  state: 'price_increase' | 'plan_change' | 'renewal_approaching' | 'unchanged' | 'no_observation'
  amountDeltaCents: number | null
  daysToRenewal: number | null
  observation: SubscriptionPlanObservation | null
}

export type ComparisonKind = 'price_increase' | 'price_decrease' | 'unchanged' | 'subscription_change' | 'renewal_approaching' | 'no_observation'
export type Comparison = {
  kind: ComparisonKind
  headline: string
  details: string[]
  currentAmountCents: number | null
  amountDeltaCents: number | null
  latestObservation: Observation | null
  nextAction: { category: 'review' | 'claim' | 'keep' | 'change' | 'cancel' | 'dismiss'; label: string }
}
