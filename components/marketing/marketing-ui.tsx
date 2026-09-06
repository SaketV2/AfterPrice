'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function ArrowUpRight({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block text-[1.15em] leading-none ${className}`}>↗</span>
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[1.05rem] font-800 tracking-[-0.04em] ${dark ? 'text-white' : 'text-[#0c0f14]'}`}>
      <span aria-hidden="true" className={`relative grid size-8 place-items-center overflow-hidden rounded-[11px] ${dark ? 'bg-[#8792ff]' : 'bg-[#0c0f14]'}`}>
        <span className={`absolute h-[2px] w-4 -rotate-[34deg] rounded-full ${dark ? 'bg-[#0c0f14]' : 'bg-white'}`} />
        <span className={`absolute h-[2px] w-2.5 translate-x-[5px] translate-y-[4px] rotate-[52deg] rounded-full ${dark ? 'bg-[#0c0f14]' : 'bg-white'}`} />
      </span>
      SpendGuard
    </span>
  )
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`mb-5 text-[11px] font-bold uppercase tracking-[0.18em] ${light ? 'text-[#b9c4ff]' : 'text-[#6875f5]'}`}>{children}</p>
}

export function ButtonLink({ href, children, variant = 'primary', className = '', onClick }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'quiet' | 'light'; className?: string; onClick?: () => void }) {
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6875f5]/25 active:scale-[.98]'
  const variants = {
    primary: 'bg-[#0c0f14] text-white hover:bg-[#2a2f37]',
    secondary: 'border border-[#d8dde5] bg-white/70 text-[#0c0f14] hover:border-[#aab3c0] hover:bg-white',
    quiet: 'text-[#5d6673] hover:bg-[#eef0f5] hover:text-[#0c0f14]',
    light: 'bg-white text-[#0c0f14] hover:bg-[#e9ebff]',
  }
  return <a href={href} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</a>
}

export function SectionIntro({ eyebrow, title, description, align = 'left', light = false }: { eyebrow: string; title: string; description?: string; align?: 'left' | 'center'; light?: boolean }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.02] tracking-[-0.055em] sm:text-5xl ${light ? 'text-white' : 'text-[#0c0f14]'}`}>{title}</h2>
      {description && <p className={`mt-5 max-w-xl text-base leading-7 sm:text-lg ${align === 'center' ? 'mx-auto' : ''} ${light ? 'text-[#aab3c0]' : 'text-[#5d6673]'}`}>{description}</p>}
    </div>
  )
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.45, ease: 'easeOut' }} className={`motion-reveal ${className}`}>{children}</motion.div>
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const links = [
    ['How it works', '/how-it-works'],
    ['Pricing', '/pricing'],
    ['FAQ', '/faq'],
    ['Resources', '/resources'],
  ]

  return (
    <>
      <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(value => !value)} className="grid size-11 place-items-center rounded-full border border-[#d8dde5] bg-white text-[#0c0f14] lg:hidden">
        <span className="relative block h-3.5 w-4" aria-hidden="true"><span className={`absolute left-0 top-0 block h-px w-4 bg-current transition ${open ? 'translate-y-1.5 rotate-45' : ''}`} /><span className={`absolute left-0 top-1.5 block h-px w-4 bg-current transition ${open ? 'opacity-0' : ''}`} /><span className={`absolute left-0 top-3 block h-px w-4 bg-current transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`} /></span>
      </button>
      {open && <div className="fixed inset-0 z-40 bg-[#0c0f14]/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className={`fixed inset-x-4 top-20 z-50 rounded-[24px] border border-[#e1e5ea] bg-[#fff] p-3 shadow-[0_24px_60px_rgba(12,15,20,.16)] transition duration-200 lg:hidden ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'}`}>
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {links.map(([label, href]) => <a key={href} href={href} className="rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#3f4854] hover:bg-[#f0f2f5]">{label}</a>)}
          <div className="my-2 h-px bg-[#e1e5ea]" />
          <a href="/login" className="rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#3f4854] hover:bg-[#f0f2f5]">Log in</a>
          <button type="button" onClick={() => router.push('/demo')} className="mt-1 min-h-11 rounded-full bg-[#0c0f14] px-4 py-3 text-sm font-semibold text-white">Try the demo <ArrowUpRight /></button>
        </nav>
      </div>
    </>
  )
}

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="divide-y divide-[#e1e5ea] border-y border-[#e1e5ea]">
      {items.map((item, index) => {
        const expanded = active === index
        return <div key={item.question}>
          <button type="button" aria-expanded={expanded} onClick={() => setActive(expanded ? null : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold text-[#0c0f14] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6875f5]/20">
            <span>{item.question}</span><span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full border border-[#d8dde5] text-lg font-normal transition ${expanded ? 'rotate-45 bg-[#0c0f14] text-white' : 'text-[#5d6673]'}`}>+</span>
          </button>
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><p className="max-w-2xl pb-5 pr-10 text-sm leading-7 text-[#5d6673]">{item.answer}</p></div></div>
        </div>
      })}
    </div>
  )
}

export function FormMessage({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-xl bg-[#fce5e5] px-3 py-2 text-sm text-[#8e3131]">{children}</p>
}
