import { describe, expect, it } from 'vitest'
import { compareBaseline, latestObservation } from '../features/afterprice/comparison'
import { safeAppPath } from '../lib/auth/redirects'
import type { BaselineRecord, Observation } from '../features/afterprice/types'

const observation = (overrides: Partial<Observation> = {}): Observation => ({ id: crypto.randomUUID(), entity_id: 'entity-a', observation_type: 'price', amount_cents: 500, currency: 'AUD', plan_name: null, billing_interval: null, renewal_at: null, source_name: 'Test seed', source_url: null, observed_at: '2026-09-10T00:00:00Z', origin: 'seed', metadata: {}, created_at: '2026-09-10T00:00:00Z', ...overrides })
const record = (overrides: Partial<BaselineRecord> = {}): BaselineRecord => ({ id: 'baseline-a', user_id: 'user-a', entity_id: 'entity-a', baseline_type: 'purchase', display_name: 'Exact product', original_amount_cents: 500, currency: 'AUD', plan_name: null, billing_interval: null, renewal_at: null, captured_at: '2026-09-01T00:00:00Z', source_url: null, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', entities: { id: 'entity-a', entity_type: 'retail_product', provider: 'Demo', external_id: 'exact-200g', display_name: 'Exact product', brand: 'Brand', variant: 'Original', size_label: '200 g', category: 'Biscuits', source_url: null, metadata: { origin: 'seed' }, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', observations: [observation()] }, ...overrides })

describe('baseline comparisons', () => {
  it.each([[650, 'price_increase'], [350, 'price_decrease'], [500, 'unchanged']] as const)('compares a %i cent observation', (amount, kind) => expect(compareBaseline(record({ entities: { ...record().entities, observations: [observation({ amount_cents: amount })] } })).kind).toBe(kind))
  it('supports a zero baseline without division', () => expect(compareBaseline(record({ original_amount_cents: 0 })).amountDeltaCents).toBe(500))
  it('selects the latest compatible observation', () => expect(latestObservation([observation({ amount_cents: 300, observed_at: '2026-08-01T00:00:00Z' }), observation({ amount_cents: 400, observed_at: '2026-09-01T00:00:00Z' })])?.amount_cents).toBe(400))
  it('reports no observation rather than matching another variant', () => expect(compareBaseline(record({ entities: { ...record().entities, external_id: 'other-170g', variant: 'Barbecue', size_label: '170 g', observations: [] } })).kind).toBe('no_observation'))
  it('detects subscription price and plan changes', () => { const current = observation({ observation_type: 'plan', amount_cents: 1800, plan_name: 'Team', billing_interval: 'monthly' }); const result = compareBaseline(record({ baseline_type: 'subscription', original_amount_cents: 1200, plan_name: 'Plus', billing_interval: 'monthly', entities: { ...record().entities, entity_type: 'subscription', observations: [current] } })); expect(result.kind).toBe('subscription_change'); expect(result.details.join(' ')).toContain('Plan changed') })
  it('detects an upcoming renewal', () => { const current = observation({ observation_type: 'renewal', amount_cents: 1200, plan_name: 'Plus', billing_interval: 'monthly', renewal_at: '2026-09-25T00:00:00Z' }); expect(compareBaseline(record({ baseline_type: 'subscription', original_amount_cents: 1200, plan_name: 'Plus', billing_interval: 'monthly', entities: { ...record().entities, entity_type: 'subscription', observations: [current] } }), new Date('2026-09-14T00:00:00Z')).kind).toBe('renewal_approaching') })
  it('reports changed renewal information', () => { const current = observation({ observation_type: 'renewal', amount_cents: 1200, renewal_at: '2026-10-01T00:00:00Z' }); const result = compareBaseline(record({ baseline_type: 'subscription', plan_name: 'Plus', billing_interval: 'monthly', renewal_at: '2026-09-20T00:00:00Z', entities: { ...record().entities, entity_type: 'subscription', observations: [current] } }), new Date('2026-09-14T00:00:00Z')); expect(result.details.join(' ')).toContain('Renewal changed') })
  it('reports no observation', () => expect(compareBaseline(record({ entities: { ...record().entities, observations: [] } })).kind).toBe('no_observation'))
})

describe('safe return paths', () => {
  it('accepts internal app paths', () => expect(safeAppPath('/app/baselines/123?view=full')).toBe('/app/baselines/123?view=full'))
  it.each(['https://attacker.example', '//attacker.example', '/application', '/app\\evil'])('rejects %s', value => expect(safeAppPath(value)).toBe('/app'))
})
