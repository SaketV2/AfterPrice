import { ArrowUpRightIcon, ButtonLink, FaqAccordion } from '@/components/marketing/marketing-ui'
import { HeroPurchaseRecord, LiveChangeFeed, Lifecycle } from '@/components/marketing/product-preview'
import { capabilityRows, changeTypes, coverageItems, faqItems } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={[styles.heroSection, 'px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-10 lg:pb-24 lg:pt-16'].join(' ')}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className={[styles.heroCopy, 'min-w-0'].join(' ')}>
            <p className={styles.heroStamp}>A post-purchase record · V1 demo</p>
            <h1 className="max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(3rem,5.6vw,5.5rem)] font-750 leading-[1.02] tracking-[-0.04em] text-[#0c0f14]">Stop losing money after you buy.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#5d6673] sm:text-lg sm:leading-8">Track a purchase or subscription once. See when the price drops, the plan changes or the next renewal costs more, with the evidence and timing to decide what to do.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="/signup">Get started free <ArrowUpRightIcon /></ButtonLink>
              <a href="/how-it-works" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#3258d4] underline decoration-[#3258d4]/30 underline-offset-4 hover:decoration-current">See how it works <ArrowUpRightIcon /></a>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#68717e]">No bank connection · Sample data clearly labelled</p>
            <p className="mt-8 max-w-xl font-mono text-[10px] uppercase tracking-[0.12em] text-[#68717e]">Baseline <span className="px-1 text-[#b2ad9f]">→</span> Observe <span className="px-1 text-[#b2ad9f]">→</span> Change <span className="px-1 text-[#b2ad9f]">→</span> Evidence <span className="px-1 text-[#b2ad9f]">→</span> Deadline <span className="px-1 text-[#b2ad9f]">→</span> Action <span className="px-1 text-[#b2ad9f]">→</span> Resolution</p>
          </div>
          <div className={[styles.heroRail, 'min-w-0'].join(' ')}>
            <HeroPurchaseRecord />
          </div>
        </div>
      </section>

      <LiveChangeFeed />
      <Lifecycle />

      <section className="border-y border-[#d5d1c8] bg-[#fbfaf7] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <h2 className="max-w-lg font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">Price, plan and renewal changes use the same decision path.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#5d6673]">The category changes. The useful information does not: baseline, current state, consequence, timing, evidence and a next action.</p>
            <p className="text-xs text-[#68717e] lg:col-span-2">Illustrative records · Potential amounts are not confirmed recovery</p>
          </div>
          <div className="mt-12 divide-y divide-[#d8dde5] border-y border-[#d8dde5]">
            {changeTypes.map(item => (
              <div key={item.category} className="grid grid-cols-2 gap-x-5 gap-y-4 py-6 lg:grid-cols-[1.2fr_0.85fr_0.85fr_1fr_1fr] lg:items-start lg:gap-6">
                <div className="col-span-2 lg:col-span-1"><p className="text-xs font-semibold text-[#3258d4]">{item.category}</p><h3 className="mt-1 text-lg font-bold leading-6 tracking-[-0.02em]">{item.title}</h3></div>
                <div><p className="text-xs text-[#68717e]">Baseline</p><p className="mt-1 text-sm font-semibold tabular-nums">{item.baseline}</p></div>
                <div><p className="text-xs text-[#68717e]">Current</p><p className="mt-1 text-sm font-semibold tabular-nums">{item.current}</p></div>
                <div><p className="text-xs text-[#68717e]">Consequence</p><p className="mt-1 text-sm font-semibold">{item.consequence}</p></div>
                <div><p className="text-xs text-[#68717e]">Next action</p><p className="mt-1 text-sm font-semibold text-[#3258d4]">{item.action}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={[styles.sectionDark, 'px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-10'].join(' ')}>
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h2 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">Useful now. Clear about what is still manual.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#c0c8d2]">The demo proves the record and decision flow. It does not pretend to have retailer access, a claim outcome or a bank connection.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-[16px] border border-[#283241]">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">AfterPrice capabilities in the V1 demo</caption>
              <thead className="bg-[#1a2230] text-xs uppercase tracking-[0.12em] text-[#aab3c0]">
                <tr><th scope="col" className="w-[62%] px-4 py-4 font-semibold sm:px-6">Capability</th><th scope="col" className="px-4 py-4 font-semibold sm:px-6">V1 status</th></tr>
              </thead>
              <tbody className="divide-y divide-[#283241]">
                {capabilityRows.map(([capability, status]) => (
                  <tr key={capability}><th scope="row" className="px-4 py-4 align-top font-medium leading-6 text-[#f5f7fa] sm:px-6">{capability}</th><td className={['px-4 py-4 align-top text-xs font-semibold leading-6 sm:px-6', status.startsWith('Available') ? 'text-[#b7bd91]' : 'text-[#f0bd71]'].join(' ')}>{status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="coverage" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">Track the changes that happen after the receipt.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d6673]">Start with the records where a later price, plan or renewal detail can change the decision you make.</p>
          </div>
          <ul className="divide-y divide-[#d8dde5] border-y border-[#d8dde5]">
            {coverageItems.map(item => <li key={item} className="py-4 text-sm font-semibold">{item}</li>)}
          </ul>
        </div>
      </section>

      <section id="data" className="border-y border-[#d5d1c8] bg-[#ebe7df] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">The demo keeps its boundaries visible.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d6673]">The visual examples on this page are illustrative. Your account records are private to your authenticated workspace, and no bank account or retailer login is required.</p>
          </div>
          <div className="divide-y divide-[#cfd5dd] border-y border-[#cfd5dd]">
            <div className="py-4"><p className="text-sm font-bold">Illustrative examples</p><p className="mt-1 text-sm leading-6 text-[#5d6673]">Public examples show how a lower price, changed plan or renewal can be presented.</p></div>
            <div className="py-4"><p className="text-sm font-bold">Your account</p><p className="mt-1 text-sm leading-6 text-[#5d6673]">Authenticated workspaces start empty and only contain records you add.</p></div>
            <div className="py-4"><p className="text-sm font-bold">Still manual</p><p className="mt-1 text-sm leading-6 text-[#5d6673]">Claims, cancellations and unsupported provider checks remain your responsibility.</p></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="max-w-md font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">What the V1 demo does, in plain terms.</h2>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 rounded-[16px] bg-[#e1f3ea] px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-14">
          <div>
            <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] text-[#0c1016] sm:text-5xl">Save your first baseline and make later changes visible.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#246347]">Create an account, add a purchase or subscription, then keep the next useful action beside the record.</p>
          </div>
          <ButtonLink href="/signup" variant="primary">Get started <ArrowUpRightIcon /></ButtonLink>
        </div>
      </section>
    </main>
  )
}
