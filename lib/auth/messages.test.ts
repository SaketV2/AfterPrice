import { describe, expect, it } from 'vitest'
import { publicSignupError } from './messages'

describe('signup public failures', () => {
  it('does not reveal whether an account already exists', () => {
    expect(publicSignupError(new Error('User already registered')))
      .toBe(publicSignupError(new Error('SMTP provider unavailable')))
  })
})
