import { ArrowRight, Circle, Eye, GitCompareArrows, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/design/cn'

export function EmptyState({ icon: Icon, title, description, action, className }: { icon?: LucideIcon; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return <div className={cn('flex min-h-64 flex-col items-center justify-center rounded-dashboard border border-dashed border-border bg-[hsl(var(--surface-subtle))] px-6 py-10 text-center', className)}>
    <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]" aria-hidden="true">
      <span className="flex flex-col items-center gap-1.5"><span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--foreground-muted))] bg-surface"><Circle className="h-3.5 w-3.5 fill-current" /></span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Baseline</span></span>
      <ArrowRight className="mb-4 h-4 w-4" />
      <span className="flex flex-col items-center gap-1.5"><span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--foreground-muted))] bg-surface"><Eye className="h-3.5 w-3.5" /></span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Later</span></span>
      <ArrowRight className="mb-4 h-4 w-4" />
      <span className="flex flex-col items-center gap-1.5"><span className="grid h-8 w-8 place-items-center rounded-full border border-accent bg-[hsl(var(--accent-soft))] text-accent">{Icon ? <Icon aria-hidden className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}</span><span className="text-[10px] font-bold uppercase tracking-[0.12em]">Difference</span></span>
    </div>
    <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
}
