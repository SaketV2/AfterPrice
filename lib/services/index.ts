import type { Alert, AlertType, BillingCycle, PlanSnapshot, SpendGuardData, Subscription, TrackedItem } from '@/lib/types'

export const currency = (amount: number, currencyCode = 'AUD') => new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: currencyCode,
  maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
}).format(amount)

export const shortDate = (value: string) => new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date(value))

export const relativeDate = (value: string) => {
  const days = Math.round((new Date().getTime() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate(value)
}

export const daysUntil = (value: string) => Math.ceil((new Date(value).getTime() - new Date().getTime()) / 86400000)

export const annualisedPrice = (price: number, cycle: BillingCycle) => {
  const multiplier: Record<BillingCycle, number> = { weekly: 52, monthly: 12, quarterly: 4, annual: 1 }
  return price * multiplier[cycle]
}

export const formatBillingCycle = (cycle: BillingCycle) => {
  const labels: Record<BillingCycle, string> = { weekly: 'week', monthly: 'month', quarterly: 'quarter', annual: 'year' }
  return labels[cycle]
}

export const getActiveAlerts = (alerts: Alert[]) => alerts.filter((alert) => !alert.dismissed && !alert.resolved)

export const getPotentialSavings = (data: SpendGuardData) => data.potentialSavings
  .filter((saving) => saving.status === 'open')
  .reduce((total, saving) => total + saving.amount, 0)

export const getAnnualPotentialSavings = (data: SpendGuardData) => data.potentialSavings
  .filter((saving) => saving.status === 'open')
  .reduce((total, saving) => total + (saving.period === 'one_off' ? saving.amount : saving.amount), 0)

export const getItem = (data: SpendGuardData, itemId: string | undefined) => data.items.find((item) => item.id === itemId)

export const getSnapshotsForItem = (data: SpendGuardData, itemId: string) => data.priceSnapshots
  .filter((snapshot) => snapshot.itemId === itemId)
  .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())

export const getPlansForItem = (data: SpendGuardData, itemId: string) => data.planSnapshots
  .filter((snapshot) => snapshot.itemId === itemId)
  .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())

export const getRenewalForItem = (data: SpendGuardData, itemId: string) => data.renewals.find((renewal) => renewal.itemId === itemId)

export const filterItems = (items: TrackedItem[], query: string, type?: TrackedItem['type']) => {
  const search = query.trim().toLowerCase()
  return items.filter((item) => {
    if (type && item.type !== type) return false
    if (!search) return true
    const haystack = [item.title, item.subtitle, item.purchase?.retailer, item.subscription?.provider, item.subscription?.plan].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(search)
  })
}

export const filterAlerts = (alerts: Alert[], query: string, type?: AlertType | 'all') => {
  const search = query.trim().toLowerCase()
  return alerts.filter((alert) => {
    if (type && type !== 'all' && alert.type !== type) return false
    if (!search) return true
    return `${alert.title} ${alert.description}`.toLowerCase().includes(search)
  })
}

export const percentChange = (from: number, to: number) => from === 0 ? 0 : ((to - from) / from) * 100

export const getStatusLabel = (status: TrackedItem['status']) => ({
  watching: 'Monitoring',
  action_available: 'Needs review',
  stable: 'Stable',
  expired: 'Expired',
  resolved: 'Resolved',
  price_increase: 'Price increased',
  plan_changed: 'Plan changed',
  renewing_soon: 'Renewal soon',
  cancelled: 'Cancelled',
}[status])

export const getAlertTypeLabel = (type: AlertType) => ({
  price_drop: 'Price drop',
  price_increase: 'Price increase',
  plan_change: 'Plan changed',
  renewal_warning: 'Renewal soon',
}[type])

export const getSubscriptionStatusLabel = (status: Subscription['status']) => ({
  stable: 'Stable',
  price_increase: 'Price increased',
  plan_changed: 'Plan changed',
  renewing_soon: 'Renewing soon',
  cancelled: 'Cancelled',
}[status])

export const latestPlanPair = (plans: PlanSnapshot[]) => ({
  original: plans.find((plan) => plan.label === 'Original plan') ?? plans[0],
  current: [...plans].reverse().find((plan) => plan.label === 'Current plan') ?? plans[plans.length - 1],
})
