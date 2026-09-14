import Link from 'next/link'
import { ArrowRight, BellRing, CirclePlus } from 'lucide-react'
import type { Alert, BaselineRecord } from '@/features/afterprice/types'
import { EmptyState, Panel, StatusBadge } from '@/components/dashboard/product-ui'

function toneFor(alert: Alert): 'success' | 'warning' | 'danger' | 'accent' | 'neutral' {
  if (alert.alert_type === 'price_drop') return 'success'
  if (alert.severity === 'urgent' || alert.severity === 'high') return 'danger'
  if (alert.alert_type === 'renewal_approaching' || alert.alert_type === 'trial_ending' || alert.alert_type === 'promo_ending') return 'accent'
  if (alert.alert_type === 'price_change' || alert.alert_type === 'plan_change') return 'warning'
  return 'neutral'
}

function labelFor(alert: Alert) {
  return alert.alert_type.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('en-AU') : 'Not recorded'
}

export function AlertList({ alerts, records }: { alerts: Alert[]; records: BaselineRecord[] }) {
  const unread = alerts.filter(alert => !alert.is_read).length
  const linkedRecords = new Map(records.map(record => [record.id, record]))
  return <>
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><Panel className="p-5"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]">Open alerts</p><p className="mt-3 font-display text-3xl font-extrabold tabular-nums">{unread}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">Unread stored alerts</p></Panel><Panel className="p-5"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]">Alert history</p><p className="mt-3 font-display text-3xl font-extrabold tabular-nums">{alerts.length}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">Generated from monitored data</p></Panel><Panel className="p-5"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]">Records monitored</p><p className="mt-3 font-display text-3xl font-extrabold tabular-nums">{records.length}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">Purchases and subscriptions</p></Panel></div>
    <Panel><div className="flex flex-wrap items-end justify-between gap-4"><div><h3 className="font-display text-xl font-extrabold">Alerts</h3><p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">Only persisted monitoring events appear here.</p></div><StatusBadge tone={unread ? 'warning' : 'neutral'}>{unread ? `${unread} to review` : 'Nothing to review'}</StatusBadge></div>{alerts.length ? <div className="mt-6 divide-y divide-border">{alerts.map(alert => { const record = alert.purchase_id ? linkedRecords.get(alert.purchase_id) : alert.subscription_id ? linkedRecords.get(alert.subscription_id) : undefined; const tone = toneFor(alert); return <article key={alert.id} className="py-5 first:pt-0 last:pb-0"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]"><BellRing className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-base font-bold">{record?.display_name ?? alert.title}</h4><StatusBadge tone={tone}>{labelFor(alert)}</StatusBadge>{alert.is_read && <span className="text-xs text-[hsl(var(--foreground-muted))]">Read</span>}</div><p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{alert.summary}</p><dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><div><dt className="text-[hsl(var(--foreground-muted))]">Source</dt><dd className="mt-1 font-semibold">{alert.source ?? 'Not recorded'}</dd></div><div><dt className="text-[hsl(var(--foreground-muted))]">Observed</dt><dd className="mt-1 font-semibold">{formatDate(alert.observed_at)}</dd></div><div><dt className="text-[hsl(var(--foreground-muted))]">Next action</dt><dd className="mt-1 font-semibold">{alert.next_action ?? 'Review the evidence attached to this alert.'}</dd></div></dl></div>{record && <Link href={`/app/baselines/${record.id}`} aria-label={`Open ${record.display_name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-input text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-subtle))] hover:text-accent"><ArrowRight className="h-4 w-4" /></Link>}</div></article> })}</div> : <div className="mt-6"><EmptyState title="No alerts yet" description="AfterPrice will create an alert when a supported observation produces a real change or a time-sensitive renewal event." action={<Link href="/app/add" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add item</Link>} /></div>}</Panel>
  </>
}
