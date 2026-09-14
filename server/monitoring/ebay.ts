import 'server-only'

import type { NormalizedCatalogueProduct } from '@/server/catalogue/types'
import type { PriceObservation, ProductPriceSource } from './types'
import { resolveAndValidateUrl, SUPPORTED_REMOTE_HOSTS, isSafeRedirect } from './url-safety'

type EbayConfig = { clientId: string; clientSecret: string; apiRoot: string; marketplaceId: string }
type EbayItemSummary = { itemId?: string; itemWebUrl?: string; itemAffiliateWebUrl?: string; price?: { value?: string; currency?: string }; availability?: { estimatedAvailabilityStatus?: string } }
type EbaySearchResponse = { itemSummaries?: EbayItemSummary[] }
let tokenCache: { value: string; expiresAt: number } | null = null

function config(): EbayConfig | null {
  const clientId = process.env.EBAY_CLIENT_ID?.trim()
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null
  return {
    clientId,
    clientSecret,
    apiRoot: process.env.EBAY_ENVIRONMENT?.toLowerCase() === 'sandbox' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com',
    marketplaceId: process.env.EBAY_MARKETPLACE_ID?.trim() || 'EBAY_AU',
  }
}

async function token(value: EbayConfig): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value
  const auth = Buffer.from(`${value.clientId}:${value.clientSecret}`).toString('base64')
  const response = await fetch(`${value.apiRoot}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`eBay OAuth failed with HTTP ${response.status}`)
  const data = await response.json() as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('eBay OAuth response did not contain an access token')
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Math.max(data.expires_in ?? 7200, 60) * 1000 }
  return data.access_token
}

export class EbayBrowsePriceSource implements ProductPriceSource {
  readonly id = 'ebay-browse'

  status() {
    return { id: this.id, available: Boolean(config()), reason: config() ? undefined : 'EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are not configured.' }
  }

  supports(product: NormalizedCatalogueProduct): boolean {
    const category = product.category?.toLowerCase() ?? ''
    return category.includes('audio') || category.includes('headphone') || product.displayName.toLowerCase().includes('headphone')
  }

  async observe(product: NormalizedCatalogueProduct): Promise<PriceObservation | null> {
    const value = config()
    if (!value) return null
    const query = new URLSearchParams({ limit: '1', sort: 'price' })
    const epid = product.identifiers.epid?.[0] ?? (product.provider === 'ebay-catalog' ? product.providerProductId : undefined)
    if (epid && /^\d{1,30}$/.test(epid)) query.set('epid', epid)
    else query.set('q', product.displayName.slice(0, 80))
    const apiUrl = `${value.apiRoot}/buy/browse/v1/item_summary/search?${query}`
    const safeApiUrl = await resolveAndValidateUrl(apiUrl, SUPPORTED_REMOTE_HOSTS)
    if (!safeApiUrl.ok) throw new Error(safeApiUrl.reason)
    const response = await fetch(safeApiUrl.url, {
      headers: { Authorization: `Bearer ${await token(value)}`, Accept: 'application/json', 'X-EBAY-C-MARKETPLACE-ID': value.marketplaceId },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    })
    if (!isSafeRedirect(response)) throw new Error('eBay returned an unexpected redirect; the response was not followed.')
    if (!response.ok) throw new Error(`eBay Browse search failed with HTTP ${response.status}`)
    const data = await response.json() as EbaySearchResponse
    const item = data.itemSummaries?.[0]
    const rawValue = item?.price?.value
    const price = rawValue ? Number(rawValue) : NaN
    if (!item?.itemId || !Number.isFinite(price) || price < 0) return null
    const sourceUrl = item.itemAffiliateWebUrl ?? item.itemWebUrl ?? safeApiUrl.url.toString()
    const safeSourceUrl = await resolveAndValidateUrl(sourceUrl, SUPPORTED_REMOTE_HOSTS)
    if (!safeSourceUrl.ok) throw new Error(`eBay listing URL rejected: ${safeSourceUrl.reason}`)
    return {
      canonicalKey: product.canonicalKey,
      sourceId: this.id,
      sourceName: 'eBay Browse API',
      sourceListingId: item.itemId,
      sourceUrl: safeSourceUrl.url.toString(),
      priceCents: Math.round(price * 100),
      currency: item.price?.currency || 'AUD',
      availability: item.availability?.estimatedAvailabilityStatus === 'IN_STOCK' ? 'in_stock' : 'unknown',
      observedAt: new Date().toISOString(),
      metadata: { provider: 'ebay-browse', epid: epid ?? null },
    }
  }
}

export function getPriceSources(): ProductPriceSource[] {
  return [new EbayBrowsePriceSource()]
}
