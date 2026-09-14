import Link from 'next/link'
import { ArrowRight, CalendarClock, CirclePlus, WalletCards } from 'lucide-react'
import { compareBaseline, formatMoney } from '@/features/afterprice/comparison'
import type { BaselineRecord } from '@/features/afterprice/types'
import { EmptyState, Panel, StatusBadge } from '@/components/dashboard/product-ui'

function dateLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'
}

function SubscriptionStatus({ record }: { record: BaselineRecord }) {
  const comparison = compareBaseline(record)
  if (comparison.kind === 'subscription_change') return <StatusBadge tone="warning">Plan changed</StatusBadge>
  if (comparison.kind === 'renewal_approaching') return <StatusBadge tone="accent">Renewal soon</StatusBadge>
  if (comparison.kind === 'no_observation') return <StatusBadge tone="neutral">Waiting for evidence</StatusBadge>
  return <StatusBadge tone="success">Monitoring</StatusBadge>
}

export function SubscriptionList({ records }: { records: BaselineRecord[] }) {
  if (!records.length) return <EmptyState title="No subscriptions yet" description="Add a subscription to see renewal dates, plan changes and transparent cost information in one place." action={<Link href="/app/add?type=subscription" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add subscription</Link>} />
  return <div className="grid gap-4 lg:grid-cols-2">{records.map(record => { const comparison = compareBaseline(record); const observation = comparison.latestObservation; return <Panel key={record.id} className="flex min-w-0 flex-col"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--surface-subtle))] text-accent"><WalletCards className="h-5 w-5" /></span><div className="min-w-0"><h3 className="truncate font-display text-xl font-extrabold tracking-[-0.02em]">{record.display_name}</h3><p className="mt-1 truncate text-sm text-[hsl(var(--foreground-secondary))]">{record.plan_name ?? record.entities.variant ?? 'Plan not recorded'} · {record.entities.provider}</p></div></div><SubscriptionStatus record={record} /></div><div className="mt-6 grid grid-cols-2 gap-3 rounded-input bg-[hsl(var(--surface-subtle))] p-3 sm:grid-cols-3"><div><p className="text-xs text-[hsl(var(--foreground-secondary))]">Saved price</p><p className="mt-1 text-lg font-extrabold tabular-nums">{formatMoney(record.original_amount_cents)}</p></div><div><p className="text-xs text-[hsl(var(--foreground-secondary))]">Latest</p><p className="mt-1 text-lg font-extrabold tabular-nums">{comparison.currentAmountCents === null ? '—' : formatMoney(comparison.currentAmountCents)}</p></div><div className="col-span-2 sm:col-span-1"><p className="text-xs text-[hsl(var(--foreground-secondary))]">Billing</p><p className="mt-1 text-sm font-bold capitalize">{record.billing_interval ?? 'Not set'}</p></div></div><dl className="mt-5 space-y-3 text-sm"><div className="flex items-center justify-between gap-4 border-b border-border pb-3"><dt className="flex items-center gap-2 text-[hsl(var(--foreground-secondary))]"><CalendarClock className="h-4 w-4" />Next renewal</dt><dd className="font-bold">{dateLabel(record.renewal_at)}</dd></div><div className="flex items-center justify-between gap-4"><dt className="text-[hsl(var(--foreground-secondary))]">Last checked</dt><dd className="font-semibold">{observation ? dateLabel(observation.observed_at) : 'Not checked'}</dd></div></dl><Link href={`/app/baselines/${record.id}`} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-input border border-border text-sm font-bold text-accent hover:bg-[hsl(var(--accent-soft))]">Open subscription <ArrowRight className="h-4 w-4" /></Link></Panel> })}</div>
}
