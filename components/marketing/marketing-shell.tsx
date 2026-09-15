'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowUpRightIcon, ButtonLink, MobileNav, Wordmark } from './marketing-ui'
import styles from './marketing.module.css'
import { logout } from '@/app/auth/actions'

const primaryLinks: Array<[string, string]> = [
  ['What it catches', '/#catches'],
  ['How it works', '/#lifecycle'],
  ['Coverage', '/#coverage'],
  ['Data & privacy', '/#data'],
  ['Pricing', '/pricing'],
]

export function MarketingHeader({ authenticated = false }: { authenticated?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => { window.removeEventListener('hashchange', onHashChange); window.removeEventListener('popstate', onHashChange) }
  }, [pathname])

  return <header className={['sticky top-0 z-50 border-b border-transparent', styles.header, scrolled ? styles.headerScrolled : ''].join(' ')}>
    <div className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-10">
      <Link href="/" aria-label="AfterPrice home" className="inline-flex min-h-11 shrink-0 items-center"><Wordmark /></Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
        {primaryLinks.map(([label, href]) => { const active = href.includes('#') ? pathname === '/' && hash === href.slice(1) : pathname === href; return <Link key={href} href={href} aria-current={active ? (href.includes('#') ? 'location' : 'page') : undefined} onClick={() => setHash(href.includes('#') ? href.slice(1) : '')} className={[styles.headerNavLink, active ? styles.headerNavLinkActive : ''].join(' ')}>{label}</Link> })}
      </nav>
      <div className="hidden items-center gap-2 lg:flex">
        {authenticated ? <><ButtonLink href="/app" variant="secondary">Open app <ArrowUpRightIcon /></ButtonLink><form action={logout}><button type="submit" className={styles.headerAction}>Log out</button></form></> : <><ButtonLink href="/login" variant="quiet">Log in</ButtonLink><ButtonLink href="/signup" variant="secondary">Get started <ArrowUpRightIcon /></ButtonLink></>}
      </div>
      <div className="lg:hidden"><MobileNav authenticated={authenticated} /></div>
    </div>
  </header>
}

export function MarketingFooter() {
  return <footer className={styles.footer}>
    <div className={styles.footerInner}>
      <div className={styles.footerGrid}>
        <div><Link href="/" aria-label="AfterPrice home" className="inline-flex min-h-11 items-center"><Wordmark dark /></Link><p className={styles.footerDescription}>A record of what changed after you bought, with the evidence and timing to decide what happens next.</p></div>
        <FooterColumn title="Explore" links={primaryLinks.slice(0, 4)} />
        <FooterColumn title="Account" links={[['Log in', '/login'], ['Sign up', '/signup'], ['Open demo', '/demo']]} />
        <FooterColumn title="Read" links={[['Pricing', '/pricing'], ['FAQ', '/faq'], ['Privacy', '/privacy'], ['Terms', '/terms']]} />
      </div>
      <div className={styles.footerBottom}><span>© 2026 AfterPrice. Demo product.</span><span>Potential money is labelled until an outcome is recorded.</span></div>
    </div>
  </footer>
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <div><h2 className={styles.footerColumnTitle}>{title}</h2><nav aria-label={`Footer ${title.toLowerCase()}`} className="mt-2 flex flex-col items-start">{links.map(([label, href]) => <Link key={href} href={href} className={styles.footerLink}>{label}</Link>)}</nav></div>
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return <div className={[styles.marketingRoot, 'min-h-screen'].join(' ')}>{children}</div>
}
