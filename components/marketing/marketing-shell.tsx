import Link from 'next/link'
import { MobileNav, Wordmark, ButtonLink } from './marketing-ui'

export function MarketingHeader() {
  return (
    <header className="relative z-50 mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link href="/" aria-label="SpendGuard home"><Wordmark /></Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
        <Link href="/how-it-works" className="text-sm font-semibold text-[#5d6673] transition hover:text-[#0c0f14]">How it works</Link>
        <Link href="/pricing" className="text-sm font-semibold text-[#5d6673] transition hover:text-[#0c0f14]">Pricing</Link>
        <Link href="/faq" className="text-sm font-semibold text-[#5d6673] transition hover:text-[#0c0f14]">FAQ</Link>
        <Link href="/resources" className="text-sm font-semibold text-[#5d6673] transition hover:text-[#0c0f14]">Resources</Link>
      </nav>
      <div className="hidden items-center gap-2 lg:flex">
        <ButtonLink href="/login" variant="quiet">Log in</ButtonLink>
        <ButtonLink href="/demo" variant="secondary">Try the demo <span aria-hidden="true">↗</span></ButtonLink>
        <ButtonLink href="/signup">Get started <span aria-hidden="true">↗</span></ButtonLink>
      </div>
      <MobileNav />
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#283241] bg-[#0c1016] text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-20">
          <div>
            <Link href="/" aria-label="SpendGuard home"><Wordmark dark /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#aab3c0]">A personal money watchdog for the costs that quietly change after you buy.</p>
          </div>
          <FooterColumn title="Product" links={[["How it works", '/how-it-works'], ['Pricing', '/pricing'], ['FAQ', '/faq'], ['Resources', '/resources']]} />
          <FooterColumn title="Account" links={[["Log in", '/login'], ['Sign up', '/signup'], ['Try the demo', '/demo']]} />
          <FooterColumn title="Legal" links={[["Privacy", '/privacy'], ['Terms', '/terms']]} />
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#283241] pt-6 text-xs text-[#788492] sm:flex-row"><span>© 2026 SpendGuard. Demo product.</span><span>Built to make quiet cost changes visible.</span></div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#788492]">{title}</h2><nav className="mt-4 flex flex-col items-start gap-3">{links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-[#aab3c0] transition hover:text-white">{label}</Link>)}</nav></div>
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f6f3] text-[#0c0f14]"><style dangerouslySetInnerHTML={{ __html: '@keyframes marketing-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.animate-\\[marketing-rise_.55s_ease-out_both\\]{animation:none!important}}' }} />{children}</div>
}
