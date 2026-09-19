import { describe, expect, it } from 'vitest'
import { publicErrorPayload } from './public-error'

describe('public server errors', () => {
  it('contains only the stable public contract and request id', () => {
    expect(publicErrorPayload('CATALOGUE_UNAVAILABLE', 'Try again later.', 'request-123')).toEqual({
      error: 'Try again later.',
      code: 'CATALOGUE_UNAVAILABLE',
      requestId: 'request-123',
    })
  })
})
