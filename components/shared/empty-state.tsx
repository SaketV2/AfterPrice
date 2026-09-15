import { Circle, Eye, GitCompareArrows, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/design/cn'

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return <div className={cn('flex min-h-64 flex-col items-center justify-center rounded-card border border-dashed border-border bg-[hsl(var(--surface-subtle)/.62)] px-6 py-10 text-center', className)}>
    <div className="relative w-full max-w-[340px]" aria-hidden="true">
      <svg viewBox="0 0 340 20" className="absolute inset-x-0 top-4 h-5 w-full text-[hsl(var(--border-strong))]" fill="none"><path d="M18 10h304" stroke="currentColor" strokeDasharray="3 5" strokeWidth="1.5" /><path d="M178 10h70" stroke="hsl(var(--signal-lime))" strokeWidth="3" strokeLinecap="round" /><circle cx="18" cy="10" r="4" fill="hsl(var(--surface))" stroke="currentColor" strokeWidth="1.5" /><circle cx="178" cy="10" r="4" fill="hsl(var(--surface))" stroke="currentColor" strokeWidth="1.5" /><circle cx="322" cy="10" r="5" fill="hsl(var(--signal-lime-soft))" stroke="hsl(var(--signal-lime-ink))" strokeWidth="1.5" /></svg>
      <div className="relative flex items-start justify-between text-[hsl(var(--foreground-muted))]">
        <span className="flex w-20 flex-col items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--foreground-muted))] bg-surface"><Circle className="h-3.5 w-3.5 fill-current" /></span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Baseline</span></span>
        <span className="flex w-20 flex-col items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--foreground-muted))] bg-surface"><Eye className="h-3.5 w-3.5" /></span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Later</span></span>
        <span className="flex w-20 flex-col items-center gap-2 text-[hsl(var(--signal-lime-ink))]"><span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--signal-lime-ink))] bg-[hsl(var(--signal-lime-soft))]">{Icon ? <Icon aria-hidden className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}</span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Difference</span></span>
      </div>
    </div>
    <h3 className="mt-7 font-sans text-xl font-bold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
}
