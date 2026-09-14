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
    {open && onClose ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={onClose} type="button" /> : null}
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r bg-surface px-4 py-5 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex items-center justify-between px-2"><Logo href="/app" />{onClose ? <button aria-label="Close navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-input text-foreground-secondary hover:bg-surface-subtle lg:hidden" onClick={onClose} type="button"><X aria-hidden className="h-5 w-5" /></button> : null}</div>
      <div className="mt-10 flex flex-1 flex-col"><p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Change ledger</p><nav aria-label="App navigation" className="mt-3 flex flex-col gap-1">{navItems.map(({ href, label, icon: Icon }) => { const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href); return <Link className={cn('group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold transition-colors hover:bg-surface-subtle hover:text-foreground', active ? 'bg-surface-subtle text-foreground' : 'text-foreground-secondary')} href={href} key={href} onClick={onClose}><Icon aria-hidden className={cn('h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent', active && 'text-accent')} />{label}{href === '/app/alerts' ? <BellRing aria-hidden className="ml-auto h-4 w-4 text-foreground-muted" /> : null}</Link> })}</nav><p className="mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Actions</p><nav aria-label="App actions" className="mt-3 flex flex-col gap-1"><Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href="/app/add" onClick={onClose}><Plus aria-hidden className="h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent" />Add item</Link><Link className="group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground" href="/app/settings" onClick={onClose}><Settings aria-hidden className="h-[18px] w-[18px] text-foreground-muted transition-colors group-hover:text-accent" />Settings</Link></nav><div className="mt-auto rounded-dashboard bg-surface-cool p-4"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles aria-hidden className="h-4 w-4 text-accent" />Review the change</div><p className="mt-2 text-xs leading-5 text-foreground-secondary">Keep the baseline, evidence and next action together.</p><Link className="mt-3 inline-flex items-center text-xs font-bold text-accent hover:underline" href="/app/add"><span>Track an item</span><ArrowRight aria-hidden className="ml-1 h-3.5 w-3.5" /></Link></div></div>
    </aside>
  </>
}
