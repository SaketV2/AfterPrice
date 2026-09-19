import { afterEach, describe, expect, it } from 'vitest'
import { createPendingCheckoutClaim, hashClaimToken, normalizeBillingEmail } from '../lib/billing/claims'
import { CHECKOUT_SESSION_ID_PATTERN } from '../lib/billing/validation'
import { getBillingPlan, getPlanKeyForPriceId } from '../lib/billing/plan-config'
import { isEntitledBillingSubscription } from '../lib/billing/entitlement'
import { checkoutIdempotencyKey } from '../lib/billing/checkout-key'
import { hashRateLimitKey } from '../lib/billing/rate-limit'

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

  it.each([
    ['no subscription', { status: 'canceled', payment_state: 'paid', plan_key: 'monthly', current_period_end: null }, false],
    ['active and paid', { status: 'active', payment_state: 'paid', plan_key: 'monthly', current_period_end: '2026-10-01T00:00:00Z' }, true],
    ['trialing and no payment required', { status: 'trialing', payment_state: 'no_payment_required', plan_key: 'yearly', current_period_end: '2026-10-01T00:00:00Z' }, true],
    ['past due', { status: 'past_due', payment_state: 'paid', plan_key: 'monthly', current_period_end: '2026-10-01T00:00:00Z' }, false],
    ['unpaid', { status: 'active', payment_state: 'unpaid', plan_key: 'monthly', current_period_end: '2026-10-01T00:00:00Z' }, false],
    ['cancelled', { status: 'canceled', payment_state: 'paid', plan_key: 'monthly', current_period_end: '2026-10-01T00:00:00Z' }, false],
    ['expired period', { status: 'active', payment_state: 'paid', plan_key: 'monthly', current_period_end: '2026-09-01T00:00:00Z' }, false],
  ])('applies the Pro entitlement matrix: %s', (_label, row, expected) => {
    expect(isEntitledBillingSubscription(row, new Date('2026-09-19T00:00:00Z'))).toBe(expected)
  })

  it('hashes rate-limit identifiers without persisting raw PII', () => {
    const email = 'person@example.com'
    const hash = hashRateLimitKey(`checkout:guest-email:${email}`)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain(email)
  })

  it('uses a per-attempt, non-PII Stripe Checkout idempotency key', () => {
    expect(checkoutIdempotencyKey('attempt_123')).toBe('afterprice_checkout_attempt_123')
    expect(checkoutIdempotencyKey('attempt_123')).not.toContain('person@example.com')
  })
})
