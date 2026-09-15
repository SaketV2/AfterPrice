import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Clock3,
  ExternalLink,
  Eye,
  PackageSearch,
  WalletCards,
} from 'lucide-react'
import { compareBaseline, formatMoney } from '@/features/afterprice/comparison'
import type { BaselineRecord, Comparison } from '@/features/afterprice/types'
import { EmptyState } from '@/components/shared/empty-state'

export type LedgerState = 'action' | 'due' | 'changed' | 'watching' | 'resolved'

export type LedgerEntry = {
  record: BaselineRecord
  comparison: Comparison
  state: LedgerState
  stateLabel: string
  stateDescription: string
  baseline: string
  current: string
  difference: string
  differenceDetail: string
  evidence: string
  evidenceDetail: string
  sourceUrl: string | null
  observed: string
  deadline: string
  deadlineDetail: string
  nextAction: string
  potentialSavingCents: number | null
}

const stateOrder: Array<{ key: LedgerState; label: string; description: string }> = [
  { key: 'action', label: 'Action required', description: 'A stored change is ready for review.' },
  { key: 'due', label: 'Due soon', description: 'A renewal or deadline is approaching.' },
  { key: 'changed', label: 'Changed', description: 'The latest stored observation differs from baseline.' },
  { key: 'watching', label: 'Watching', description: 'Waiting for a compatible observation.' },
  { key: 'resolved', label: 'Resolved', description: 'The decision window has passed or the record is closed.' },
]

const stateStyles: Record<LedgerState, { dot: string; badge: string }> = {
  action: { dot: 'bg-[hsl(var(--danger))]', badge: 'bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger))]' },
  due: { dot: 'bg-[hsl(var(--warning))]', badge: 'bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]' },
  changed: { dot: 'bg-[hsl(var(--accent))]', badge: 'bg-[hsl(var(--accent-soft))] text-accent' },
  watching: { dot: 'bg-[hsl(var(--foreground-muted))]', badge: 'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]' },
  resolved: { dot: 'bg-[hsl(var(--success))]', badge: 'bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]' },
}

function dateLabel(value: string | null | undefined, withYear = false) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
}

function dateTimeLabel(value: string | null | undefined) {
  if (!value) return 'Not observed'
  return new Date(value).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function daysUntil(value: string | null | undefined, now: Date) {
  if (!value) return null
  return Math.ceil((Date.parse(`${value.slice(0, 10)}T23:59:59.999Z`) - now.getTime()) / 86_400_000)
}

function deadlineFor(record: BaselineRecord, now: Date) {
  const value = record.baseline_type === 'subscription' ? record.renewal_at : null
  if (!value) return { label: 'No deadline stored', detail: 'Timing not recorded' }
  const days = daysUntil(value, now)
  const noun = record.baseline_type === 'purchase' ? 'Return window' : 'Renewal'
  if (days !== null && days < 0) return { label: 'Passed', detail: `${noun} ${dateLabel(value, true)}` }
  if (days === 0) return { label: 'Today', detail: `${noun} · ${dateLabel(value, true)}` }
  return { label: `${days} day${days === 1 ? '' : 's'} left`, detail: `${noun} · ${dateLabel(value, true)}` }
}

function deadlineIsSoon(record: BaselineRecord, now: Date) {
  const days = daysUntil(record.baseline_type === 'subscription' ? record.renewal_at : null, now)
  return days !== null && days >= 0 && days <= 30
}

function stateFor(record: BaselineRecord, comparison: Comparison, now: Date): LedgerState {
  if (comparison.kind === 'price_decrease' || comparison.kind === 'subscription_change') return 'action'
  if (deadlineIsSoon(record, now) || comparison.kind === 'renewal_approaching') return 'due'
  if (comparison.kind === 'price_increase') return 'changed'
  return comparison.kind === 'unchanged' || comparison.kind === 'no_observation' ? 'watching' : 'changed'
}

function stateCopy(state: LedgerState) {
  return stateOrder.find(item => item.key === state) ?? stateOrder[0]
}

function differenceFor(record: BaselineRecord, comparison: Comparison) {
  if (record.baseline_type === 'purchase') {
    if (comparison.amountDeltaCents === null) return { value: '—', detail: 'No compatible observation yet', saving: null }
    if (comparison.amountDeltaCents === 0) return { value: 'No change', detail: 'Matches your baseline', saving: null }
    const amount = Math.abs(comparison.amountDeltaCents)
    return {
      value: `${comparison.amountDeltaCents < 0 ? '−' : '+'}${formatMoney(amount)}`,
      detail: comparison.amountDeltaCents < 0 ? 'below baseline · potential' : 'above baseline',
      saving: comparison.amountDeltaCents < 0 ? amount : null,
    }
  }

  const latest = comparison.latestObservation
  const amount = comparison.amountDeltaCents === null ? null : Math.abs(comparison.amountDeltaCents)
  if (comparison.kind === 'subscription_change') return { value: amount ? `${comparison.amountDeltaCents! < 0 ? '−' : '+'}${formatMoney(amount)}` : 'Changed', detail: comparison.details[0] ?? 'Plan details changed', saving: null }
  if (comparison.kind === 'renewal_approaching') return { value: '—', detail: 'No change recorded', saving: null }
  if (latest?.plan_name && latest.plan_name !== record.plan_name) return { value: 'Changed', detail: `${record.plan_name ?? 'Saved plan'} → ${latest.plan_name}`, saving: null }
  return { value: amount ? `${comparison.amountDeltaCents! < 0 ? '−' : '+'}${formatMoney(amount)}` : '—', detail: amount ? 'Compared with baseline' : 'No compatible observation yet', saving: null }
}

function nextActionFor(state: LedgerState, record: BaselineRecord, comparison: Comparison) {
  if (state === 'action' && comparison.kind === 'price_decrease') return 'Review current source'
  if (state === 'action' && comparison.kind === 'subscription_change') return 'Review updated plan'
  if (state === 'due' && record.baseline_type === 'subscription') return 'Review before renewal'
  if (state === 'due') return 'Review deadline'
  if (state === 'resolved') return 'View history'
  if (state === 'changed') return 'View change'
  return 'View item'
}

export function buildLedgerEntry(record: BaselineRecord, now = new Date()): LedgerEntry {
  const comparison = compareBaseline(record, now)
  const state = stateFor(record, comparison, now)
  const copy = stateCopy(state)
  const observation = comparison.latestObservation
  const difference = differenceFor(record, comparison)
  const deadline = deadlineFor(record, now)
  const baselinePlan = record.plan_name ? ` · ${record.plan_name}` : ''
  const currentPlan = observation?.plan_name ? ` · ${observation.plan_name}` : ''
  const baseline = `${formatMoney(record.original_amount_cents)}${baselinePlan}`
  const current = comparison.currentAmountCents === null ? (observation?.plan_name ? observation.plan_name : observation?.renewal_at ? `Renewal ${dateLabel(observation.renewal_at, true)}` : 'Not observed') : `${formatMoney(comparison.currentAmountCents)}${currentPlan}`
  const sourceUrl = observation?.source_url ?? record.source_url ?? record.entities.source_url

  return {
    record,
    comparison,
    state,
    stateLabel: copy.label,
    stateDescription: copy.description,
    baseline,
    current,
    difference: difference.value,
    differenceDetail: difference.detail,
    evidence: observation?.source_name ?? (record.source_url ? 'Original source' : 'No source stored'),
    evidenceDetail: observation ? dateTimeLabel(observation.observed_at) : 'Baseline only',
    sourceUrl,
    observed: observation ? dateTimeLabel(observation.observed_at) : 'Not observed',
    deadline: deadline.label,
    deadlineDetail: deadline.detail,
    nextAction: nextActionFor(state, record, comparison),
    potentialSavingCents: difference.saving,
  }
}

export function sortLedgerEntries(entries: LedgerEntry[]) {
  const rank = new Map(stateOrder.map((item, index) => [item.key, index]))
  return [...entries].sort((left, right) => {
    const stateDelta = (rank.get(left.state) ?? 0) - (rank.get(right.state) ?? 0)
    if (stateDelta) return stateDelta
    return (right.potentialSavingCents ?? 0) - (left.potentialSavingCents ?? 0) || Date.parse(right.record.updated_at) - Date.parse(left.record.updated_at)
  })
}

function StateBadge({ entry }: { entry: LedgerEntry }) {
  const style = stateStyles[entry.state]
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />{entry.stateLabel}</span>
}

function ValueCell({ label, value, detail, emphasis = false }: { label: string; value: string; detail: string; emphasis?: boolean }) {
  return <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">{label}</p><p className={`mt-1 truncate text-sm font-bold tabular-nums ${emphasis ? 'text-[hsl(var(--success))]' : ''}`}>{value}</p><p className="mt-1 line-clamp-2 text-xs leading-4 text-[hsl(var(--foreground-secondary))]">{detail}</p></div>
}

function EvidenceCell({ entry }: { entry: LedgerEntry }) {
  return <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Evidence</p><div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-bold"><span className="truncate">{entry.evidence}</span>{entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open source for ${entry.record.display_name}`} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-input text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-subtle))] hover:text-accent"><ExternalLink className="h-3.5 w-3.5" /></a> : null}</div><p className="mt-1 line-clamp-2 text-xs leading-4 text-[hsl(var(--foreground-secondary))]">{entry.evidenceDetail}</p></div>
}

function ActionLink({ entry }: { entry: LedgerEntry }) {
  return <Link href={`/app/baselines/${entry.record.id}`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-input border border-border px-3 text-sm font-bold text-accent transition-colors hover:border-accent hover:bg-[hsl(var(--accent-soft))] xl:w-auto xl:min-w-[142px]">{entry.nextAction}<ArrowRight className="h-4 w-4" /></Link>
}

function Identity({ entry, mobile = false }: { entry: LedgerEntry; mobile?: boolean }) {
  const record = entry.record
  const typeLabel = record.baseline_type === 'purchase' ? 'Purchase' : 'Subscription'
  return <div className="min-w-0"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]" aria-hidden="true">{record.baseline_type === 'purchase' ? <PackageSearch className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}</span><div className="min-w-0"><Link href={`/app/baselines/${record.id}`} className="block truncate text-sm font-bold hover:text-accent">{record.display_name}</Link><p className="mt-1 truncate text-xs text-[hsl(var(--foreground-secondary))]">{record.entities.provider} · {typeLabel}</p><p className="mt-1 truncate text-xs text-[hsl(var(--foreground-muted))]">{record.entities.variant ?? record.plan_name ?? 'Identity recorded'}</p></div></div>{mobile ? <div className="mt-3"><StateBadge entry={entry} /></div> : null}</div>
}

function DesktopRow({ entry }: { entry: LedgerEntry }) {
  return <article className="hidden grid-cols-[minmax(180px,1.35fr)_minmax(105px,.75fr)_minmax(105px,.75fr)_minmax(125px,.95fr)_minmax(150px,1fr)_minmax(120px,.8fr)_minmax(142px,.8fr)] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 xl:grid"><Identity entry={entry} /><ValueCell label="Baseline" value={entry.baseline} detail={entry.record.baseline_type === 'purchase' ? `Paid ${dateLabel(entry.record.captured_at, true)}` : `Saved ${dateLabel(entry.record.captured_at, true)}`} /><ValueCell label="Current" value={entry.current} detail={entry.observed} /><ValueCell label="Difference" value={entry.difference} detail={entry.differenceDetail} emphasis={Boolean(entry.potentialSavingCents)} /><EvidenceCell entry={entry} /><ValueCell label="Deadline" value={entry.deadline} detail={entry.deadlineDetail} /><ActionLink entry={entry} /></article>
}

function MobileRow({ entry }: { entry: LedgerEntry }) {
  return <article className="border-b border-border p-4 last:border-b-0 sm:p-5 xl:hidden"><div className="flex items-start justify-between gap-4"><Identity entry={entry} mobile /><span className="shrink-0 text-right text-xs font-semibold text-[hsl(var(--foreground-muted))]">{entry.observed === 'Not observed' ? 'Watching' : entry.observed}</span></div><div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 sm:grid-cols-4"><ValueCell label="Baseline" value={entry.baseline} detail="Your saved record" /><ValueCell label="Current" value={entry.current} detail={entry.observed} /><ValueCell label="Difference" value={entry.difference} detail={entry.differenceDetail} emphasis={Boolean(entry.potentialSavingCents)} /><ValueCell label="Deadline" value={entry.deadline} detail={entry.deadlineDetail} /></div><div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><EvidenceCell entry={entry} /><ActionLink entry={entry} /></div></article>
}

export function LedgerRows({ entries }: { entries: LedgerEntry[] }) {
  if (!entries.length) return null
  return <div className="overflow-hidden rounded-dashboard border border-border bg-surface shadow-soft"><div className="hidden grid-cols-[minmax(180px,1.35fr)_minmax(105px,.75fr)_minmax(105px,.75fr)_minmax(125px,.95fr)_minmax(150px,1fr)_minmax(120px,.8fr)_minmax(142px,.8fr)] gap-4 border-b border-border bg-[hsl(var(--surface-subtle))] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))] xl:grid"><span>Item</span><span>Baseline</span><span>Current</span><span>Difference</span><span>Evidence</span><span>Deadline</span><span>Next action</span></div>{entries.map(entry => <div key={entry.record.id}><DesktopRow entry={entry} /><MobileRow entry={entry} /></div>)}</div>
}

export function Ledger({ entries, emptyTitle = 'Nothing to review yet', emptyDescription = 'Add a purchase or subscription to create a baseline. Later observations will appear here when they are stored.', emptyAction }: { entries: LedgerEntry[]; emptyTitle?: string; emptyDescription?: string; emptyAction?: React.ReactNode }) {
  const grouped = stateOrder.map(group => ({ ...group, entries: entries.filter(entry => entry.state === group.key) })).filter(group => group.entries.length)
  if (!grouped.length) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  return <div className="space-y-7">{grouped.map(group => <section key={group.key} aria-labelledby={`ledger-${group.key}`}><div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div className="flex items-center gap-2.5"><span className={`h-2.5 w-2.5 rounded-full ${stateStyles[group.key].dot}`} aria-hidden="true" /><h2 id={`ledger-${group.key}`} className="font-display text-xl font-extrabold tracking-[-0.02em]">{group.label}</h2><span className="rounded-full bg-[hsl(var(--surface-subtle))] px-2 py-0.5 text-xs font-bold text-[hsl(var(--foreground-secondary))]">{group.entries.length}</span></div><p className="text-xs text-[hsl(var(--foreground-muted))]">{group.description}</p></div><LedgerRows entries={group.entries} /></section>)}</div>
}

export function LedgerLegend() {
  return <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[hsl(var(--foreground-secondary))]"><span className="inline-flex items-center gap-2"><CircleAlert className="h-3.5 w-3.5 text-[hsl(var(--danger))]" />Action required</span><span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />Due soon</span><span className="inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-[hsl(var(--foreground-muted))]" />Watching</span><span className="inline-flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-[hsl(var(--success))]" />Resolved</span></div>
}

export function DifferenceIcon({ entry }: { entry: LedgerEntry }) {
  if (entry.comparison.kind === 'price_decrease') return <ArrowDownRight className="h-4 w-4" />
  if (entry.comparison.kind === 'price_increase') return <ArrowUpRight className="h-4 w-4" />
  return <CalendarClock className="h-4 w-4" />
}
