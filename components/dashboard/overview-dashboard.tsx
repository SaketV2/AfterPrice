import Link from 'next/link'
import { ArrowRight, BellRing, CirclePlus, ShoppingBag, WalletCards } from 'lucide-react'
import { compareBaseline, formatMoney } from '@/features/afterprice/comparison'
import type { BaselineRecord } from '@/features/afterprice/types'
import { EmptyState, PageIntro, Panel, StatusBadge } from '@/components/dashboard/product-ui'

type AttentionItem = { record: BaselineRecord; title: string; detail: string; tone: 'success' | 'warning' | 'danger' | 'accent'; amount: number | null }
type HistoryPoint = { date: string; label: string; amount: number }

function dateLabel(value: string | null | undefined) {
  if (!value) return 'Date not set'
  return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function daysUntil(value: string | null | undefined) {
  if (!value) return null
  return Math.ceil((Date.parse(value) - Date.now()) / 86_400_000)
}

function getAttention(records: BaselineRecord[]): AttentionItem[] {
  return records.map(record => {
    const comparison = compareBaseline(record)
    if (comparison.kind === 'price_decrease') return { record, title: 'Price drop detected', detail: `${record.display_name} is ${formatMoney(Math.abs(comparison.amountDeltaCents ?? 0))} below your baseline.`, tone: 'success', amount: Math.abs(comparison.amountDeltaCents ?? 0) }
    if (comparison.kind === 'price_increase') return { record, title: 'Price increased', detail: `${record.display_name} is now ${formatMoney(Math.abs(comparison.amountDeltaCents ?? 0))} higher than your baseline.`, tone: 'warning', amount: null }
    if (comparison.kind === 'subscription_change') return { record, title: 'Subscription changed', detail: `${record.display_name} has a different price, plan or billing interval than the saved baseline.`, tone: 'danger', amount: null }
    if (comparison.kind === 'renewal_approaching') return { record, title: 'Renewal approaching', detail: `${record.display_name} renews on ${dateLabel(record.renewal_at)}.`, tone: 'accent', amount: null }
    return null
  }).filter((item): item is AttentionItem => item !== null).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
}

function getHistory(records: BaselineRecord[]): HistoryPoint[] {
  return records.flatMap(record => (record.entities.observations ?? []).flatMap(observation => {
    if (record.baseline_type !== 'purchase' || observation.observation_type !== 'price' || observation.amount_cents === null) return []
    const amount = record.original_amount_cents - observation.amount_cents
    if (amount <= 0) return []
    return [{ date: observation.observed_at, label: `${record.display_name} · ${dateLabel(observation.observed_at)}`, amount }]
  })).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).slice(-8)
}

function Stat({ label, value, helper, tone = 'default' }: { label: string; value: string | number; helper: string; tone?: 'default' | 'success' | 'warning' }) {
  const valueClass = tone === 'success' ? 'text-[hsl(var(--success))]' : tone === 'warning' ? 'text-[hsl(var(--warning))]' : 'text-foreground'
  return <div className="border-b border-border px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]">{label}</p><p className={`mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] ${valueClass}`}>{value}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--foreground-muted))]">{helper}</p></div>
}

function SavingsChart({ points }: { points: HistoryPoint[] }) {
  if (!points.length) return <EmptyState className="min-h-48 border-0 bg-transparent" title="No price history yet" description="Add a purchase and a compatible observation will appear here when AfterPrice has something real to compare." action={<Link href="/app/add?type=purchase" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add purchase</Link>} />
  const max = Math.max(...points.map(point => point.amount), 1)
  return <div role="img" aria-label="Potential savings recorded from compatible purchase observations" className="min-w-0">
    <div className="relative h-56 border-b border-border pt-5">
      <div className="pointer-events-none absolute inset-x-0 top-8 border-t border-dashed border-border" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 border-t border-dashed border-border" />
      <div className="relative flex h-full items-end gap-2 px-1 sm:gap-3">
        {points.map(point => <div key={`${point.date}-${point.label}`} className="flex min-w-0 flex-1 items-end justify-center"><div className="group relative w-full max-w-12 rounded-t-lg bg-[hsl(var(--accent)/.72)] transition-colors hover:bg-accent" style={{ height: `${Math.max(14, (point.amount / max) * 100)}%` }}><span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[hsl(var(--surface-dark))] px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft group-hover:block">{formatMoney(point.amount)} potential</span></div></div>)}
      </div>
    </div>
    <div className="mt-3 flex justify-between gap-3 text-xs text-[hsl(var(--foreground-muted))]"><span>{dateLabel(points[0].date)}</span><span>{points.length === 1 ? 'One recorded comparison' : `${points.length} recorded comparisons`}</span><span>{dateLabel(points[points.length - 1].date)}</span></div>
    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">Potential amount is calculated from stored post-purchase observations. It is not a confirmed refund.</p>
  </div>
}

function AttentionList({ items }: { items: AttentionItem[] }) {
  if (!items.length) return <EmptyState className="min-h-48 border-0 bg-transparent" title="Nothing needs attention" description="Price drops, plan changes and time-sensitive renewals will appear here after real data is recorded." action={<Link href="/app/add" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent hover:underline"><CirclePlus className="h-4 w-4" />Add an item</Link>} />
  return <ul className="divide-y divide-border">{items.slice(0, 4).map(item => <li key={item.record.id} className="py-4 first:pt-0 last:pb-0"><Link href={`/app/baselines/${item.record.id}`} className="group flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]"><BellRing className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-bold group-hover:text-accent">{item.record.display_name}</span><StatusBadge tone={item.tone}>{item.title}</StatusBadge></span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--foreground-secondary))]">{item.detail}</span></span><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--foreground-muted))] transition-transform group-hover:translate-x-0.5 group-hover:text-accent" /></Link></li>)}</ul>
}

export function OverviewDashboard({ records }: { records: BaselineRecord[] }) {
  const attention = getAttention(records)
  const history = getHistory(records)
  const potential = attention.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  const openOpportunities = attention.filter(item => item.tone === 'success' || item.tone === 'danger').length
  const renewalCount = records.filter(record => record.baseline_type === 'subscription' && (daysUntil(record.renewal_at) ?? 999) >= 0 && (daysUntil(record.renewal_at) ?? 999) <= 30).length
  const subscriptionSpend = records.filter(record => record.baseline_type === 'subscription').reduce((sum, record) => sum + (record.billing_interval === 'annual' ? record.original_amount_cents / 12 : record.original_amount_cents), 0)
  const renewals = records.filter(record => record.baseline_type === 'subscription' && record.renewal_at).sort((a, b) => Date.parse(a.renewal_at ?? '') - Date.parse(b.renewal_at ?? '')).slice(0, 4)

  return <>
    <PageIntro title="See what changed after you bought." description="AfterPrice keeps your baseline beside later observations so the next useful action is clear." action={<Link href="/app/add" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add item</Link>} />

    <section aria-label="Overview summary" className="overflow-hidden rounded-dashboard border border-border bg-surface shadow-soft"><div className="grid sm:grid-cols-2 xl:grid-cols-4"><Stat label="Potential savings" value={formatMoney(potential)} helper="Open price-drop opportunities" tone="success" /><Stat label="Open opportunities" value={openOpportunities} helper="Changes needing a decision" tone="warning" /><Stat label="Renewals soon" value={renewalCount} helper="Within the next 30 days" /><Stat label="Monthly subscription spend" value={formatMoney(subscriptionSpend)} helper={records.some(record => record.baseline_type === 'subscription') ? 'Based on saved billing intervals' : 'Add a subscription to calculate'} /></div></section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
      <Panel><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">Potential savings over time</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Only stored post-purchase observations are included.</p></div><StatusBadge tone="accent">{records.length} {records.length === 1 ? 'item' : 'items'} monitored</StatusBadge></div><div className="mt-6"><SavingsChart points={history} /></div></Panel>
      <Panel><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">Needs attention</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">The records worth opening first.</p></div><Link href="/app/alerts" className="text-sm font-bold text-accent hover:underline">View all</Link></div><div className="mt-6"><AttentionList items={attention} /></div></Panel>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Panel><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">Upcoming renewals</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Keep recurring charges visible before they arrive.</p></div><WalletCards className="h-5 w-5 text-accent" /></div>{renewals.length ? <ul className="mt-5 divide-y divide-border">{renewals.map(record => <li key={record.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-bold">{record.display_name}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-secondary))]">{dateLabel(record.renewal_at)} · {record.billing_interval ?? 'Billing interval not set'}</p></div><p className="shrink-0 text-sm font-bold tabular-nums">{formatMoney(record.original_amount_cents)}</p></li>)}</ul> : <div className="mt-5"><EmptyState className="min-h-40 border-0 bg-transparent" title="No renewals recorded" description="Add a subscription with its next renewal date to see it here." action={<Link href="/app/add?type=subscription" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent hover:underline"><CirclePlus className="h-4 w-4" />Add subscription</Link>} /></div>}</Panel>
      <Panel><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-xl font-extrabold tracking-[-0.02em]">Recent changes</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">The latest evidence attached to your records.</p></div><ShoppingBag className="h-5 w-5 text-accent" /></div>{attention.length ? <ul className="mt-5 divide-y divide-border">{attention.slice(0, 4).map(item => <li key={item.record.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-bold">{item.record.display_name}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">{item.detail}</p></div><span className="shrink-0 text-xs font-semibold text-[hsl(var(--foreground-muted))]">{dateLabel(item.record.updated_at)}</span></li>)}</ul> : <div className="mt-5"><EmptyState className="min-h-40 border-0 bg-transparent" title="No changes recorded" description="AfterPrice will show a change here when a stored observation differs from your baseline." /></div>}</Panel>
    </div>
  </>
}
