import { createHash } from 'node:crypto'

export function hashRateLimitKey(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex')
}
