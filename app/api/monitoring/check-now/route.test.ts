import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  class ProRequiredError extends Error {}
  return {
    ProRequiredError,
    createClient: vi.fn(),
    createServiceRoleClient: vi.fn(),
    requireProEntitlement: vi.fn(),
    consumeAccountRateLimit: vi.fn(),
    findProductById: vi.fn(),
    getPriceSources: vi.fn(),
    createPurchaseAlerts: vi.fn(),
    persistObservation: vi.fn(),
    checkProductNow: vi.fn(),
  }
})

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))
vi.mock('@/lib/supabase/service', () => ({ createServiceRoleClient: mocks.createServiceRoleClient }))
vi.mock('@/server/billing/pro-authorization', () => ({
  ProRequiredError: mocks.ProRequiredError,
  requireProEntitlement: mocks.requireProEntitlement,
}))
vi.mock('@/server/security/rate-limit', () => ({ consumeAccountRateLimit: mocks.consumeAccountRateLimit }))
vi.mock('@/server/catalogue/local', () => ({ findProductById: mocks.findProductById }))
vi.mock('@/server/monitoring/ebay', () => ({ getPriceSources: mocks.getPriceSources }))
vi.mock('@/server/monitoring/alerts', () => ({ createPurchaseAlerts: mocks.createPurchaseAlerts }))
vi.mock('@/server/monitoring/observation', () => ({ persistObservation: mocks.persistObservation }))
vi.mock('@/server/monitoring/scheduler', () => ({ checkProductNow: mocks.checkProductNow }))

import { POST } from './route'

const productId = '00000000-0000-4000-8000-000000000001'

function request() {
  return new Request('http://localhost/api/monitoring/check-now', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ catalogProductId: productId }),
  })
}

function authenticatedClient(ownership: { data: { id: string } | null; error: unknown }) {
  const query: Record<string, ReturnType<typeof vi.fn>> = {}
  query.select = vi.fn(() => query)
  query.eq = vi.fn(() => query)
  query.limit = vi.fn(() => query)
  query.maybeSingle = vi.fn(async () => ownership)
  return {
    auth: { getClaims: vi.fn(async () => ({ data: { claims: { sub: 'user-1' } } })) },
    from: vi.fn(() => query),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.createClient.mockResolvedValue(authenticatedClient({ data: { id: 'purchase-1' }, error: null }))
  mocks.requireProEntitlement.mockResolvedValue({ entitled: true })
  mocks.consumeAccountRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 })
  mocks.findProductById.mockResolvedValue({ catalogProductId: productId, canonicalKey: 'product-1' })
  mocks.createServiceRoleClient.mockReturnValue({ writer: true })
  mocks.getPriceSources.mockReturnValue([{ id: 'ebay', status: () => ({ available: true }) }])
  mocks.checkProductNow.mockResolvedValue({ productKey: 'product-1', checkedAt: '2026-09-19T00:00:00Z', results: [] })
  mocks.createPurchaseAlerts.mockResolvedValue(0)
})

describe('manual monitoring authorization', () => {
  it('rejects unauthenticated requests', async () => {
    mocks.createClient.mockResolvedValue({ auth: { getClaims: async () => ({ data: null }) } })
    const response = await POST(request())
    expect(response.status).toBe(401)
    expect(mocks.requireProEntitlement).not.toHaveBeenCalled()
  })

  it('returns a non-enumerating 404 for a catalogue product the user does not own', async () => {
    mocks.createClient.mockResolvedValue(authenticatedClient({ data: null, error: null }))
    const response = await POST(request())
    expect(response.status).toBe(404)
    expect(mocks.requireProEntitlement).not.toHaveBeenCalled()
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled()
  })

  it('denies an owning Free user before rate limiting or provider work', async () => {
    mocks.requireProEntitlement.mockRejectedValue(new mocks.ProRequiredError())
    const response = await POST(request())
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({ code: 'PRO_REQUIRED' })
    expect(mocks.consumeAccountRateLimit).not.toHaveBeenCalled()
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled()
  })

  it('returns 429 when an entitled owner exceeds the account limit', async () => {
    mocks.consumeAccountRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 120 })
    const response = await POST(request())
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('120')
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled()
  })

  it('permits an entitled, under-limit owner and only then starts service work', async () => {
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(mocks.requireProEntitlement).toHaveBeenCalledWith('user-1')
    expect(mocks.consumeAccountRateLimit).toHaveBeenCalledWith({ key: 'monitoring:check-now:user-1', limit: 5, windowSeconds: 900 })
    expect(mocks.createServiceRoleClient).toHaveBeenCalledOnce()
    expect(mocks.checkProductNow).toHaveBeenCalledOnce()
  })
})
