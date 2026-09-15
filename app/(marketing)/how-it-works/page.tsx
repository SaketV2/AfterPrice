import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { ChangeRail, Lifecycle } from '@/components/marketing/product-preview'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'How it works' }

export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={[styles.heroSection, 'px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10'].join(' ')}>
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">Keep the baseline. Catch the change.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5d6673]">AfterPrice turns a purchase, plan or renewal into a seven-stage record: baseline, observe, change, evidence, deadline, action and resolution.</p>
            <div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/demo">Open the product demo <ArrowUpRightIcon /></ButtonLink><ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink></div>
          </div>
          <ChangeRail />
        </div>
      </section>
      <Lifecycle />
      <section className="border-y border-[#e1e5ea] bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div><h2 className="max-w-lg font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">The record is useful before every check is automatic.</h2></div>
          <div className="divide-y divide-[#d8dde5] border-y border-[#d8dde5]">
            {[
              ['Add a baseline', 'Enter the price, date and plan details that establish what was true.'],
              ['Inspect the evidence', 'Compare the source, observed time and before/after values.'],
              ['Choose an outcome', 'Review, claim, keep, change or mark the record resolved.'],
            ].map(([title, body]) => <div key={title} className="py-5"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#5d6673]">{body}</p></div>)}
          </div>
        </div>
      </section>
      <section className="px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-7 rounded-2xl bg-[#dce4ba] px-6 py-10 sm:flex-row sm:items-center sm:px-10"><div><h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">Follow one change from baseline to resolution.</h2></div><ButtonLink href="/demo">Open product demo <ArrowUpRightIcon /></ButtonLink></div>
      </section>
    </main>
  )
}
