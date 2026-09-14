import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

export const SUPPORTED_REMOTE_HOSTS = [
  'api.ebay.com',
  'api.sandbox.ebay.com',
  'www.ebay.com',
  'www.ebay.com.au',
  'ebay.com',
  'ebay.com.au',
  'amazon.com',
  'amazon.com.au',
  'www.amazon.com',
  'www.amazon.com.au',
  'apple.com',
  'www.apple.com',
  'sony.com',
  'www.sony.com',
  'bose.com',
  'www.bose.com',
  'sennheiser-hearing.com',
  'www.sennheiser-hearing.com',
  'sonos.com',
  'www.sonos.com',
  'beatsbydre.com',
  'www.beatsbydre.com',
] as const

export type UrlSafetyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string }

function hostMatches(hostname: string, allowedHosts: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return allowedHosts.some(allowed => host === allowed.toLowerCase())
}

function isPrivateIpv4(address: string): boolean {
  const octets = address.split('.').map(Number)
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true
  const [a, b] = octets
  return a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19) || a === 198 && b === 51 || a === 203 && b === 0
}

function isPrivateAddress(address: string): boolean {
  const normalised = address.toLowerCase().replace(/^\[|\]$/g, '')
  if (isIP(normalised) === 4) return isPrivateIpv4(normalised)
  if (isIP(normalised) === 6) {
    if (normalised === '::' || normalised === '::1' || normalised.startsWith('fc') || normalised.startsWith('fd') || normalised.startsWith('fe8') || normalised.startsWith('fe9') || normalised.startsWith('fea') || normalised.startsWith('feb')) return true
    if (normalised.startsWith('::ffff:')) return isPrivateIpv4(normalised.slice('::ffff:'.length))
  }
  return true
}

export function validateSupportedUrl(value: string, allowedHosts: readonly string[] = SUPPORTED_REMOTE_HOSTS): UrlSafetyResult {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return { ok: false, reason: 'The URL is invalid.' }
  }
  if (url.protocol !== 'https:') return { ok: false, reason: 'Only HTTPS URLs are supported.' }
  if (url.username || url.password) return { ok: false, reason: 'URLs containing credentials are not allowed.' }
  if (url.port && url.port !== '443') return { ok: false, reason: 'Custom ports are not allowed.' }
  if (!hostMatches(url.hostname, allowedHosts)) return { ok: false, reason: 'The URL host is not a supported provider domain.' }
  if (isIP(url.hostname) && isPrivateAddress(url.hostname)) return { ok: false, reason: 'Private and loopback addresses are not allowed.' }
  return { ok: true, url }
}

export async function resolveAndValidateUrl(value: string, allowedHosts: readonly string[] = SUPPORTED_REMOTE_HOSTS): Promise<UrlSafetyResult> {
  const structural = validateSupportedUrl(value, allowedHosts)
  if (!structural.ok) return structural
  try {
    const addresses = await lookup(structural.url.hostname, { all: true, verbatim: true })
    if (!addresses.length || addresses.some(address => isPrivateAddress(address.address))) return { ok: false, reason: 'The URL resolves to a private or unavailable address.' }
  } catch {
    return { ok: false, reason: 'The URL host could not be resolved safely.' }
  }
  return structural
}

export function isSafeRedirect(response: Response): boolean {
  return response.status < 300 || response.status >= 400
}
