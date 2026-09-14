import type { PriceObservation, ProductOpportunity, ReturnWindowStatus } from './types'

export type ProductOpportunityInput = {
  canonicalKey: string
  paidAmountCents: number
  purchaseDate: string
  returnDeadline?: string | null
  returnDeadlineConfidence?: 'user_confirmed' | 'estimated' | 'unknown'
  observation: PriceObservation
}

function returnWindow(deadline: string | null | undefined, now: Date): ReturnWindowStatus {
  if (!deadline) return 'unknown'
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return 'unknown'
  return date.getTime() >= now.getTime() ? 'active' : 'expired'
}

export function calculateProductOpportunity(input: ProductOpportunityInput, now = new Date()): ProductOpportunity {
  const confidence = input.returnDeadlineConfidence === 'user_confirmed' ? 'high' : input.returnDeadlineConfidence === 'estimated' ? 'estimated' : 'unknown'
  if (input.observation.canonicalKey !== input.canonicalKey) {
    return { status: 'variant_mismatch', potentialSavingCents: 0, priceDeltaCents: 0, returnWindow: 'unknown', actionable: false, reason: 'The observed listing does not match the canonical product identity.', confidence }
  }
  const purchaseDate = new Date(input.purchaseDate)
  const observedAt = new Date(input.observation.observedAt)
  if (Number.isNaN(purchaseDate.getTime()) || Number.isNaN(observedAt.getTime()) || observedAt.getTime() <= purchaseDate.getTime()) {
    return { status: 'not_actionable', potentialSavingCents: 0, priceDeltaCents: 0, returnWindow: returnWindow(input.returnDeadline, now), actionable: false, reason: 'Only observations after the purchase date can create a price-drop opportunity.', confidence }
  }
  const priceDeltaCents = input.paidAmountCents - input.observation.priceCents
  const potentialSavingCents = Math.max(priceDeltaCents, 0)
  const window = returnWindow(input.returnDeadline, now)
  if (priceDeltaCents <= 0) {
    return { status: 'no_opportunity', potentialSavingCents: 0, priceDeltaCents, returnWindow: window, actionable: false, reason: priceDeltaCents === 0 ? 'The comparable price matches the purchase price.' : 'The comparable price is higher than the purchase price.', confidence }
  }
  if (window === 'expired') {
    return { status: 'not_actionable', potentialSavingCents, priceDeltaCents, returnWindow: window, actionable: false, reason: 'A lower comparable price was observed after the return window expired.', confidence }
  }
  if (window === 'unknown') {
    return { status: 'not_actionable', potentialSavingCents, priceDeltaCents, returnWindow: window, actionable: false, reason: 'A saving was observed, but the return deadline is unknown. Check retailer conditions.', confidence }
  }
  return { status: 'opportunity', potentialSavingCents, priceDeltaCents, returnWindow: window, actionable: true, reason: 'A lower comparable price was observed while the estimated or confirmed return window is active.', confidence }
}
