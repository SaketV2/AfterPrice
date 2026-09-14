'use client'

import { useState } from 'react'
import { ArrowUpRightIcon, ButtonLink, CheckIcon } from './marketing-ui'

export function PricingToggle() {
  const [yearly, setYearly] = useState(false)
  const plans = [
    { name: 'Free', detail: 'A clear starting point for your first records.', monthly: '$0', yearly: '$0', cta: 'Try it free', features: ['5 tracked items', 'Weekly monitoring', 'Renewal alerts', 'Basic price tracking', 'Demo access'] },
    { name: 'Pro', detail: 'For people who want the full monitoring loop.', monthly: '$6', yearly: '$59', cta: 'Start with Pro', features: ['Unlimited tracked items', 'Daily monitoring', 'Plan-change detection', 'Historical snapshots', 'Renewal audit', 'Priority alerts'] },
  ]

  return (
    <div>
      <div role="group" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-xl border border-[#cfd5dd] bg-white p-1">
        <button type="button" onClick={() => setYearly(false)} aria-pressed={!yearly} className={['min-h-11 rounded-lg px-5 text-sm font-semibold transition', !yearly ? 'bg-[#0c0f14] text-white' : 'text-[#5d6673] hover:bg-[#eff2f4] hover:text-[#0c0f14]'].join(' ')}>Monthly</button>
        <button type="button" onClick={() => setYearly(true)} aria-pressed={yearly} className={['min-h-11 rounded-lg px-5 text-sm font-semibold transition', yearly ? 'bg-[#0c0f14] text-white' : 'text-[#5d6673] hover:bg-[#eff2f4] hover:text-[#0c0f14]'].join(' ')}>Yearly <span className={['ml-1 text-xs', yearly ? 'text-[#b7bd91]' : 'text-[#3258d4]'].join(' ')}>save $13</span></button>
      </div>
      <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((plan, index) => (
          <section aria-labelledby={`plan-${plan.name}`} key={plan.name} className={['flex flex-col rounded-2xl border p-6 sm:p-8', index === 1 ? 'border-[#101a2a] bg-[#101a2a] text-white' : 'border-[#d8dde5] bg-white'].join(' ')}>
            <div className="flex items-center justify-between gap-4">
              <h2 id={`plan-${plan.name}`} className="text-2xl font-bold tracking-[-0.03em]">{plan.name}</h2>
              {index === 1 && <span className="rounded-full bg-[#b7bd91] px-3 py-1 text-xs font-semibold text-[#192119]">Full loop</span>}
            </div>
            <p className={['mt-3 max-w-xs text-base leading-6', index === 1 ? 'text-[#c0c8d2]' : 'text-[#5d6673]'].join(' ')}>{plan.detail}</p>
            <div aria-live="polite" aria-atomic="true" className="mt-7 flex items-baseline gap-2"><span className="text-5xl font-bold tracking-[-0.04em] tabular-nums sm:text-6xl">{yearly ? plan.yearly : plan.monthly}</span>{plan.name === 'Pro' && <span className="text-sm text-[#c0c8d2]">/{yearly ? 'year' : 'month'}</span>}</div>
            <p className={['mt-2 text-xs', index === 1 ? 'text-[#aab3c0]' : 'text-[#68717e]'].join(' ')}>{yearly ? 'billed annually' : 'no commitment'}</p>
            <div className={['my-8 h-px', index === 1 ? 'bg-[#283241]' : 'bg-[#e1e5ea]'].join(' ')} />
            <ul className="mb-8 flex-1 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-3 text-sm"><span className={['mt-0.5 grid size-5 shrink-0 place-items-center', index === 1 ? 'text-[#b7bd91]' : 'text-[#3258d4]'].join(' ')}><CheckIcon /></span><span className={index === 1 ? 'text-[#f5f7fa]' : 'text-[#3f4854]'}>{feature}</span></li>)}</ul>
            <ButtonLink href="/signup" variant={index === 1 ? 'light' : 'primary'} className="w-full">{plan.cta} <ArrowUpRightIcon /></ButtonLink>
          </section>
        ))}
      </div>
      <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-[#68717e]">Pricing is a product preview. Payment processing is not connected in V1, and this demo will never charge you.</p>
    </div>
  )
}
