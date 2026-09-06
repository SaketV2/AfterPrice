import { Eyebrow, FaqAccordion } from '@/components/marketing/marketing-ui'
import { faqItems } from '@/components/marketing/marketing-data'

export const metadata = { title: 'FAQ' }

export default function FaqPage() {
  return <main><section className="px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10"><div className="mx-auto max-w-3xl text-center"><Eyebrow>Questions, without the fog</Eyebrow><h1 className="font-[family-name:var(--font-display)] text-5xl font-750 leading-[.96] tracking-[-.07em] sm:text-7xl">The useful answers.</h1><p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">SpendGuard is deliberately clear about what the V1 demo can monitor and what still belongs to you.</p></div></section><section className="px-5 pb-28 sm:px-8 sm:pb-40 lg:px-10"><div className="mx-auto max-w-3xl"><FaqAccordion items={faqItems} /><div className="mt-14 rounded-[28px] bg-[#e7eafe] p-7 sm:p-10"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#5967e8]">Still deciding?</p><h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-700 leading-tight tracking-[-.05em]">The fastest answer is inside the interactive demo.</h2><a href="/demo" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#0c0f14] px-5 text-sm font-semibold text-white transition hover:bg-[#2a2f37]">Open the demo <span className="ml-2" aria-hidden="true">↗</span></a></div></div></section></main>
}
