import { describe, expect, it } from 'vitest'
import { safeAppPath } from './redirects'

describe('safeAppPath', () => {
  it('preserves query parameters on the app root for verified checkout handoffs', () => {
    expect(safeAppPath('/app?checkout=claim&session_id=cs_test')).toBe('/app?checkout=claim&session_id=cs_test')
  })

  it('rejects external and ambiguous paths', () => {
    expect(safeAppPath('https://example.com')).toBe('/app')
    expect(safeAppPath('/app.evil')).toBe('/app')
  })
})
