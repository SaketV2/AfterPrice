'use client'

import { useState } from 'react'
import { ArrowUpRightIcon, ButtonLink, CheckIcon } from './marketing-ui'
import styles from './marketing.module.css'

export function PricingToggle() {
  const [yearly, setYearly] = useState(false)
  const plans = [
    { name: 'Free', detail: 'A clear starting point for your first records.', monthly: '$0', yearly: '$0', cta: 'Try it free', features: ['5 tracked items', 'Weekly monitoring', 'Renewal alerts', 'Basic price tracking', 'Demo access'] },
    { name: 'Pro', detail: 'For people who want the full monitoring loop.', monthly: '$6', yearly: '$59', cta: 'Start with Pro', features: ['Unlimited tracked items', 'Daily monitoring', 'Plan-change detection', 'Historical snapshots', 'Renewal audit', 'Priority alerts'] },
  ]

  return <div>
    <div role="group" aria-label="Billing period" className={styles.billingToggle}>
      <button type="button" onClick={() => setYearly(false)} aria-pressed={!yearly} className={[styles.billingButton, !yearly ? styles.billingButtonActive : ''].join(' ')}>Monthly</button>
      <button type="button" onClick={() => setYearly(true)} aria-pressed={yearly} className={[styles.billingButton, yearly ? styles.billingButtonActive : ''].join(' ')}>Yearly <span className={styles.billingSavings}>save $13</span></button>
    </div>
    <div className={styles.pricingPlans}>
      {plans.map((plan, index) => <section aria-labelledby={`plan-${plan.name}`} key={plan.name} className={[styles.pricingPlan, index === 1 ? styles.pricingPlanFeatured : ''].join(' ')}>
        <div className={styles.pricingPlanHeader}><h2 id={`plan-${plan.name}`}>{plan.name}</h2>{index === 1 && <span className={styles.pricingPlanBadge}>Full loop</span>}</div>
        <p className={styles.pricingPlanDetail}>{plan.detail}</p>
        <div aria-live="polite" aria-atomic="true" className={styles.pricingAmount}><strong>{yearly ? plan.yearly : plan.monthly}</strong>{plan.name === 'Pro' && <span>/{yearly ? 'year' : 'month'}</span>}</div>
        <p className={styles.pricingBillingNote}>{yearly ? 'billed annually' : 'no commitment'}</p>
        <div className={styles.pricingDivider} />
        <ul className={styles.pricingFeatures}>{plan.features.map(feature => <li key={feature} className={styles.pricingFeature}><CheckIcon /><span>{feature}</span></li>)}</ul>
        <ButtonLink href="/signup" variant={index === 1 ? 'light' : 'primary'} className="w-full">{plan.cta} <ArrowUpRightIcon /></ButtonLink>
      </section>)}
    </div>
    <p className={styles.pricingFootnote}>Pricing is a product preview. Payment processing is not connected in V1, and this demo will never charge you.</p>
  </div>
}
