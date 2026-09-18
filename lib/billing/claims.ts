import { createHash, randomBytes, randomUUID } from 'node:crypto'

export const PENDING_CHECKOUT_TTL_MS = 24 * 60 * 60 * 1000
export const PENDING_CHECKOUT_COOKIE = 'afterprice_checkout_claim'

export function createPendingCheckoutClaim(): { id: string; token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url')
  return { id: randomUUID(), token, tokenHash: hashClaimToken(token) }
}

export function hashClaimToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function normalizeBillingEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function randomIntegrationSuffix(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const bytes = randomBytes(8)
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}
