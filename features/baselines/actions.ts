'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type BaselineState = { error?: string }

const optionalUrl = z.union([z.literal(''), z.string().url().refine(value => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS URL.')])
const dateValue = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.')

const schema = z.object({
  baseline_type: z.enum(['purchase', 'subscription']),
  entity_id: z.string().uuid().optional().or(z.literal('')),
  provider: z.string().trim().min(1).max(160),
  display_name: z.string().trim().min(1).max(240),
  brand: z.string().trim().max(100).optional(),
  variant: z.string().trim().max(100).optional(),
  size_label: z.string().trim().max(100).optional(),
  amount: z.coerce.number().finite().min(0).max(100_000_000),
  captured_at: dateValue,
  plan_name: z.string().trim().max(160).optional(),
  billing_interval: z.enum(['weekly', 'monthly', 'quarterly', 'annual', 'one_off']).optional(),
  renewal_at: z.union([z.literal(''), dateValue]).optional(),
  return_deadline: z.union([z.literal(''), dateValue]).optional(),
  return_deadline_source: z.enum(['user_confirmed', 'estimated', 'retailer_policy', 'unknown']).optional(),
  source_url: optionalUrl,
}).superRefine((value, context) => {
  if (value.baseline_type === 'subscription' && !value.billing_interval) context.addIssue({ code: 'custom', path: ['billing_interval'], message: 'Choose a billing interval.' })
  if (value.renewal_at && value.renewal_at < value.captured_at) context.addIssue({ code: 'custom', path: ['renewal_at'], message: 'The renewal date cannot be before the start date.' })
  if (value.return_deadline && value.return_deadline < value.captured_at) context.addIssue({ code: 'custom', path: ['return_deadline'], message: 'The return deadline cannot be before the purchase date.' })
})

export async function createBaseline(_: BaselineState, formData: FormData): Promise<BaselineState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the item details.' }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = typeof auth?.claims?.sub === 'string' ? auth.claims.sub : null
  if (!userId) return { error: 'Your session has expired. Log in and try again.' }
  const input = parsed.data

  if (input.baseline_type === 'purchase') {
    let catalogProductId: string | null = null
    if (input.entity_id) {
      const { data: product, error } = await supabase.from('catalog_products').select('id').eq('id', input.entity_id).maybeSingle()
      if (error || !product) return { error: 'The selected product is no longer available. Search again.' }
      catalogProductId = product.id
    }
    const { data: purchase, error } = await supabase.from('purchases').insert({
      catalog_product_id: catalogProductId,
      custom_product_name: catalogProductId ? null : input.display_name,
      retailer_name: input.provider,
      paid_amount_cents: Math.round(input.amount * 100),
      currency: 'AUD',
      purchase_date: input.captured_at,
      return_deadline: input.return_deadline || null,
      return_deadline_source: input.return_deadline_source ?? 'unknown',
      purchase_url: input.source_url || null,
    }).select('id').single()
    if (error || !purchase) return { error: 'The purchase could not be saved. Try again.' }
    revalidatePath('/app', 'layout')
    redirect(`/app/baselines/${purchase.id}?saved=1`)
  }

  let catalogServiceId: string | null = null
  let manageUrl = input.source_url || null
  let catalogPlanId: string | null = null
  if (input.entity_id) {
    const { data: service, error } = await supabase.from('catalog_services').select('id, manage_url').eq('id', input.entity_id).maybeSingle()
    if (error || !service) return { error: 'The selected service is no longer available. Search again.' }
    catalogServiceId = service.id
    manageUrl ||= service.manage_url
    if (input.plan_name) {
      const { data: plan } = await supabase.from('catalog_subscription_plans').select('id').eq('service_id', service.id).ilike('name', input.plan_name).maybeSingle()
      catalogPlanId = plan?.id ?? null
    }
  }
  const { data: subscription, error } = await supabase.from('subscriptions').insert({
    catalog_service_id: catalogServiceId,
    catalog_plan_id: catalogPlanId,
    custom_service_name: catalogServiceId ? null : input.display_name,
    amount_cents: Math.round(input.amount * 100),
    currency: 'AUD',
    billing_cadence: input.billing_interval ?? 'monthly',
    start_date: input.captured_at,
    renewal_date: input.renewal_at || null,
    manage_url: manageUrl,
  }).select('id').single()
  if (error || !subscription) return { error: 'The subscription could not be saved. Try again.' }
  revalidatePath('/app', 'layout')
  redirect(`/app/baselines/${subscription.id}?saved=1`)
}

export async function deleteBaseline(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get('id'))
  if (!id.success) return
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (typeof auth?.claims?.sub !== 'string') return
  const purchase = await supabase.from('purchases').select('id').eq('id', id.data).maybeSingle()
  if (purchase.data) await supabase.from('purchases').delete().eq('id', id.data)
  else await supabase.from('subscriptions').delete().eq('id', id.data)
  revalidatePath('/app', 'layout')
  redirect('/app')
}
