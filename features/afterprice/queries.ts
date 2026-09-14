import { cache } from 'react'
import { getAuthenticatedContext } from '@/lib/supabase/server'
import { normalizeCatalogueText } from './catalogue'
import type { Alert, BaselineRecord, CatalogProduct, CatalogService, CatalogSubscriptionPlan, Entity, PriceObservation, Profile, PurchaseWithProduct, SubscriptionPlanObservation, SubscriptionWithCatalogue, SubscriptionUsageEvent, UserPreferences } from './types'

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const result = new Map<string, T[]>()
  for (const item of items) result.set(key(item), [...(result.get(key(item)) ?? []), item])
  return result
}

function jsonObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function entityForProduct(purchase: PurchaseWithProduct, displayName: string): Entity {
  const product = purchase.catalog_products
  return {
    id: product?.id ?? purchase.id,
    entity_type: 'retail_product',
    provider: purchase.retailer_name,
    external_id: product?.identity_key ?? `custom:${purchase.id}`,
    display_name: displayName,
    brand: product?.brand ?? null,
    variant: product?.model_number ?? null,
    size_label: typeof product?.variant_data === 'object' && product.variant_data && 'size' in product.variant_data && typeof product.variant_data.size === 'string' ? product.variant_data.size : null,
    category: product?.category ?? null,
    source_url: purchase.purchase_url,
    metadata: product?.variant_data ?? {},
    created_at: purchase.created_at,
    updated_at: purchase.updated_at,
  }
}

function entityForSubscription(subscription: SubscriptionWithCatalogue, displayName: string): Entity {
  const service = subscription.catalog_services
  const plan = subscription.catalog_subscription_plans
  return {
    id: service?.id ?? subscription.id,
    entity_type: 'subscription',
    provider: service?.name ?? subscription.custom_service_name ?? 'Custom service',
    external_id: service?.normalized_name ?? `custom:${subscription.id}`,
    display_name: displayName,
    brand: null,
    variant: plan?.name ?? null,
    size_label: null,
    category: service?.category ?? null,
    source_url: subscription.manage_url ?? service?.manage_url ?? service?.website_url ?? null,
    metadata: service?.supported_capabilities ?? {},
    created_at: subscription.created_at,
    updated_at: subscription.updated_at,
  }
}

function observationForPrice(price: PriceObservation & { product_sources?: { provider: string; source_url: string | null; listing_identifier: string } | null }) {
  return {
    id: price.id,
    entity_id: price.catalog_product_id,
    observation_type: 'price' as const,
    amount_cents: price.observed_price_cents,
    currency: price.currency,
    plan_name: null,
    billing_interval: null,
    renewal_at: null,
    source_name: price.product_sources?.provider ?? 'Price source',
    source_url: price.source_url ?? price.product_sources?.source_url ?? null,
    observed_at: price.observed_at,
    origin: 'authorised_feed' as const,
    metadata: { ...jsonObject(price.metadata), source_reference: price.source_reference, listing_identifier: price.product_sources?.listing_identifier ?? null },
    created_at: price.created_at,
  }
}

function observationForPlan(plan: SubscriptionPlanObservation, fallbackPlanName: string | null) {
  const featureData = jsonObject(plan.feature_data)
  return {
    id: plan.id,
    entity_id: plan.catalog_service_id,
    observation_type: 'plan' as const,
    amount_cents: plan.price_cents,
    currency: plan.currency,
    plan_name: fallbackPlanName ?? (typeof featureData.plan_name === 'string' ? featureData.plan_name : null),
    billing_interval: plan.cadence,
    renewal_at: null,
    source_name: plan.source,
    source_url: plan.source_url,
    observed_at: plan.observed_at,
    origin: 'authorised_feed' as const,
    metadata: featureData,
    created_at: plan.created_at,
  }
}

export const getBaselines = cache(async () => {
  const { supabase, userId } = await requireAuthenticatedContext()
  const [purchasesResult, subscriptionsResult] = await Promise.all([
    supabase.from('purchases').select('*, catalog_products(*)').order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*, catalog_services(*), catalog_subscription_plans(*)').order('created_at', { ascending: false }),
  ])
  if (purchasesResult.error) throw new Error(`Could not load purchases: ${purchasesResult.error.message}`)
  if (subscriptionsResult.error) throw new Error(`Could not load subscriptions: ${subscriptionsResult.error.message}`)

  const purchases = (purchasesResult.data ?? []) as unknown as PurchaseWithProduct[]
  const subscriptions = (subscriptionsResult.data ?? []) as unknown as SubscriptionWithCatalogue[]
  const productIds = [...new Set(purchases.map(item => item.catalog_product_id).filter((value): value is string => Boolean(value)))]
  const serviceIds = [...new Set(subscriptions.map(item => item.catalog_service_id).filter((value): value is string => Boolean(value)))]
  const [priceResult, planResult] = await Promise.all([
    productIds.length
      ? supabase.from('price_observations').select('*, product_sources(provider, source_url, listing_identifier)').in('catalog_product_id', productIds)
      : Promise.resolve({ data: [], error: null }),
    serviceIds.length
      ? supabase.from('subscription_plan_observations').select('*').in('catalog_service_id', serviceIds)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (priceResult.error) throw new Error(`Could not load price observations: ${priceResult.error.message}`)
  if (planResult.error) throw new Error(`Could not load subscription observations: ${planResult.error.message}`)

  type PriceRow = PriceObservation & { product_sources?: { provider: string; source_url: string | null; listing_identifier: string } | null }
  const priceRows = (priceResult.data ?? []) as unknown as PriceRow[]
  const planRows = (planResult.data ?? []) as unknown as SubscriptionPlanObservation[]
  const pricesByProduct = groupBy(priceRows, item => item.catalog_product_id)
  const plansByService = groupBy(planRows, item => item.catalog_service_id)

  const purchaseRecords = purchases.map(purchase => {
    const product = purchase.catalog_products
    const displayName = product ? [product.brand, product.name].filter(Boolean).join(' ') : purchase.custom_product_name ?? 'Custom product'
    const entity = entityForProduct(purchase, displayName)
    return {
      id: purchase.id,
      user_id: userId,
      entity_id: entity.id,
      baseline_type: 'purchase' as const,
      display_name: displayName,
      original_amount_cents: purchase.paid_amount_cents,
      currency: purchase.currency,
      plan_name: null,
      billing_interval: null,
      renewal_at: null,
      captured_at: purchase.purchase_date,
      source_url: purchase.purchase_url,
      created_at: purchase.created_at,
      updated_at: purchase.updated_at,
      entities: { ...entity, observations: (pricesByProduct.get(purchase.catalog_product_id ?? '') ?? []).map(price => observationForPrice(price)) },
    }
  })

  const subscriptionRecords = subscriptions.map(subscription => {
    const service = subscription.catalog_services
    const plan = subscription.catalog_subscription_plans
    const displayName = service?.name ?? subscription.custom_service_name ?? 'Custom subscription'
    const entity = entityForSubscription(subscription, displayName)
    const observations = (plansByService.get(subscription.catalog_service_id ?? '') ?? [])
      .filter(observation => !subscription.catalog_plan_id || observation.catalog_plan_id === subscription.catalog_plan_id || observation.catalog_plan_id === null)
      .map(observation => observationForPlan(observation, plan?.name ?? null))
    return {
      id: subscription.id,
      user_id: userId,
      entity_id: entity.id,
      baseline_type: 'subscription' as const,
      display_name: displayName,
      original_amount_cents: subscription.amount_cents,
      currency: subscription.currency,
      plan_name: plan?.name ?? null,
      billing_interval: subscription.billing_cadence,
      renewal_at: subscription.renewal_date,
      captured_at: subscription.start_date,
      source_url: subscription.manage_url,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
      entities: { ...entity, observations },
    }
  })

  return [...purchaseRecords, ...subscriptionRecords].sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at)) as BaselineRecord[]
})

export const getBaseline = cache(async (id: string) => {
  return (await getBaselines()).find(record => record.id === id) ?? null
})

export const getEntities = cache(async () => {
  const { supabase } = await requireAuthenticatedContext()
  const [productsResult, servicesResult, popularityResult] = await Promise.all([
    supabase.from('catalog_products').select('*').eq('is_featured', true).order('featured_rank', { ascending: true, nullsFirst: false }).order('name').limit(12),
    supabase.from('catalog_services').select('*').order('name').limit(50),
    supabase.from('catalog_product_popularity').select('catalog_product_id, purchase_count, tracking_user_count, recent_additions_30d, recent_additions_90d').order('tracking_user_count', { ascending: false }).order('recent_additions_30d', { ascending: false }).order('purchase_count', { ascending: false }).limit(12),
  ])
  if (productsResult.error) throw new Error(`Could not load product catalogue: ${productsResult.error.message}`)
  if (servicesResult.error) throw new Error(`Could not load service catalogue: ${servicesResult.error.message}`)
  if (popularityResult.error) throw new Error(`Could not load catalogue popularity: ${popularityResult.error.message}`)
  const featuredProducts = productsResult.data ?? []
  const maturePopularity = (popularityResult.data ?? []).filter(item => item.tracking_user_count >= 3)
  const popularIds = maturePopularity.map(item => item.catalog_product_id)
  const popularProductsResult = popularIds.length
    ? await supabase.from('catalog_products').select('*').in('id', popularIds)
    : null
  if (popularProductsResult?.error) throw new Error(`Could not load popular products: ${popularProductsResult.error.message}`)
  const popularityById = new Map(maturePopularity.map(item => [item.catalog_product_id, item.purchase_count]))
  const products = [...featuredProducts, ...(popularProductsResult?.data ?? [])].filter((product, index, all) => all.findIndex(candidate => candidate.id === product.id) === index).map(product => ({
    id: product.id,
    entity_type: 'retail_product' as const,
    provider: product.brand ?? 'Catalogue',
    external_id: product.identity_key,
    display_name: [product.brand, product.name].filter(Boolean).join(' '),
    brand: product.brand,
    variant: product.model_number,
    size_label: null,
    category: product.category,
    source_url: product.image_url,
    metadata: { ...jsonObject(product.variant_data), ...(popularityById.has(product.id) ? { popularity_count: popularityById.get(product.id) } : {}) },
    created_at: product.created_at,
    updated_at: product.updated_at,
  }))
  const services = (servicesResult.data ?? []).map(service => ({
    id: service.id,
    entity_type: 'subscription' as const,
    provider: service.name,
    external_id: service.normalized_name,
    display_name: service.name,
    brand: null,
    variant: null,
    size_label: null,
    category: service.category,
    source_url: service.manage_url ?? service.website_url,
    metadata: service.supported_capabilities,
    created_at: service.created_at,
    updated_at: service.updated_at,
  }))
  return {
    entities: [...products, ...services] as Entity[],
    productLabel: maturePopularity.length ? 'Popular on AfterPrice' : 'Featured products',
  }
})

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedContext>> & { userId: string }

async function requireAuthenticatedContext(): Promise<AuthenticatedContext> {
  const context = await getAuthenticatedContext()
  if (!context.userId) throw new Error('AUTH_REQUIRED')
  return context as AuthenticatedContext
}

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, userId } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(`Could not load profile: ${error.message}`)
  return data
})

export const getUserPreferences = cache(async (): Promise<UserPreferences | null> => {
  const { supabase, userId } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw new Error(`Could not load preferences: ${error.message}`)
  return data
})

export const getPurchases = cache(async (): Promise<PurchaseWithProduct[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('purchases').select('*, catalog_products(*)').order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load purchases: ${error.message}`)
  return (data ?? []) as unknown as PurchaseWithProduct[]
})

export const getPurchase = cache(async (id: string): Promise<PurchaseWithProduct | null> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('purchases').select('*, catalog_products(*)').eq('id', id).maybeSingle()
  if (error) throw new Error(`Could not load purchase: ${error.message}`)
  return data as unknown as PurchaseWithProduct | null
})

export const getSubscriptions = cache(async (): Promise<SubscriptionWithCatalogue[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('subscriptions').select('*, catalog_services(*), catalog_subscription_plans(*)').order('renewal_date', { ascending: true, nullsFirst: false })
  if (error) throw new Error(`Could not load subscriptions: ${error.message}`)
  return (data ?? []) as unknown as SubscriptionWithCatalogue[]
})

export const getSubscription = cache(async (id: string): Promise<SubscriptionWithCatalogue | null> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('subscriptions').select('*, catalog_services(*), catalog_subscription_plans(*)').eq('id', id).maybeSingle()
  if (error) throw new Error(`Could not load subscription: ${error.message}`)
  return data as unknown as SubscriptionWithCatalogue | null
})

export const getAlerts = cache(async (): Promise<Alert[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(`Could not load alerts: ${error.message}`)
  return data ?? []
})

export const getPriceObservations = cache(async (catalogProductId: string): Promise<PriceObservation[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('price_observations').select('*').eq('catalog_product_id', catalogProductId).order('observed_at', { ascending: false }).limit(100)
  if (error) throw new Error(`Could not load price observations: ${error.message}`)
  return data ?? []
})

export const getSubscriptionPlanObservations = cache(async (serviceId: string, planId?: string): Promise<SubscriptionPlanObservation[]> => {
  const { supabase } = await requireAuthenticatedContext()
  let query = supabase.from('subscription_plan_observations').select('*').eq('catalog_service_id', serviceId).order('observed_at', { ascending: false }).limit(100)
  if (planId) query = query.eq('catalog_plan_id', planId)
  const { data, error } = await query
  if (error) throw new Error(`Could not load subscription observations: ${error.message}`)
  return data ?? []
})

export const getSubscriptionUsageEvents = cache(async (subscriptionId: string): Promise<SubscriptionUsageEvent[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('subscription_usage_events').select('*').eq('subscription_id', subscriptionId).order('occurred_at', { ascending: false }).limit(250)
  if (error) throw new Error(`Could not load usage events: ${error.message}`)
  return data ?? []
})

export const getFeaturedProducts = cache(async (): Promise<CatalogProduct[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('catalog_products').select('*').eq('is_featured', true).order('featured_rank', { ascending: true, nullsFirst: false }).limit(12)
  if (error) throw new Error(`Could not load featured products: ${error.message}`)
  return data ?? []
})

export const getCatalogueServices = cache(async (): Promise<CatalogService[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('catalog_services').select('*').order('name').limit(50)
  if (error) throw new Error(`Could not load subscription catalogue: ${error.message}`)
  return data ?? []
})

export const getCataloguePlans = cache(async (serviceId: string): Promise<CatalogSubscriptionPlan[]> => {
  const { supabase } = await requireAuthenticatedContext()
  const { data, error } = await supabase.from('catalog_subscription_plans').select('*').eq('service_id', serviceId).order('name').limit(50)
  if (error) throw new Error(`Could not load subscription plans: ${error.message}`)
  return data ?? []
})

export async function searchLocalCatalogue(query: string): Promise<CatalogProduct[]> {
  const { supabase } = await requireAuthenticatedContext()
  const normalized = normalizeCatalogueText(query)
  if (!normalized) return getFeaturedProducts()

  const [productMatches, aliasMatches, identifierMatches] = await Promise.all([
    supabase.from('catalog_products').select('*').ilike('identity_key', `%${normalized}%`).limit(30),
    supabase.from('catalog_product_aliases').select('catalog_product_id').ilike('normalized_alias', `%${normalized}%`).limit(30),
    supabase.from('catalog_product_identifiers').select('catalog_product_id').ilike('normalized_identifier', `%${normalized}%`).limit(30),
  ])
  if (productMatches.error) throw new Error(`Could not search product catalogue: ${productMatches.error.message}`)
  if (aliasMatches.error) throw new Error(`Could not search product aliases: ${aliasMatches.error.message}`)
  if (identifierMatches.error) throw new Error(`Could not search product identifiers: ${identifierMatches.error.message}`)

  const matchedIds = [...new Set([
    ...(aliasMatches.data ?? []).map((item) => item.catalog_product_id),
    ...(identifierMatches.data ?? []).map((item) => item.catalog_product_id),
  ])]
  const linkedProducts = matchedIds.length
    ? await supabase.from('catalog_products').select('*').in('id', matchedIds).limit(30)
    : { data: [], error: null }
  if (linkedProducts.error) throw new Error(`Could not load catalogue matches: ${linkedProducts.error.message}`)

  const products = [...(productMatches.data ?? []), ...(linkedProducts.data ?? [])] as CatalogProduct[]
  const uniqueProducts = [...new Map(products.map((product) => [product.id, product])).values()]
  return rankCatalogueMatches(uniqueProducts, normalized)
}

function rankCatalogueMatches(products: CatalogProduct[], normalized: string) {
  return [...products].sort((a, b) => scoreCatalogueMatch(b, normalized) - scoreCatalogueMatch(a, normalized))
}

function scoreCatalogueMatch(product: CatalogProduct, normalized: string) {
  const model = normalizeCatalogueText(product.model_number ?? '')
  const name = normalizeCatalogueText(product.name)
  const brand = normalizeCatalogueText(product.brand ?? '')
  if (model === normalized) return 100
  if (name === normalized) return 90
  if (brand === normalized) return 80
  if (model.startsWith(normalized)) return 70
  if (name.startsWith(normalized)) return 60
  return 40
}
