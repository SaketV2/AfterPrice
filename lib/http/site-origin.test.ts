import { describe, expect, it } from 'vitest'
import { getPublicSiteOrigin } from './site-origin'

describe('public site origin', () => {
  it('uses a valid configured HTTP(S) origin', () => {
    expect(getPublicSiteOrigin({ NEXT_PUBLIC_SITE_URL: 'https://example.com', NODE_ENV: 'production' })).toBe('https://example.com')
  })

  it('uses safe production and development fallbacks', () => {
    expect(getPublicSiteOrigin({ NEXT_PUBLIC_SITE_URL: 'javascript:alert(1)', NODE_ENV: 'production' })).toBe('https://afterprice.vercel.app')
    expect(getPublicSiteOrigin({ NEXT_PUBLIC_SITE_URL: 'https://example.com/path', NODE_ENV: 'production' })).toBe('https://afterprice.vercel.app')
    expect(getPublicSiteOrigin({ NODE_ENV: 'development' })).toBe('http://localhost:3000')
  })
})
