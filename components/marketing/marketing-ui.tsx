'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Check, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { BrandMark, Wordmark as SharedWordmark } from '@/components/shared/logo'
import styles from './marketing.module.css'

export function ArrowUpRightIcon({ className = '' }: { className?: string }) {
  return <ArrowUpRight aria-hidden="true" className={className} size={16} strokeWidth={1.8} />
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={['inline-flex items-center gap-2.5', dark ? 'text-white' : 'text-[#0c0f14]'].join(' ')}>
      <BrandMark className="h-8 w-8" decorative />
      <SharedWordmark className="text-[1.45rem]" />
    </span>
  )
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={['mb-5 text-[11px] font-bold uppercase tracking-[0.18em]', light ? 'text-[#b9c4ff]' : 'text-[#5967e8]'].join(' ')}>{children}</p>
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
  onClick,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'quiet' | 'light'
  className?: string
  onClick?: () => void
}) {
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-center text-sm font-semibold leading-5 transition-colors duration-200'
  const variants = {
    primary: 'bg-[#3258d4] text-white hover:bg-[#2448bd]',
    secondary: 'border border-[#cfd5dd] bg-white text-[#0c0f14] hover:border-[#3258d4] hover:text-[#2448bd]',
    quiet: 'text-[#5d6673] hover:bg-[#eef0f5] hover:text-[#0c0f14]',
    light: 'bg-[#f5f7fa] text-[#0c0f14] hover:bg-[#b7bd91]',
  }
  return <Link href={href} onClick={onClick} className={[base, variants[variant], className].join(' ')}>{children}</Link>
}

export function SectionIntro({
  title,
  description,
  align = 'left',
  light = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <h2 className={['font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-[-0.035em] sm:text-5xl', light ? 'text-white' : 'text-[#0c0f14]'].join(' ')}>{title}</h2>
      {description && <p className={['mt-5 max-w-xl text-base leading-7 sm:text-lg', align === 'center' ? 'mx-auto' : '', light ? 'text-[#c0c8d2]' : 'text-[#5d6673]'].join(' ')}>{description}</p>}
    </div>
  )
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['motion-reveal', styles.reveal, className].join(' ')}>{children}</div>
}

export function MobileNav({ authenticated = false }: { authenticated?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return
    const trigger = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    const desktop = window.matchMedia('(min-width: 1024px)')
    const onDesktop = () => { if (desktop.matches) setOpen(false) }
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    desktop.addEventListener('change', onDesktop)
    onDesktop()
    return () => {
      desktop.removeEventListener('change', onDesktop)
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.getClientRects().length) trigger.focus({ preventScroll: true })
    }
  }, [open])

  const links = [
    ['What it catches', '/#catches'],
    ['How it works', '/#lifecycle'],
    ['Coverage', '/#coverage'],
    ['Data & privacy', '/#data'],
    ['Pricing', '/pricing'],
  ]

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-xl border border-[#cfd5dd] bg-[#f6f6f3] text-[#0c0f14] lg:hidden"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        aria-label="AfterPrice navigation"
        onCancel={() => setOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}
        className="navigation-dialog fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-transparent p-4 text-[#0c0f14]"
      >
        <div className="ml-auto w-full max-w-md rounded-2xl bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Wordmark />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="grid size-11 shrink-0 place-items-center rounded-xl text-[#5d6673] hover:bg-[#eef0f5]"><X aria-hidden="true" size={20} /></button>
          </div>
          <nav aria-label="Mobile primary navigation" className="flex flex-col gap-1">
            {links.map(([label, href]) => {
              const active = !href.includes('#') && pathname === href
              return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-semibold ${active ? 'bg-[#e6ecff] text-[#2448bd]' : 'text-[#3f4854] hover:bg-[#f0f2f5]'}`}>{label}</Link>
            })}
            <div className="my-2 h-px bg-[#e1e5ea]" />
            {authenticated ? <ButtonLink href="/app" onClick={() => setOpen(false)} className="mt-2">Open app <ArrowUpRightIcon /></ButtonLink> : <><Link href="/login" aria-current={pathname === '/login' ? 'page' : undefined} onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-semibold text-[#3f4854] hover:bg-[#f0f2f5]">Log in</Link><ButtonLink href="/signup" onClick={() => setOpen(false)} className="mt-2">Get started <ArrowUpRightIcon /></ButtonLink></>}
          </nav>
          <p className="px-4 pb-1 pt-5 text-xs leading-5 text-[#5d6673]">Explore local sample data. No bank connection.</p>
        </div>
      </dialog>
    </>
  )
}

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [active, setActive] = useState<number | null>(null)
  const accordionId = useId()
  return (
    <div className="divide-y divide-[#d8dde5] border-y border-[#d8dde5]">
      {items.map((item, index) => {
        const expanded = active === index
        const panelId = `${accordionId}-panel-${index}`
        const questionId = `${accordionId}-question-${index}`
        return (
          <div key={item.question}>
            <h3 className="font-sans tracking-normal">
            <button
              type="button"
              id={questionId}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setActive(expanded ? null : index)}
              className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold leading-6 text-[#0c0f14] transition-colors hover:text-[#2448bd] sm:text-lg"
            >
              <span>{item.question}</span>
              <ChevronDown aria-hidden="true" size={18} className={['shrink-0 transition-transform duration-200', expanded ? 'rotate-180 text-[#5967e8]' : 'text-[#5d6673]'].join(' ')} />
            </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={questionId} aria-hidden={!expanded} className={['grid transition-[grid-template-rows,opacity] duration-200', expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'].join(' ')}>
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pr-8 text-base leading-7 text-[#5d6673]">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function FormMessage({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-[12px] bg-[#fce5e5] px-3 py-2 text-sm text-[#8e3131]">{children}</p>
}

export function CheckIcon() {
  return <Check aria-hidden="true" size={15} strokeWidth={2.3} />
}

export { styles }
