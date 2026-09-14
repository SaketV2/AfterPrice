'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [pathname])

  return (
    <header className={['sticky top-0 z-50 border-b border-transparent', styles.header, scrolled ? styles.headerScrolled : ''].join(' ')}>
      <div className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-5 py-3 sm:px-8 lg:px-10">
        <Link href="/" aria-label="AfterPrice home" className="inline-flex min-h-11 shrink-0 items-center"><Wordmark /></Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map(([label, href]) => {
            const active = href.includes('#') ? pathname === '/' && hash === href.slice(1) : pathname === href
            return <Link key={href} href={href} aria-current={active ? (href.includes('#') ? 'location' : 'page') : undefined} onClick={() => setHash(href.includes('#') ? href.slice(1) : '')} className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${active ? 'bg-[#e6ecff] text-[#2448bd]' : 'text-[#5d6673] hover:bg-[#eef0f5] hover:text-[#0c0f14]'}`}>{label}</Link>
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {authenticated ? <><ButtonLink href="/app" variant="secondary">Open app <ArrowUpRightIcon /></ButtonLink><form action={logout}><button type="submit" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#5d6673] hover:bg-[#eef0f5] hover:text-[#0c0f14]">Log out</button></form></> : <><ButtonLink href="/login" variant="quiet">Log in</ButtonLink><ButtonLink href="/signup" variant="secondary">Get started <ArrowUpRightIcon /></ButtonLink></>}
        </div>
        <MobileNav authenticated={authenticated} />
      </div>
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#283241] bg-[#0c1016] text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label="AfterPrice home" className="inline-flex min-h-11 items-center"><Wordmark dark /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#aab3c0]">A record of what changed after you bought, with the evidence and timing to decide what happens next.</p>
          </div>
          <FooterColumn title="Explore" links={primaryLinks.slice(0, 4)} />
          <FooterColumn title="Account" links={[['Log in', '/login'], ['Sign up', '/signup'], ['Open demo', '/demo']]} />
          <FooterColumn title="Read" links={[['Pricing', '/pricing'], ['FAQ', '/faq'], ['Privacy', '/privacy'], ['Terms', '/terms']]} />
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#283241] pt-6 text-xs leading-5 text-[#aab3c0] sm:flex-row">
          <span>© 2026 AfterPrice. Demo product.</span>
          <span>Potential money is labelled until an outcome is recorded.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-normal text-white">{title}</h2>
      <nav aria-label={`Footer ${title.toLowerCase()}`} className="mt-3 flex flex-col items-start">
        {links.map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-sm text-[#aab3c0] transition-colors hover:text-white">{label}</Link>)}
      </nav>
    </div>
  )
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const main = shellRef.current?.querySelector('main')
    if (!main) return
    main.id = 'main-content'
    main.tabIndex = -1
  }, [pathname])

  return (
    <div ref={shellRef} className="min-h-screen bg-[#f6f6f3] text-[#0c0f14]">
      <style dangerouslySetInnerHTML={{ __html: '@keyframes marketing-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.animate-\\[marketing-rise_.55s_ease-out_both\\]{animation:none!important}}' }} />
      {children}
    </div>
  )
}
