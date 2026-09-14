import { PricingToggle } from '@/components/marketing/pricing-toggle'

export const metadata = { title: 'Pricing' }

export default function PricingPage() {
  return (
    <main>
      <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">Pay for more watching, not more noise.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">Choose the number of records you need to keep and the depth of history you want to inspect. The checkout is not connected in this prototype.</p>
        </div>
      </section>
      <section className="px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10"><PricingToggle /></section>
      <section className="border-y border-[#e1e5ea] bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">No charge is taken here.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5d6673]">AfterPrice V1 does not connect to your bank, submit claims or process payments. Use the demo to inspect the workflow before a production service exists.</p>
        </div>
      </section>
    </main>
  )
}
