import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Privacy' }

export default function PrivacyPage() {
  return <main id="main-content" tabIndex={-1} className={[styles.legalPage, 'px-5 pb-28 pt-16 sm:px-8 sm:pb-40 sm:pt-24 lg:px-10'].join(' ')}><div className="mx-auto max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5967e8]">Privacy summary</p><h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-750 leading-[0.96] tracking-[-0.065em] sm:text-7xl">Privacy, plainly stated.</h1><p className="mt-8 text-lg leading-8 text-[#5d6673]">AfterPrice uses Supabase authentication for account access and stores the purchase, subscription and preference records you add in your private workspace. It does not connect to bank accounts, retailer logins, submit claims or process payments.</p><div className="mt-14 space-y-8 text-sm leading-7 text-[#5d6673]"><p>Public examples are illustrative and are not copied into your account. Account records are protected by authenticated access and database ownership policies.</p><p>Do not enter bank credentials, retailer passwords or other secrets. Unsupported provider pages are not fetched automatically, and any monitoring source must be configured server-side.</p></div></div></main>
}
