'use client'

import { useState } from 'react'
import { ArrowUpRightIcon, ButtonLink, CheckIcon } from './marketing-ui'
import styles from './marketing.module.css'

function ProCheckoutAction({ planKey }: { planKey: 'monthly' | 'yearly' }) {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function startCheckout() {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: planKey, ...(email.trim() ? { email: email.trim() } : {}) }),
      })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error ?? 'Checkout could not be started.')
      window.location.assign(result.url)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout could not be started.')
      setPending(false)
    }
  }

  return <div className={styles.checkoutAction}>
    <label className={styles.checkoutEmail}><span>Email for account setup <small>(optional when signed in)</small></span><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" /></label>
    {error && <p role="alert" className={styles.checkoutError}>{error}</p>}
    <button type="button" onClick={() => void startCheckout()} disabled={pending} className={[styles.buttonBase, styles.buttonLight, 'w-full'].join(' ')}>{pending ? 'Opening secure checkout…' : 'Start with Pro'} <ArrowUpRightIcon /></button>
  </div>
}

export function PricingToggle() {
  const [yearly, setYearly] = useState(false)
  const plans = [
    { name: 'Free', detail: 'A clear starting point for the records you add.', monthly: 'A$0', yearly: 'A$0', cta: 'Create a free account', features: ['Add purchase and subscription baselines', 'Keep observations and source evidence', 'Review changes in a private account', 'No payment details required'] },
    { name: 'Pro', detail: 'For the full monitoring loop, with a monthly or yearly subscription.', monthly: 'A$6', yearly: 'A$59', cta: 'Start with Pro', features: ['Everything in Free', 'Hosted Checkout and billing management', 'Webhook-confirmed account access', 'Choose monthly or yearly billing'] },
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
        <p className={styles.pricingBillingNote}>{index === 1 ? 'Hosted by Stripe · cancel in the portal' : 'No commitment'}</p>
        <div className={styles.pricingDivider} />
        <ul className={styles.pricingFeatures}>{plan.features.map(feature => <li key={feature} className={styles.pricingFeature}><CheckIcon /><span>{feature}</span></li>)}</ul>
        {index === 1 ? <ProCheckoutAction planKey={yearly ? 'yearly' : 'monthly'} /> : <ButtonLink href="/signup" variant="primary" className="w-full">{plan.cta} <ArrowUpRightIcon /></ButtonLink>}
      </section>)}
    </div>
    <p className={styles.pricingFootnote}>Pro payments use Stripe-hosted Checkout. AfterPrice never receives your full card details, and your access is confirmed by the server after webhook processing.</p>
  </div>
}
