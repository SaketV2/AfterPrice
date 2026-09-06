'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useSpendGuardStore } from '@/lib/store/use-spendguard-store'
import { getActiveAlerts } from '@/lib/services'

const navItems = [
  { href: '/app', label: 'Overview', icon: '◒' },
  { href: '/app/purchases', label: 'Purchases', icon: '↘' },
  { href: '/app/subscriptions', label: 'Subscriptions', icon: '◫' },
  { href: '/app/alerts', label: 'Alerts', icon: '!' },
]

const productTokens = {
  '--background': '#F6F6F3',
  '--surface': '#FFFFFF',
  '--surface-subtle': '#F0F2F5',
  '--surface-cool': '#E8EDF4',
  '--surface-dark': '#101A2A',
  '--foreground': '#0C0F14',
  '--foreground-secondary': '#5D6673',
  '--foreground-muted': '#818B99',
  '--border': '#E1E5EA',
  '--accent': '#6875F5',
  '--accent-hover': '#5967E8',
  '--accent-soft': '#E7EAFE',
  '--powder': '#DCEAF6',
  '--success': '#237A57',
  '--success-soft': '#E1F3EA',
  '--warning': '#B76D16',
  '--warning-soft': '#FFF0D6',
  '--danger': '#B94242',
  '--danger-soft': '#FCE5E5',
} as CSSProperties

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/app" aria-label="SpendGuard overview" className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-[-0.04em] text-[var(--foreground)]">
    <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--surface-dark)] text-sm font-bold text-white">↘</span>
    {!compact && <span>SpendGuard</span>}
  </Link>
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data } = useSpendGuardStore()
  const activeAlerts = getActiveAlerts(data.alerts).length
  return <nav className="space-y-1" aria-label="Application navigation">
    {navItems.map((item) => {
      const active = item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
      return <Link key={item.href} href={item.href} onClick={onNavigate} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${active ? 'bg-[var(--accent-soft)] text-[var(--foreground)]' : 'text-[var(--foreground-secondary)] hover:bg-white hover:text-[var(--foreground)]'}`}>
        <span className={`grid h-7 w-7 place-items-center rounded-lg text-sm ${active ? 'bg-white text-[var(--accent)]' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]'}`} aria-hidden="true">{item.icon}</span>
        <span>{item.label}</span>
        {item.href === '/app/alerts' && activeAlerts > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-[var(--danger-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--danger)]">{activeAlerts}</span>}
      </Link>
    })}
    <Link href="/app/add" onClick={onNavigate} className="mt-5 flex min-h-11 items-center gap-3 rounded-xl bg-[var(--surface-dark)] px-3.5 text-sm font-semibold text-white transition hover:bg-[#1c2a40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-lg" aria-hidden="true">+</span>
      Add item
    </Link>
  </nav>
}

export function ProductShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data } = useSpendGuardStore()
  const pathname = usePathname()
  const pageTitle = pathname === '/app' ? 'Overview' : pathname.includes('/purchases') ? 'Purchases' : pathname.includes('/subscriptions') ? 'Subscriptions' : pathname.includes('/alerts') ? 'Alerts' : pathname.includes('/settings') ? 'Settings' : pathname.includes('/add') ? 'Add item' : 'Item details'

  return <div style={productTokens} className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[var(--border)] bg-[#f0f2f1] px-5 py-6 lg:flex">
      <Logo />
      <div className="mt-10 flex-1"><p className="mb-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Monitor</p><NavLinks /></div>
      <div className="border-t border-[var(--border)] pt-4">
        <Link href="/app/settings" className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-dark)] text-xs font-bold text-white">{data.user.initials}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold">{data.user.name}</span><span className="block truncate text-xs text-[var(--foreground-secondary)]">Demo workspace</span></span>
        </Link>
      </div>
    </aside>

    {mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#0c0f14]/30 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#f0f2f1] px-5 py-6 shadow-xl transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Logo /><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="grid h-11 w-11 place-items-center rounded-xl text-xl hover:bg-white">×</button></div>
      <div className="mt-10 flex-1"><p className="mb-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Monitor</p><NavLinks onNavigate={() => setMobileOpen(false)} /></div>
      <div className="border-t border-[var(--border)] pt-4"><span className="text-xs text-[var(--foreground-muted)]">Demo mode · local data only</span></div>
    </aside>

    <div className="lg:pl-[248px]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--background)]/90 backdrop-blur">
        <div className="flex min-h-[72px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-12">
          <div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] bg-white text-lg lg:hidden">☰</button><div><p className="text-xs font-medium text-[var(--foreground-muted)]">SpendGuard / Demo</p><h1 className="font-display text-lg font-extrabold tracking-[-0.025em]">{pageTitle}</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-3"><Link href="/app/add" className="hidden min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:flex"><span aria-hidden="true">+</span> Add item</Link><Link href="/app/alerts" aria-label="View alerts" className="relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] bg-white text-lg transition hover:border-[var(--accent)]">♧{getActiveAlerts(data.alerts).length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]" />}</Link><Link href="/app/settings" aria-label="Open settings" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-dark)] text-xs font-bold text-white">{data.user.initials}</Link></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 xl:px-12">{children}</main>
    </div>
  </div>
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{eyebrow ?? 'SpendGuard monitor'}</p><h2 className="font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--foreground-secondary)] sm:text-base">{description}</p>}</div>{action}</div>
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_36px_rgba(12,15,20,0.05)] sm:p-6 ${className}`}>{children}</section>
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }) {
  const tones = { neutral: 'bg-[var(--surface-subtle)] text-[var(--foreground-secondary)]', accent: 'bg-[var(--accent-soft)] text-[#4e5bd4]', success: 'bg-[var(--success-soft)] text-[var(--success)]', warning: 'bg-[var(--warning-soft)] text-[var(--warning)]', danger: 'bg-[var(--danger-soft)] text-[var(--danger)]' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{children}</span>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-6 py-12 text-center"><p className="font-display text-xl font-bold">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--foreground-secondary)]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}
