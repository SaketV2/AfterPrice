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
  return <span className={['inline-flex items-center gap-2.5', dark ? 'text-[var(--paper-raised)]' : 'text-[var(--ink)]'].join(' ')}><BrandMark className="h-8 w-8" decorative /><SharedWordmark className="text-[1.45rem]" /></span>
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={[styles.sectionMarker, light ? 'text-[var(--saffron)]' : ''].join(' ')}>{children}</p>
}

export function ButtonLink({ href, children, variant = 'primary', className = '', onClick }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'quiet' | 'light'; className?: string; onClick?: () => void }) {
  const variantClass = { primary: styles.buttonPrimary, secondary: styles.buttonSecondary, quiet: styles.buttonQuiet, light: styles.buttonLight }[variant]
  return <Link href={href} onClick={onClick} className={[styles.buttonBase, variantClass, className].join(' ')}>{children}</Link>
}

export function SectionIntro({ title, description, align = 'left', light = false }: { eyebrow?: string; title: string; description?: string; align?: 'left' | 'center'; light?: boolean }) {
  return <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}><h2 className={[styles.sectionTitle, light ? 'text-[var(--paper-raised)]' : ''].join(' ')}>{title}</h2>{description && <p className={[styles.sectionLead, 'mt-5', align === 'center' ? 'mx-auto' : '', light ? 'text-[rgba(255,253,248,.72)]' : ''].join(' ')}>{description}</p>}</div>
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={[styles.reveal, className].join(' ')}>{children}</div>
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
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.getClientRects().length) trigger.focus({ preventScroll: true })
    }
  }, [open])

  const links = [['What it catches', '/#catches'], ['How it works', '/#lifecycle'], ['Coverage', '/#coverage'], ['Data & privacy', '/#data'], ['Pricing', '/pricing']]

  return <>
    <button ref={menuButtonRef} type="button" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)} className={styles.mobileMenuButton}><Menu aria-hidden="true" size={20} /></button>
    <dialog ref={dialogRef} id="mobile-navigation" aria-label="AfterPrice navigation" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false) }} className={styles.navigationDialog}>
      <div className={styles.navigationPanel}>
        <div className="mb-4 flex items-center justify-between gap-4"><Wordmark /><button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className={styles.mobileMenuButton}><X aria-hidden="true" size={20} /></button></div>
        <nav aria-label="Mobile primary navigation" className="flex flex-col gap-1">
          {links.map(([label, href]) => { const active = !href.includes('#') && pathname === href; return <Link key={href} href={href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={[styles.mobileNavLink, active ? styles.mobileNavLinkActive : ''].join(' ')}>{label}</Link> })}
          <div className={styles.mobileNavDivider} />
          {authenticated ? <ButtonLink href="/app" onClick={() => setOpen(false)}>Open app <ArrowUpRightIcon /></ButtonLink> : <><Link href="/login" aria-current={pathname === '/login' ? 'page' : undefined} onClick={() => setOpen(false)} className={styles.mobileNavLink}>Log in</Link><ButtonLink href="/signup" onClick={() => setOpen(false)}>Get started <ArrowUpRightIcon /></ButtonLink></>}
        </nav>
        <p className={styles.mobileNavNote}>Add only the purchases and subscriptions you choose. No bank connection.</p>
      </div>
    </dialog>
  </>
}

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [active, setActive] = useState<number | null>(null)
  const accordionId = useId()
  return <div className={styles.faqAccordion}>{items.map((item, index) => {
    const expanded = active === index
    const panelId = `${accordionId}-panel-${index}`
    const questionId = `${accordionId}-question-${index}`
    return <div key={item.question} className={styles.faqItem}><h3><button type="button" id={questionId} aria-expanded={expanded} aria-controls={panelId} onClick={() => setActive(expanded ? null : index)} className={[styles.faqQuestion, expanded ? styles.faqQuestionExpanded : ''].join(' ')}><span>{item.question}</span><ChevronDown aria-hidden="true" size={18} /></button></h3><div id={panelId} role="region" aria-labelledby={questionId} aria-hidden={!expanded} className={[styles.faqAnswer, expanded ? styles.faqAnswerOpen : ''].join(' ')}><div><p>{item.answer}</p></div></div></div>
  })}</div>
}

export function FormMessage({ children }: { children: React.ReactNode }) {
  return <p role="alert" className={styles.formMessage}>{children}</p>
}

export function CheckIcon() {
  return <Check aria-hidden="true" size={15} strokeWidth={2.3} />
}

export { styles }
