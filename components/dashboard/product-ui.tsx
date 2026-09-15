'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { Bell, CirclePlus, LayoutDashboard, LogOut, Menu, Settings, ShoppingBag, WalletCards, X } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { Logo as SharedLogo } from '@/components/shared/logo'
import { EmptyState as LifecycleEmptyState } from '@/components/shared/empty-state'

const navItems = [
  { href: '/app', label: 'Inbox', icon: LayoutDashboard },
  { href: '/app/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/app/subscriptions', label: 'Subscriptions', icon: WalletCards },
  { href: '/app/alerts', label: 'Alerts', icon: Bell },
] as const

function Logo() {
  return <SharedLogo href="/app" />
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return <nav className="space-y-1" aria-label="Application navigation">{navItems.map(({ href, label, icon: Icon }) => { const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href); return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-input px-3 text-sm font-semibold transition-colors focus-visible:outline-none ${active ? 'bg-[hsl(var(--surface-dark))] text-white' : 'text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-subtle))] hover:text-foreground'}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? 'bg-white/10 text-[hsl(var(--signal-lime))]' : 'text-[hsl(var(--foreground-muted))] group-hover:text-accent'}`} aria-hidden="true"><Icon className="h-[17px] w-[17px]" /></span>{label}</Link> })}<Link href="/app/add" onClick={onNavigate} className="mt-5 flex min-h-11 items-center gap-3 rounded-input bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--accent-hover))] focus-visible:outline-none"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10" aria-hidden="true"><CirclePlus className="h-[17px] w-[17px]" /></span>Add item</Link></nav>
}

function Account({ user }: { user: { name: string; email: string } }) {
  const initials = user.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AP'
  return <div className="border-t border-border pt-4"><Link href="/app/settings" className="flex items-center gap-3 rounded-input px-2.5 py-2.5 transition-colors hover:bg-[hsl(var(--surface-subtle))]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--surface-dark))] text-xs font-bold text-white">{initials}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="block truncate text-xs text-[hsl(var(--foreground-secondary))]">{user.email}</span></span></Link><form action={logout}><button type="submit" className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-input px-3 text-sm font-semibold text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--surface-subtle))] hover:text-[hsl(var(--danger))]"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button></form></div>
}

export function ProductShell({ children, user }: { children: ReactNode; user: { name: string; email: string } }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const pageTitle = pathname === '/app' ? 'Inbox' : pathname.startsWith('/app/purchases') ? 'Purchases' : pathname.startsWith('/app/subscriptions') ? 'Subscriptions' : pathname.startsWith('/app/alerts') ? 'Changes' : pathname.startsWith('/app/add') || pathname.startsWith('/app/baselines/new') ? 'Add item' : pathname.startsWith('/app/settings') ? 'Settings' : 'AfterPrice'

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] flex-col border-r border-border bg-surface px-5 py-6 lg:flex"><Logo /><div className="mt-11 flex-1"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))]">Monitor</p><NavLinks /></div><Account user={user} /></aside>
    {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[hsl(var(--surface-dark)/.35)] lg:hidden" />}
    <aside role="dialog" aria-modal="true" aria-hidden={!mobileOpen} aria-label="Application navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col bg-surface px-5 py-6 shadow-[var(--shadow-raised)] transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between"><Logo /><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="grid h-11 w-11 place-items-center rounded-input text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--surface-subtle))]"><X className="h-5 w-5" /></button></div><div className="mt-10 flex-1"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))]">Monitor</p><NavLinks onNavigate={() => setMobileOpen(false)} /></div><Account user={user} /></aside>
    <div className="lg:pl-[256px]"><header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"><div className="flex min-h-[72px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12"><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="grid h-11 w-11 items-center justify-center rounded-input border border-border bg-surface text-[hsl(var(--foreground-secondary))] lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="hidden text-xs text-[hsl(var(--foreground-muted))] sm:block">AfterPrice / Monitor</p><h1 className="font-display text-lg font-extrabold tracking-[-0.025em]">{pageTitle}</h1></div></div><div className="flex items-center gap-2"><Link href="/app/alerts" aria-label="Open alerts" className="relative grid h-10 w-10 place-items-center rounded-input border border-border bg-surface text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--surface-subtle))]"><Bell className="h-4 w-4" /></Link><Link href="/app/add" className="hidden min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-[hsl(var(--accent-hover))] sm:inline-flex"><CirclePlus className="h-4 w-4" />Add item</Link><Link href="/app/settings" aria-label="Account settings" className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--surface-dark))] text-white"><Settings className="h-4 w-4" /></Link></div></div></header><main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1440px] px-5 py-8 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-8 sm:py-10 xl:px-12">{children}</main></div>
  </div>
}

export function PageIntro({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-[-0.035em] sm:text-4xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--foreground-secondary))] sm:text-base">{description}</p>}</div>{action}</div>
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-dashboard border border-border bg-surface p-5 shadow-soft sm:p-6 ${className}`}>{children}</section>
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }) {
  const tones = { neutral: 'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground-secondary))]', accent: 'bg-[hsl(var(--accent-soft))] text-accent', success: 'bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]', warning: 'bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]', danger: 'bg-[hsl(var(--danger-soft))] text-[hsl(var(--danger))]' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{children}</span>
}

export function EmptyState({ title, description, action, className = '' }: { title: string; description: string; action?: ReactNode; className?: string }) {
  return <LifecycleEmptyState title={title} description={description} action={action} className={className} />
}
