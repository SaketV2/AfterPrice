import { describe, expect, it } from 'vitest'

import { cloneSeedData, SEED_DATA } from '../lib/data/seed'
import {
  annualisedPrice,
  filterAlerts,
  filterItems,
  getActiveAlerts,
  getPotentialSavings,
  latestPlanPair,
  percentChange,
} from '../lib/services'

describe('SpendGuard demo data', () => {
  it('ships the required purchase, subscription and alert volume', () => {
    expect(SEED_DATA.items.filter((item) => item.type === 'purchase')).toHaveLength(10)
    expect(SEED_DATA.items.filter((item) => item.type === 'subscription')).toHaveLength(10)
    expect(SEED_DATA.alerts).toHaveLength(12)
  })

  it('clones demo data without sharing mutable references', () => {
    const clone = cloneSeedData()
    clone.alerts[0].resolved = true
    expect(SEED_DATA.alerts[0].resolved).toBe(false)
  })
})

describe('monitoring calculations', () => {
  it('annualises supported billing cycles', () => {
    expect(annualisedPrice(10, 'weekly')).toBe(520)
    expect(annualisedPrice(10, 'monthly')).toBe(120)
    expect(annualisedPrice(10, 'quarterly')).toBe(40)
    expect(annualisedPrice(10, 'annual')).toBe(10)
  })

  it('calculates price changes and open savings', () => {
    expect(percentChange(19, 29)).toBeCloseTo(52.63, 2)
    expect(getPotentialSavings(SEED_DATA)).toBe(428)
  })

  it('returns original and current plan snapshots in semantic order', () => {
    const pair = latestPlanPair(SEED_DATA.planSnapshots.filter((plan) => plan.itemId === 'notion-plus'))
    expect(pair.original?.label).toBe('Original plan')
    expect(pair.current?.label).toBe('Current plan')
  })
})

describe('search and alert state', () => {
  it('filters tracked items by type and related provider text', () => {
    const result = filterItems(SEED_DATA.items, 'amazon', 'purchase')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.type === 'purchase')).toBe(true)
  })

  it('filters alerts by category and excludes resolved or dismissed alerts', () => {
    expect(filterAlerts(SEED_DATA.alerts, '', 'renewal_warning')).toHaveLength(3)
    expect(getActiveAlerts(SEED_DATA.alerts).every((alert) => !alert.resolved && !alert.dismissed)).toBe(true)
  })
})
