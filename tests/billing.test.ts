import { afterEach, describe, expect, it } from 'vitest'
import { createPendingCheckoutClaim, hashClaimToken, normalizeBillingEmail } from '../lib/billing/claims'
import { CHECKOUT_SESSION_ID_PATTERN } from '../lib/billing/validation'
import { getBillingPlan, getPlanKeyForPriceId } from '../lib/billing/plan-config'

const originalEnvironment = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
}

afterEach(() => {
  if (originalEnvironment.monthly === undefined) delete process.env.STRIPE_PRICE_MONTHLY
  else process.env.STRIPE_PRICE_MONTHLY = originalEnvironment.monthly
  if (originalEnvironment.yearly === undefined) delete process.env.STRIPE_PRICE_YEARLY
  else process.env.STRIPE_PRICE_YEARLY = originalEnvironment.yearly
})

describe('billing security boundaries', () => {
  it('generates an opaque claim token whose stored value is only a hash', () => {
    const claim = createPendingCheckoutClaim()
    expect(claim.token).toHaveLength(43)
    expect(claim.tokenHash).toBe(hashClaimToken(claim.token))
    expect(claim.tokenHash).not.toBe(claim.token)
    expect(createPendingCheckoutClaim().token).not.toBe(claim.token)
  })

  it('normalizes email identities before pending-checkout association', () => {
    expect(normalizeBillingEmail('  Person@Example.COM ')).toBe('person@example.com')
  })

  it('accepts both test and live Stripe Checkout session IDs', () => {
    expect(CHECKOUT_SESSION_ID_PATTERN.test('cs_test_123')).toBe(true)
    expect(CHECKOUT_SESSION_ID_PATTERN.test('cs_live_123')).toBe(true)
    expect(CHECKOUT_SESSION_ID_PATTERN.test('cs_fake')).toBe(true)
    expect(CHECKOUT_SESSION_ID_PATTERN.test('pi_test_123')).toBe(false)
  })

  it('maps only server-configured price IDs to known plan keys', () => {
    process.env.STRIPE_PRICE_MONTHLY = 'price_monthly'
    process.env.STRIPE_PRICE_YEARLY = 'price_yearly'
    expect(getBillingPlan('monthly')).toEqual({ key: 'monthly', priceId: 'price_monthly' })
    expect(getPlanKeyForPriceId('price_monthly')).toBe('monthly')
    expect(getPlanKeyForPriceId('price_attacker_supplied')).toBe('unknown')
  })
})
