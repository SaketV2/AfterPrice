import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { searchCatalogue } = vi.hoisted(() => ({ searchCatalogue: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } } }) } }),
}))
vi.mock('@/server/catalogue/service', () => ({ searchCatalogue }))

import { POST as manualPreview } from './manual/route'
import { GET as catalogueSearch } from './search/route'

afterEach(() => {
  searchCatalogue.mockReset()
  vi.restoreAllMocks()
})

describe('catalogue route contracts', () => {
  it('returns a manual preview without claiming resource creation', async () => {
    const response = await manualPreview(new Request('http://localhost/api/catalogue/manual', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: 'User supplied product' }),
    }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ persisted: false, mode: 'manual_preview' })
  })

  it('replaces internal catalogue failures with a stable public error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    searchCatalogue.mockRejectedValue(new Error('sensitive provider response'))

    const response = await catalogueSearch(new NextRequest('http://localhost/api/catalogue/search?q=test'))
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body).toMatchObject({ code: 'CATALOGUE_UNAVAILABLE', error: 'Catalogue search is temporarily unavailable.' })
    expect(body.requestId).toEqual(expect.any(String))
    expect(JSON.stringify(body)).not.toContain('sensitive provider response')
  })
})
