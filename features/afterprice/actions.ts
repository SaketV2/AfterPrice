'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedContext } from '@/lib/supabase/server'

export type AfterPriceActionState = { error?: string; message?: string; id?: string }

const optionalUrl = z.union([
  z.literal(''),
  z.string().url().refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS URL.'),
])
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, 'Use a three-letter currency code.')

const purchaseSchema = z.object({
  catalog_product_id: z.string().uuid().optional().or(z.literal('')),
  custom_product_name: z.string().trim().max(240).optional(),
  retailer_name: z.string().trim().min(1).max(160),
  paid_amount: z.coerce.number().finite().min(0).max(100_000_000),
  currency,
  purchase_date: dateString,
  return_deadline: dateString.optional().or(z.literal('')),
  return_deadline_source: z.enum(['user_confirmed', 'estimated', 'retailer_policy', 'unknown']),
  purchase_url: optionalUrl,
}).superRefine((input, context) => {
  if (!input.catalog_product_id && !input.custom_product_name) {
    context.addIssue({ code: 'custom', path: ['custom_product_name'], message: 'Choose a catalogue product or enter a product name.' })
  }
  if (input.return_deadline && input.return_deadline < input.purchase_date) {
    context.addIssue({ code: 'custom', path: ['return_deadline'], message: 'The return deadline cannot be before the purchase date.' })
  }
})

const subscriptionSchema = z.object({
  catalog_service_id: z.string().uuid().optional().or(z.literal('')),
  catalog_plan_id: z.string().uuid().optional().or(z.literal('')),
  custom_service_name: z.string().trim().max(160).optional(),
  amount: z.coerce.number().finite().min(0).max(100_000_000),
  currency,
  billing_cadence: z.enum(['weekly', 'monthly', 'quarterly', 'annual', 'one_off']),
  start_date: dateString,
  renewal_date: dateString.optional().or(z.literal('')),
  trial_end: dateString.optional().or(z.literal('')),
  promo_end: dateString.optional().or(z.literal('')),
  manage_url: optionalUrl,
}).superRefine((input, context) => {
  if (!input.catalog_service_id && !input.custom_service_name) {
    context.addIssue({ code: 'custom', path: ['custom_service_name'], message: 'Choose a catalogue service or enter a service name.' })
  }
  for (const field of ['renewal_date', 'trial_end', 'promo_end'] as const) {
    if (input[field] && input[field] < input.start_date) {
      context.addIssue({ code: 'custom', path: [field], message: 'Dates cannot be before the start date.' })
    }
  }
})

type AuthenticatedContext = Awaited<ReturnType<typeof getAuthenticatedContext>> & { userId: string }

async function authenticated(): Promise<AuthenticatedContext | null> {
  const context = await getAuthenticatedContext()
  if (!context.userId) return null
  return context as AuthenticatedContext
}

export async function createPurchase(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const parsed = purchaseSchema.safeParse({
    catalog_product_id: formData.get('catalog_product_id') || '',
    custom_product_name: formData.get('custom_product_name') || '',
    retailer_name: formData.get('retailer_name'),
    paid_amount: formData.get('paid_amount'),
    currency: formData.get('currency') || 'AUD',
    purchase_date: formData.get('purchase_date'),
    return_deadline: formData.get('return_deadline') || '',
    return_deadline_source: formData.get('return_deadline_source') || 'unknown',
    purchase_url: formData.get('purchase_url') || '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the purchase details.' }

  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const input = parsed.data

  if (input.catalog_product_id) {
    const { data: product, error } = await context.supabase.from('catalog_products').select('id').eq('id', input.catalog_product_id).maybeSingle()
    if (error || !product) return { error: 'That catalogue product is no longer available. Search again and choose a current match.' }
  }

  const { data, error } = await context.supabase.from('purchases').insert({
    catalog_product_id: input.catalog_product_id || null,
    custom_product_name: input.custom_product_name || null,
    retailer_name: input.retailer_name,
    paid_amount_cents: Math.round(input.paid_amount * 100),
    currency: input.currency,
    purchase_date: input.purchase_date,
    return_deadline: input.return_deadline || null,
    return_deadline_source: input.return_deadline_source,
    purchase_url: input.purchase_url || null,
  }).select('id').single()
  if (error || !data) return { error: 'The purchase could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  return { message: 'Purchase saved.', id: data.id }
}

export async function createSubscription(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const parsed = subscriptionSchema.safeParse({
    catalog_service_id: formData.get('catalog_service_id') || '',
    catalog_plan_id: formData.get('catalog_plan_id') || '',
    custom_service_name: formData.get('custom_service_name') || '',
    amount: formData.get('amount'),
    currency: formData.get('currency') || 'AUD',
    billing_cadence: formData.get('billing_cadence'),
    start_date: formData.get('start_date'),
    renewal_date: formData.get('renewal_date') || '',
    trial_end: formData.get('trial_end') || '',
    promo_end: formData.get('promo_end') || '',
    manage_url: formData.get('manage_url') || '',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the subscription details.' }

  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const input = parsed.data
  let manageUrl = input.manage_url || null

  if (input.catalog_service_id) {
    const { data: service, error } = await context.supabase.from('catalog_services').select('id, manage_url').eq('id', input.catalog_service_id).maybeSingle()
    if (error || !service) return { error: 'That catalogue service is no longer available. Search again and choose a current match.' }
    manageUrl ||= service.manage_url
  }

  if (input.catalog_plan_id) {
    const { data: plan, error } = await context.supabase.from('catalog_subscription_plans').select('id, service_id').eq('id', input.catalog_plan_id).maybeSingle()
    if (error || !plan || (input.catalog_service_id && plan.service_id !== input.catalog_service_id)) return { error: 'The selected subscription plan does not match the selected service.' }
  }

  const { data, error } = await context.supabase.from('subscriptions').insert({
    catalog_service_id: input.catalog_service_id || null,
    catalog_plan_id: input.catalog_plan_id || null,
    custom_service_name: input.custom_service_name || null,
    amount_cents: Math.round(input.amount * 100),
    currency: input.currency,
    billing_cadence: input.billing_cadence,
    start_date: input.start_date,
    renewal_date: input.renewal_date || null,
    trial_end: input.trial_end || null,
    promo_end: input.promo_end || null,
    manage_url: manageUrl,
  }).select('id').single()
  if (error || !data) return { error: 'The subscription could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  return { message: 'Subscription saved.', id: data.id }
}

export async function recordUsageEvent(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const parsed = z.object({
    subscription_id: z.string().uuid(),
    usage_type: z.string().trim().min(1).max(80),
    quantity: z.coerce.number().finite().min(0).max(100_000_000).optional(),
    occurred_at: z.string().datetime({ offset: true }),
  }).safeParse({
    subscription_id: formData.get('subscription_id'),
    usage_type: formData.get('usage_type'),
    quantity: formData.get('quantity') || undefined,
    occurred_at: formData.get('occurred_at'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the usage event.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { data: subscription } = await context.supabase.from('subscriptions').select('id').eq('id', parsed.data.subscription_id).maybeSingle()
  if (!subscription) return { error: 'That subscription does not belong to your account.' }
  const { error } = await context.supabase.from('subscription_usage_events').insert({ subscription_id: parsed.data.subscription_id, usage_type: parsed.data.usage_type, quantity: parsed.data.quantity ?? null, occurred_at: parsed.data.occurred_at })
  if (error) return { error: 'The usage event could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  return { message: 'Usage recorded.' }
}

export async function updatePreferences(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const parsed = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    notify_price_drops: z.coerce.boolean(),
    notify_plan_changes: z.coerce.boolean(),
    notify_renewals: z.coerce.boolean(),
    notify_weekly_summary: z.coerce.boolean(),
  }).safeParse({
    theme: formData.get('theme'),
    notify_price_drops: formData.get('notify_price_drops') === 'true',
    notify_plan_changes: formData.get('notify_plan_changes') === 'true',
    notify_renewals: formData.get('notify_renewals') === 'true',
    notify_weekly_summary: formData.get('notify_weekly_summary') === 'true',
  })
  if (!parsed.success) return { error: 'Check the preference values.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { error } = await context.supabase.from('user_preferences').upsert({ user_id: context.userId, ...parsed.data }, { onConflict: 'user_id' })
  if (error) return { error: 'Your preferences could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  return { message: 'Preferences saved.' }
}

export async function updateProfile(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const displayName = z.string().trim().min(1).max(80).safeParse(formData.get('display_name'))
  if (!displayName.success) return { error: 'Enter a display name between 1 and 80 characters.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { error } = await context.supabase.from('profiles').update({ display_name: displayName.data }).eq('id', context.userId)
  if (error) return { error: 'Your profile could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  return { message: 'Profile saved.' }
}

export async function markAlertRead(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const id = z.string().uuid().safeParse(formData.get('id'))
  if (!id.success) return { error: 'That alert is invalid.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { error } = await context.supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id.data)
  if (error) return { error: 'The alert could not be updated.' }
  revalidatePath('/app', 'layout')
  return { message: 'Alert marked as read.' }
}

export async function deletePurchase(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const id = z.string().uuid().safeParse(formData.get('id'))
  if (!id.success) return { error: 'That purchase is invalid.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { error } = await context.supabase.from('purchases').delete().eq('id', id.data)
  if (error) return { error: 'The purchase could not be deleted.' }
  revalidatePath('/app', 'layout')
  return { message: 'Purchase deleted.' }
}

export async function deleteSubscription(_: AfterPriceActionState, formData: FormData): Promise<AfterPriceActionState> {
  const id = z.string().uuid().safeParse(formData.get('id'))
  if (!id.success) return { error: 'That subscription is invalid.' }
  const context = await authenticated()
  if (!context) return { error: 'Your session has expired. Log in and try again.' }
  const { error } = await context.supabase.from('subscriptions').delete().eq('id', id.data)
  if (error) return { error: 'The subscription could not be deleted.' }
  revalidatePath('/app', 'layout')
  return { message: 'Subscription deleted.' }
}
