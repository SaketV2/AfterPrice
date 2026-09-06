'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useSpendGuardStore } from '@/lib/store/use-spendguard-store'
import { currency, daysUntil, getActiveAlerts, getAnnualPotentialSavings, getItem, relativeDate, shortDate } from '@/lib/services'
import { Panel, PageIntro, StatusBadge } from '@/components/dashboard/product-ui'
import type { AlertPriority } from '@/lib/types'

const priorityTone: Record<AlertPriority, 'neutral' | 'accent' | 'warning' | 'danger'> = { low: 'neutral', medium: 'accent', high: 'warning', urgent: 'danger' }

function TrendChart() {
  const points = [72, 86, 78, 102, 94, 125, 142, 138, 166, 151, 188, 208]
  const max = Math.max(...points)
  return <div className="mt-6 h-48 w-full"><div className="flex h-full items-end gap-1.5 sm:gap-3">{points.map((point, index) => <div key={index} className="group relative flex h-full flex-1 items-end"><div className="absolute inset-x-0 bottom-0 h-px bg-[var(--border)]" /><div className="relative w-full rounded-t-md bg-[var(--powder)] transition hover:bg-[var(--accent)]" style={{ height: `${(point / max) * 88}%` }}><span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-[var(--surface-dark)] px-1.5 py-1 text-[10px] font-bold text-white group-hover:block">${point}</span></div></div>)}</div><div className="mt-3 flex justify-between text-[11px] font-medium text-[var(--foreground-muted)]"><span>Oct 2025</span><span>Today</span></div></div>
}

function Metric({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: string; tone?: 'neutral' | 'accent' | 'warning' }) {
  return <Panel className="p-5"><p className="text-sm font-semibold text-[var(--foreground-secondary)]">{label}</p><p className="mt-4 font-display text-3xl font-extrabold tracking-[-0.04em]">{value}</p><p className={`mt-2 text-xs font-semibold ${tone === 'accent' ? 'text-[var(--accent)]' : tone === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--foreground-muted)]'}`}>{detail}</p></Panel>
}

export function OverviewDashboard() {
  const { data } = useSpendGuardStore()
  const activeAlerts = useMemo(() => getActiveAlerts(data.alerts), [data.alerts])
  const annualSavings = getAnnualPotentialSavings(data)
  const claimCount = data.items.filter((item) => item.purchase?.status === 'claim_available').length
  const renewalCount = data.items.filter((item) => item.subscription && daysUntil(item.subscription.nextRenewal) <= 14).length
  const planCount = data.items.filter((item) => item.subscription?.status === 'plan_changed').length
  const renewals = data.renewals.filter((renewal) => daysUntil(renewal.date) >= 0).sort((a, b) => daysUntil(a.date) - daysUntil(b.date)).slice(0, 4)

  return <>
    <PageIntro eyebrow="Your money monitor" title="Where am I losing money?" description="SpendGuard watches the prices and plans that change after you buy, then puts the next useful action in front of you." action={<Link href="/app/add" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Add something to watch <span className="ml-2" aria-hidden="true">↗</span></Link>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Potential impact" value={currency(annualSavings)} detail="Open opportunities in your monitor" tone="accent" /><Metric label="Claim opportunities" value={String(claimCount).padStart(2, '0')} detail={claimCount ? `${currency(data.potentialSavings.filter((saving) => saving.period === 'one_off' && saving.status === 'open').reduce((sum, saving) => sum + saving.amount, 0))} available now` : 'Nothing waiting'} tone="warning" /><Metric label="Renewals soon" value={String(renewalCount).padStart(2, '0')} detail="Within the next 14 days" /><Metric label="Items monitored" value={String(data.items.length).padStart(2, '0')} detail={`${planCount} plan changes detected`} /></div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--foreground-secondary)]">Potential impact over time</p><p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.04em]">{currency(annualSavings)} <span className="font-sans text-sm font-semibold text-[var(--success)]">open</span></p></div><StatusBadge tone="accent">12 month view</StatusBadge></div><TrendChart /><p className="mt-4 text-xs leading-5 text-[var(--foreground-muted)]">Illustrative demo history. Amounts combine one-off claim opportunities and annual subscription impact.</p></Panel>
      <Panel><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--foreground-secondary)]">Urgent actions</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">The items worth your attention first</p></div><Link href="/app/alerts" className="text-xs font-bold text-[var(--accent)] hover:underline">View all</Link></div><div className="mt-5 space-y-3">{activeAlerts.filter((alert) => alert.priority === 'urgent' || alert.priority === 'high').slice(0, 3).map((alert) => { const item = getItem(data, alert.itemId); return <Link key={alert.id} href={`/app/items/${alert.itemId}`} className="block rounded-xl border border-[var(--border)] p-3 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"><div className="flex items-start justify-between gap-3"><span className="line-clamp-1 text-sm font-bold">{item?.title}</span><StatusBadge tone={priorityTone[alert.priority]}>{alert.priority}</StatusBadge></div><p className="mt-1 text-xs leading-5 text-[var(--foreground-secondary)]">{alert.title}</p></Link> })}{activeAlerts.filter((alert) => alert.priority === 'urgent' || alert.priority === 'high').length === 0 && <p className="rounded-xl bg-[var(--surface-subtle)] p-4 text-sm text-[var(--foreground-secondary)]">No urgent actions. Your monitor is quiet.</p>}</div></Panel>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--foreground-secondary)]">Upcoming renewals</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">Know what will leave your account next</p></div><Link href="/app/subscriptions" className="text-xs font-bold text-[var(--accent)] hover:underline">See subscriptions</Link></div><div className="mt-5 divide-y divide-[var(--border)]">{renewals.map((renewal) => { const item = getItem(data, renewal.itemId); const days = daysUntil(renewal.date); return <Link key={renewal.id} href={`/app/items/${renewal.itemId}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-bold">{item?.title}</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">{shortDate(renewal.date)} · {days <= 7 ? `${days} days` : 'upcoming'}</p></div><div className="text-right"><p className="text-sm font-bold">{currency(renewal.upcomingPrice)}</p>{renewal.upcomingPrice !== renewal.previousPrice && <p className="text-xs text-[var(--warning)]">+{currency(renewal.upcomingPrice - renewal.previousPrice)}</p>}</div></Link> })}</div></Panel>
      <Panel><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[var(--foreground-secondary)]">Recent activity</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">What SpendGuard found lately</p></div><Link href="/app/alerts" className="text-xs font-bold text-[var(--accent)] hover:underline">Open alerts</Link></div><div className="mt-5 space-y-1">{data.activities.slice(0, 5).map((activity) => <Link key={activity.id} href={activity.itemId ? `/app/items/${activity.itemId}` : '/app'} className="flex gap-3 rounded-xl p-2 transition hover:bg-[var(--surface-subtle)]"><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">{activity.type === 'added' ? '+' : '↘'}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{activity.title}</span><span className="mt-0.5 block truncate text-xs text-[var(--foreground-secondary)]">{activity.description}</span></span><span className="shrink-0 pt-1 text-[11px] text-[var(--foreground-muted)]">{relativeDate(activity.createdAt)}</span></Link>)}</div></Panel>
    </div>
  </>
}

