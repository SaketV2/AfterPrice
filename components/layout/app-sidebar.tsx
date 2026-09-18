'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ArrowRight, BellRing, House, Plus, Settings, ShoppingBag, Sparkles, WalletCards, X } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/design/cn'

const navItems = [
  { href: '/app', label: 'Watching', icon: House },
  { href: '/app/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/app/subscriptions', label: 'Subscriptions', icon: WalletCards },
  { href: '/app/alerts', label: 'Changes', icon: Activity },
]

type AppSidebarProps = { open?: boolean; onClose?: () => void }

export function AppSidebar({ open = true, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  return <>
    {open && onClose ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-[hsl(var(--surface-dark)/.45)] lg:hidden" onClick={onClose} type="button" /> : null}
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[calc(100vw-1rem)] max-w-[272px] flex-col border-r border-border bg-surface px-4 py-5 transition-transform duration-200 lg:static lg:z-auto lg:w-[272px] lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex items-center justify-between px-2"><Logo href="/app" />{onClose ? <button aria-label="Close navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-input text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-subtle))] lg:hidden" onClick={onClose} type="button"><X aria-hidden className="h-5 w-5" /></button> : null}</div>
      <div className="mt-10 flex min-h-0 flex-1 flex-col"><p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Change ledger</p><nav aria-label="App navigation" className="mt-3 flex flex-col gap-1">{navItems.map(({ href, label, icon: Icon }) => { const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href); return <Link className={cn('group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold transition-colors hover:bg-[hsl(var(--surface-subtle))] hover:text-foreground', active ? 'bg-[hsl(var(--accent-soft))] text-foreground' : 'text-[hsl(var(--foreground-secondary))]')} href={href} key={href} onClick={onClose} aria-current={active ? 'page' : undefined}><span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors group-hover:bg-[hsl(var(--surface-cool))] group-hover:text-accent', active && 'bg-accent text-[hsl(var(--accent-foreground))]')}><Icon aria-hidden className="h-[18px] w-[18px]" /></span><span className="truncate">{label}</span>{href === '/app/alerts' ? <BellRing aria-hidden className="ml-auto h-4 w-4 text-[hsl(var(--foreground-muted))]" /> : null}</Link> })}</nav><p className="mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))]">Actions</p><nav aria-label="App actions" className="mt-3 flex flex-col gap-1"><Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--surface-subtle))] hover:text-foreground" href="/app/add" onClick={onClose}><Plus aria-hidden className="h-[18px] w-[18px] text-[hsl(var(--foreground-muted))] transition-colors group-hover:text-accent" />Add item</Link><Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--surface-subtle))] hover:text-foreground" href="/app/settings" onClick={onClose}><Settings aria-hidden className="h-[18px] w-[18px] text-[hsl(var(--foreground-muted))] transition-colors group-hover:text-accent" />Settings</Link></nav><div className="mt-auto rounded-dashboard bg-[hsl(var(--surface-cool))] p-4"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles aria-hidden className="h-4 w-4 text-accent" />Review the change</div><p className="mt-2 text-xs leading-5 text-[hsl(var(--foreground-secondary))]">Keep the baseline, evidence and next action together.</p><Link className="mt-3 inline-flex items-center text-xs font-bold text-accent hover:underline" href="/app/add"><span>Track an item</span><ArrowRight aria-hidden className="ml-1 h-3.5 w-3.5" /></Link></div></div>
    </aside>
  </>
}
