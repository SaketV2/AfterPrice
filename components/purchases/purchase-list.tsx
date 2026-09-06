'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSpendGuardStore } from '@/lib/store/use-spendguard-store'
import { currency, filterItems, shortDate } from '@/lib/services'
import { EmptyState, Panel, StatusBadge } from '@/components/dashboard/product-ui'
import type { PurchaseStatus } from '@/lib/types'

const statusLabel: Record<PurchaseStatus, string> = { watching: 'Monitoring', claim_available: 'Claim available', claimed: 'Claimed', expired: 'Expired' }
const statusTone: Record<PurchaseStatus, 'neutral' | 'accent' | 'success' | 'warning'> = { watching: 'neutral', claim_available: 'warning', claimed: 'success', expired: 'neutral' }

export function PurchaseList() {
  const { data } = useSpendGuardStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | PurchaseStatus>('all')
  const [sort, setSort] = useState<'recent' | 'impact' | 'name'>('impact')
  const purchases = useMemo(() => {
    let rows = filterItems(data.items.filter((item) => item.type === 'purchase'), query)
    if (status !== 'all') rows = rows.filter((item) => item.purchase?.status === status)
    return [...rows].sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title) : sort === 'recent' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : (b.purchase?.claimAmount ?? 0) - (a.purchase?.claimAmount ?? 0))
  }, [data.items, query, sort, status])
  return <>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Search purchases</span><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search purchases or retailers" className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" /></label><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter purchase status" className="h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--accent)]"><option value="all">All statuses</option><option value="claim_available">Claim available</option><option value="watching">Monitoring</option><option value="claimed">Claimed</option><option value="expired">Expired</option></select><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort purchases" className="h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold outline-none focus:border-[var(--accent)]"><option value="impact">Sort by impact</option><option value="recent">Most recent</option><option value="name">Name A–Z</option></select></div>
    <Panel className="overflow-hidden p-0">{purchases.length === 0 ? <div className="p-5"><EmptyState title="No matching purchases" description="Try another search or add a purchase to start watching prices." action={<Link href="/app/add" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white">Add purchase</Link>} /></div> : <><div className="hidden grid-cols-[minmax(180px,1.6fr)_minmax(120px,1fr)_100px_100px_110px_110px_130px] gap-4 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--foreground-muted)] lg:grid"><span>Product</span><span>Retailer</span><span>Paid</span><span>Current</span><span>Impact</span><span>Deadline</span><span>Status</span></div><div className="divide-y divide-[var(--border)]">{purchases.map((item) => { const purchase = item.purchase!; return <Link key={item.id} href={`/app/items/${item.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-[var(--surface-subtle)] lg:grid-cols-[minmax(180px,1.6fr)_minmax(120px,1fr)_100px_100px_110px_110px_130px] lg:items-center lg:gap-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">Bought {shortDate(purchase.purchaseDate)}</p></div><div className="text-sm text-[var(--foreground-secondary)]"><span className="lg:hidden">Retailer · </span>{purchase.retailer}</div><div className="text-sm font-semibold lg:text-[var(--foreground-secondary)]"><span className="lg:hidden">Paid · </span>{currency(purchase.paidPrice)}</div><div className="text-sm font-semibold lg:text-[var(--foreground-secondary)]"><span className="lg:hidden">Current · </span>{currency(purchase.currentPrice)}</div><div className={`text-sm font-bold ${purchase.claimAmount > 0 ? 'text-[var(--success)]' : 'text-[var(--foreground-secondary)]'}`}><span className="lg:hidden">Impact · </span>{purchase.claimAmount > 0 ? currency(purchase.claimAmount) : '—'}</div><div className="text-xs font-semibold text-[var(--foreground-secondary)]"><span className="lg:hidden">Window · </span>{purchase.claimDaysRemaining ? `${purchase.claimDaysRemaining} days left` : 'Watching'}</div><div><StatusBadge tone={statusTone[purchase.status]}>{statusLabel[purchase.status]}</StatusBadge></div></Link>})}</div></>}</Panel>
  </>
}

