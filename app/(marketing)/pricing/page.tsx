import { Eyebrow, SectionIntro } from '@/components/marketing/marketing-ui'
import { PricingToggle } from '@/components/marketing/pricing-toggle'

export const metadata = { title: 'Pricing' }

export default function PricingPage() {
  return <main><section className="px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24 lg:px-10"><div className="mx-auto max-w-3xl text-center"><Eyebrow>Simple by design</Eyebrow><h1 className="font-[family-name:var(--font-display)] text-5xl font-750 leading-[.96] tracking-[-.07em] sm:text-7xl">Pay for more watching, not more noise.</h1><p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">Start with the essentials, then choose Pro when you want unlimited tracking and deeper plan history.</p></div></section><section className="px-5 pb-28 sm:px-8 sm:pb-40 lg:px-10"><PricingToggle /></section><section className="border-y border-[#e1e5ea] bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-4xl"><SectionIntro align="center" eyebrow="No hidden machinery" title="The honest version of pricing." description="SpendGuard does not connect to your bank, submit claims or process payments in V1. You can explore the product before you decide whether it belongs in your routine." /></div></section></main>
}
