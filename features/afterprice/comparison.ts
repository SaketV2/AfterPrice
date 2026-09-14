import type { BaselineRecord, Comparison, ComparisonKind, Observation, PriceObservation, ProductComparison, Purchase, Subscription, SubscriptionComparison, SubscriptionPlanObservation } from './types'

export function latestObservation(observations: Observation[], type?: Observation['observation_type']) {
  return observations.filter(item => !type || item.observation_type === type).sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0] ?? null
}

export function compareBaseline(record: BaselineRecord, now = new Date()): Comparison {
  const observations = record.entities.observations ?? []
  if (record.baseline_type === 'purchase') {
    const current = latestObservation(observations, 'price')
    if (!current || current.amount_cents === null) return make('no_observation', 'No current comparison available', ['No compatible price observation has been stored for this exact product variant and size.'], null, null, null)
    const delta = current.amount_cents - record.original_amount_cents
    const kind = delta > 0 ? 'price_increase' : delta < 0 ? 'price_decrease' : 'unchanged'
    const headline = delta > 0 ? 'Current price is higher' : delta < 0 ? 'Current price is lower' : 'Price is unchanged'
    return make(kind, headline, [delta === 0 ? 'The stored observation matches your baseline.' : `The price changed by ${formatMoney(Math.abs(delta))}.`], current.amount_cents, delta, current)
  }

  const plan = latestObservation(observations, 'plan')
  const renewal = latestObservation(observations, 'renewal')
  const current = [plan, renewal].filter(Boolean).sort((a, b) => Date.parse(b!.observed_at) - Date.parse(a!.observed_at))[0] ?? null
  if (!current) return make('no_observation', 'No current comparison available', ['No plan or renewal observation has been stored for this subscription.'], null, null, null)
  const details: string[] = []
  const terms = plan ?? renewal
  if (terms?.amount_cents !== null && terms?.amount_cents !== undefined && terms.amount_cents !== record.original_amount_cents) details.push(`Price changed by ${formatMoney(Math.abs(terms.amount_cents - record.original_amount_cents))} per ${terms.billing_interval ?? record.billing_interval ?? 'billing cycle'}.`)
  if (plan?.plan_name && plan.plan_name !== record.plan_name) details.push(`Plan changed from ${record.plan_name ?? 'the saved plan'} to ${plan.plan_name}.`)
  if (plan?.billing_interval && plan.billing_interval !== record.billing_interval) details.push(`Billing interval changed from ${record.billing_interval} to ${plan.billing_interval}.`)
  const renewalAt = renewal?.renewal_at ?? record.renewal_at
  if (renewal?.renewal_at && record.renewal_at && renewal.renewal_at !== record.renewal_at) details.push(`Renewal changed from ${new Date(record.renewal_at).toLocaleDateString('en-AU')} to ${new Date(renewal.renewal_at).toLocaleDateString('en-AU')}.`)
  const days = renewalAt ? Math.ceil((Date.parse(renewalAt) - now.getTime()) / 86_400_000) : null
  if (days !== null && days >= 0 && days <= 30) details.push(`Renewal is in ${days} day${days === 1 ? '' : 's'}.`)
  const changed = details.some(detail => detail.startsWith('Price') || detail.startsWith('Plan') || detail.startsWith('Billing'))
  const kind = changed ? 'subscription_change' : days !== null && days >= 0 && days <= 30 ? 'renewal_approaching' : 'unchanged'
  const currentAmount = terms?.amount_cents ?? null
  return make(kind, changed ? 'Subscription terms changed' : kind === 'renewal_approaching' ? 'Renewal is approaching' : 'Subscription is unchanged', details.length ? details : ['The latest stored observation matches your baseline.'], currentAmount, currentAmount === null ? null : currentAmount - record.original_amount_cents, current)
}

function make(kind: Comparison['kind'], headline: string, details: string[], currentAmountCents: number | null, amountDeltaCents: number | null, latest: Observation | null): Comparison {
  return { kind, headline, details, currentAmountCents, amountDeltaCents, latestObservation: latest, nextAction: nextAction(kind, Boolean(latest?.source_url)) }
}

function nextAction(kind: ComparisonKind, hasSourceUrl = false) {
  if (kind === 'price_decrease') return { category: 'claim' as const, label: hasSourceUrl ? 'Review the current source and the retailer’s price-adjustment or returns policy.' : 'Review the retailer’s current price-adjustment or returns policy.' }
  if (kind === 'price_increase') return { category: 'keep' as const, label: 'No action required unless you plan to buy this item again.' }
  if (kind === 'subscription_change') return { category: 'review' as const, label: 'Review the updated price or plan before the next renewal.' }
  if (kind === 'renewal_approaching') return { category: 'review' as const, label: 'Review the subscription before the renewal date.' }
  if (kind === 'no_observation') return { category: 'keep' as const, label: 'Keep the baseline. No current comparison is available yet.' }
  return { category: 'keep' as const, label: 'No action required.' }
}

export function formatMoney(cents: number, currency = 'AUD') { return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(cents / 100) }

export function comparePurchase(purchase: Purchase, observations: PriceObservation[], now = new Date()): ProductComparison {
  const latest = observations
    .filter((observation) => Date.parse(observation.observed_at) > Date.parse(`${purchase.purchase_date}T00:00:00.000Z`))
    .sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0] ?? null
  const returnWindow = getReturnWindow(purchase, now)
  if (!latest) return { state: 'no_observation', paidAmountCents: purchase.paid_amount_cents, currentPriceCents: null, potentialSavingCents: 0, returnWindow, observation: null }
  const potentialSavingCents = Math.max(0, purchase.paid_amount_cents - latest.observed_price_cents)
  const state = latest.observed_price_cents < purchase.paid_amount_cents ? 'price_drop' : latest.observed_price_cents > purchase.paid_amount_cents ? 'price_increase' : 'unchanged'
  return { state, paidAmountCents: purchase.paid_amount_cents, currentPriceCents: latest.observed_price_cents, potentialSavingCents, returnWindow, observation: latest }
}

export function getReturnWindow(purchase: Purchase, now = new Date()): ProductComparison['returnWindow'] {
  if (!purchase.return_deadline) return 'uncertain'
  const deadline = Date.parse(`${purchase.return_deadline}T23:59:59.999Z`)
  return deadline >= now.getTime() ? 'active' : 'expired'
}

export function compareSubscription(subscription: Subscription, observations: SubscriptionPlanObservation[], now = new Date()): SubscriptionComparison {
  const latest = [...observations].sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0] ?? null
  const daysToRenewal = subscription.renewal_date ? Math.ceil((Date.parse(`${subscription.renewal_date}T00:00:00.000Z`) - now.getTime()) / 86_400_000) : null
  if (!latest) return { state: daysToRenewal !== null && daysToRenewal >= 0 && daysToRenewal <= 30 ? 'renewal_approaching' : 'no_observation', amountDeltaCents: null, daysToRenewal, observation: null }
  const amountDeltaCents = latest.price_cents === null ? null : latest.price_cents - subscription.amount_cents
  const planChanged = latest.cadence !== null && latest.cadence !== subscription.billing_cadence
  const state = planChanged ? 'plan_change' : amountDeltaCents !== null && amountDeltaCents > 0 ? 'price_increase' : daysToRenewal !== null && daysToRenewal >= 0 && daysToRenewal <= 30 ? 'renewal_approaching' : 'unchanged'
  return { state, amountDeltaCents, daysToRenewal, observation: latest }
}
