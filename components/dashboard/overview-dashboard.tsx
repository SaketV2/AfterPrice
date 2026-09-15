import Link from 'next/link'
import { CirclePlus, Eye, PiggyBank, RotateCcw } from 'lucide-react'
import type { BaselineRecord } from '@/features/afterprice/types'
import { PageIntro } from '@/components/dashboard/product-ui'
import { buildLedgerEntry, Ledger, LedgerLegend, sortLedgerEntries } from '@/components/dashboard/ledger'

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)
}

function SummaryStrip({ entries }: { entries: ReturnType<typeof buildLedgerEntry>[] }) {
  const actionCount = entries.filter(entry => entry.state === 'action').length
  const dueCount = entries.filter(entry => entry.state === 'due').length
  const watchingCount = entries.filter(entry => entry.state === 'watching').length
  const potential = entries.reduce((total, entry) => total + (entry.potentialSavingCents ?? 0), 0)
  const summary = [
    { label: 'Decisions to review', value: actionCount, helper: 'Stored changes with a next action', icon: RotateCcw, tone: 'text-[hsl(var(--danger))]' },
    { label: 'Due soon', value: dueCount, helper: 'Renewals and deadlines within 30 days', icon: RotateCcw, tone: 'text-[hsl(var(--warning))]' },
    { label: 'Potential savings', value: formatMoney(potential), helper: 'Potential only until resolved', icon: PiggyBank, tone: 'text-[hsl(var(--success))]' },
    { label: 'Items watching', value: watchingCount, helper: 'Waiting for compatible evidence', icon: Eye, tone: 'text-[hsl(var(--foreground-muted))]' },
  ] as const

  return <section aria-label="Monitoring summary" className="grid overflow-hidden rounded-dashboard border border-border bg-surface shadow-soft sm:grid-cols-2 xl:grid-cols-4">{summary.map(({ label, value, helper, icon: Icon, tone }) => <div key={label} className="flex min-h-[104px] items-start gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0"><Icon aria-hidden className={`mt-1 h-4 w-4 shrink-0 ${tone}`} /><div><p className="text-xs font-semibold text-[hsl(var(--foreground-secondary))]">{label}</p><p className={`mt-2 font-display text-2xl font-extrabold tracking-[-0.035em] ${tone}`}>{value}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--foreground-muted))]">{helper}</p></div></div>)}</section>
}

export function OverviewDashboard({ records }: { records: BaselineRecord[] }) {
  const entries = sortLedgerEntries(records.map(record => buildLedgerEntry(record)))
  const actionCount = entries.filter(entry => entry.state === 'action').length
  const dueCount = entries.filter(entry => entry.state === 'due').length
  const emptyAction = <Link href="/app/add" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add item</Link>

  return <>
    <PageIntro title="Today" description="Here are the changes, deadlines and decisions that matter after you buy." action={<Link href="/app/add" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add item</Link>} />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="font-display text-lg font-bold">{actionCount ? `${actionCount} ${actionCount === 1 ? 'decision needs' : 'decisions need'} your attention` : 'No decisions need your attention today'}</p><LedgerLegend /></div>
    <SummaryStrip entries={entries} />
    <div className="mt-8"><Ledger entries={entries} emptyTitle="Your ledger is ready for its first baseline" emptyDescription="Add a purchase or subscription. When a compatible observation is stored, AfterPrice will show the difference, evidence and timing here." emptyAction={emptyAction} /></div>
    {dueCount > 0 && <p className="mt-6 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">Dates and potential savings are taken from your saved records and stored observations. Review the evidence before deciding what to do next.</p>}
  </>
}
