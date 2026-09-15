import { ArrowUpRightIcon, ButtonLink, FaqAccordion } from '@/components/marketing/marketing-ui'
import { faqItems } from '@/components/marketing/marketing-data'

export const metadata = { title: 'FAQ' }

export default function FaqPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="border-b border-[#d5d1c8] bg-[#fbfaf7] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">The useful answers.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">AfterPrice is specific about what the current product can monitor and what still belongs to you.</p>
        </div>
      </section>
      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
        <div className="mx-auto max-w-3xl"><FaqAccordion items={faqItems} /><div className="mt-14 flex flex-col justify-between gap-6 rounded-2xl bg-[#dce4ba] p-6 sm:flex-row sm:items-center sm:p-8"><div><h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-[-0.03em]">See one change with its evidence.</h2><p className="mt-2 text-sm leading-6 text-[#3d4a28]">The product demo is the fastest way to understand the record.</p></div><ButtonLink href="/demo">Open the demo <ArrowUpRightIcon /></ButtonLink></div></div>
      </section>
    </main>
  )
}
