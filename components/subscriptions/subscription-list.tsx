import Link from 'next/link'
import { CirclePlus } from 'lucide-react'
import type { BaselineRecord } from '@/features/afterprice/types'
import { buildLedgerEntry, Ledger, sortLedgerEntries } from '@/components/dashboard/ledger'

export function SubscriptionList({ records }: { records: BaselineRecord[] }) {
  const entries = sortLedgerEntries(records.map(record => buildLedgerEntry(record)))
  const action = <Link href="/app/add?type=subscription" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-[hsl(var(--surface-dark))] px-4 text-sm font-bold text-[hsl(var(--foreground-on-dark))] transition-colors hover:bg-[hsl(var(--surface-dark-raised))]"><CirclePlus className="h-4 w-4" />Add subscription</Link>
  return <>
    {records.length > 0 && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]"><span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--signal-lime-ink))]">Ledger</span>{records.length} {records.length === 1 ? 'subscription' : 'subscriptions'}</p><p className="text-xs text-[hsl(var(--foreground-muted))]">Baseline · evidence · renewal timing</p></div>}
    <Ledger entries={entries} emptyTitle="No subscriptions in your ledger" emptyDescription="Add a subscription to see renewal dates, plan changes and transparent cost information in one place." emptyAction={action} />
  </>
}
