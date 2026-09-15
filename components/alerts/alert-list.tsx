import Link from 'next/link'
import { ArrowRight, BellRing, CirclePlus, ExternalLink } from 'lucide-react'
import type { Alert, BaselineRecord } from '@/features/afterprice/types'
import { buildLedgerEntry, type LedgerState } from '@/components/dashboard/ledger'
import { EmptyState } from '@/components/shared/empty-state'

function labelFor(alert: Alert) {
  return alert.alert_type.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function stateFor(alert: Alert): LedgerState {
  if (alert.alert_type === 'renewal_approaching' || alert.alert_type === 'return_window_closing' || alert.alert_type === 'trial_ending' || alert.alert_type === 'promo_ending') return 'due'
  if (alert.alert_type === 'price_drop' || alert.alert_type === 'price_change' || alert.alert_type === 'plan_change' || alert.alert_type === 'cheaper_plan' || alert.severity === 'urgent' || alert.severity === 'high') return 'action'
  if (alert.alert_type === 'source_unavailable') return 'watching'
  return 'changed'
}

const stateStyles: Record<LedgerState, string> = {
  action: 'bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger))]',
  due: 'bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]',
  changed: 'bg-[hsl(var(--accent-soft))] text-accent',
  watching: 'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]',
  resolved: 'bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]',
}

function dateTimeLabel(value: string | null) {
  return value ? new Date(value).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not observed'
}

function AlertRow({ alert, record }: { alert: Alert; record?: BaselineRecord }) {
  const entry = record ? buildLedgerEntry(record) : null
  const state = stateFor(alert)
  const href = record ? `/app/baselines/${record.id}` : alert.source_url
  const action = alert.next_action ?? (record ? entry?.nextAction : 'Review alert')
  return <article className="rounded-dashboard border border-border bg-surface p-4 shadow-soft sm:p-5"><div className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stateStyles[state]}`} aria-hidden="true"><BellRing className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-display text-lg font-extrabold">{record?.display_name ?? alert.title}</h2><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${stateStyles[state]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{state === 'action' ? 'Action required' : state === 'due' ? 'Due soon' : state === 'watching' ? 'Watching' : 'Changed'}</span>{!alert.is_read && <span className="text-xs font-bold text-[hsl(var(--danger))]">Unread</span>}</div><p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{alert.summary}</p></div></div><div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Baseline</p><p className="mt-1 text-sm font-bold tabular-nums">{entry?.baseline ?? 'Not recorded'}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-secondary))]">{record ? record.entities.provider : labelFor(alert)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Current / detail</p><p className="mt-1 text-sm font-bold">{entry?.current ?? alert.title}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-secondary))]">{entry?.difference ?? 'Persisted alert'}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Evidence</p><p className="mt-1 flex items-center gap-1 text-sm font-bold"><span className="truncate">{alert.source ?? entry?.evidence ?? 'Stored alert'}</span>{alert.source_url && <a href={alert.source_url} target="_blank" rel="noreferrer" aria-label={`Open source for ${alert.title}`} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-input text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-subtle))] hover:text-accent"><ExternalLink className="h-3.5 w-3.5" /></a>}</p><p className="mt-1 text-xs text-[hsl(var(--foreground-secondary))]">{dateTimeLabel(alert.observed_at ?? entry?.record.updated_at ?? null)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Next action</p><p className="mt-1 text-sm font-bold leading-5">{action}</p></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="text-xs text-[hsl(var(--foreground-muted))]">Created {dateTimeLabel(alert.created_at)}</p>{href && (record ? <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-input border border-border px-3 text-sm font-bold text-accent hover:border-accent hover:bg-[hsl(var(--accent-soft))]">Open record <ArrowRight className="h-4 w-4" /></Link> : <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-input border border-border px-3 text-sm font-bold text-accent hover:border-accent hover:bg-[hsl(var(--accent-soft))]">Open source <ExternalLink className="h-4 w-4" /></a>)}</div></article>
}

export function AlertList({ alerts, records }: { alerts: Alert[]; records: BaselineRecord[] }) {
  if (!alerts.length) return <EmptyState title="No alerts in your ledger" description="AfterPrice will add an alert when a supported observation produces a real change or a time-sensitive renewal event." action={<Link href="/app/add" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add item</Link>} />
  const byId = new Map(records.map(record => [record.id, record]))
  const rank: Record<LedgerState, number> = { action: 0, due: 1, changed: 2, watching: 3, resolved: 4 }
  const ordered = [...alerts].sort((left, right) => rank[stateFor(left)] - rank[stateFor(right)] || Date.parse(right.created_at) - Date.parse(left.created_at))
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-[hsl(var(--foreground-secondary))]">{alerts.length} persisted {alerts.length === 1 ? 'alert' : 'alerts'}</p><p className="text-xs text-[hsl(var(--foreground-muted))]">Review the evidence and next action attached to each alert.</p></div>{ordered.map(alert => <AlertRow key={alert.id} alert={alert} record={(alert.purchase_id ?? alert.subscription_id) ? byId.get(alert.purchase_id ?? alert.subscription_id ?? '') : undefined} />)}</div>
}
