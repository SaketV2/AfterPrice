import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Terms' }

export default function TermsPage() {
  return <main id="main-content" tabIndex={-1} className={[styles.legalPage, 'px-5 pb-28 pt-16 sm:px-8 sm:pb-40 sm:pt-24 lg:px-10'].join(' ')}><div className="mx-auto max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--success))]">Terms summary</p><h1 className="mt-6 text-5xl font-bold leading-[0.98] tracking-[-0.035em] sm:text-7xl">Use the evidence, then decide.</h1><p className="mt-8 text-lg leading-8 text-[hsl(var(--foreground-secondary))]">AfterPrice records changes after a purchase or subscription so you can review the next action. It does not submit claims, cancel subscriptions or guarantee savings. Pro payment details are handled by Stripe-hosted Checkout.</p><div className="mt-14 space-y-8 text-sm leading-7 text-[hsl(var(--foreground-secondary))]"><p>Examples and amounts on public pages are illustrative. Check the relevant retailer or provider terms before relying on a price, renewal or return-window signal.</p><p>You are responsible for the accuracy of records you add and for keeping passwords, bank credentials and other secrets out of the product.</p></div></div></main>
}
