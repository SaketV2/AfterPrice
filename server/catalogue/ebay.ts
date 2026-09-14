import 'server-only'

import { normalizeCatalogueProduct } from './normalization'
import type { NormalizedCatalogueProduct, ProductCatalogueProvider } from './types'

type EbayConfig = {
  clientId: string
  clientSecret: string
  apiRoot: string
  marketplaceId: string
}

type EbayProductSummary = {
  epid?: string
  title?: string
  brand?: string
  mpn?: string[]
  gtin?: string[]
  productWebUrl?: string
  image?: { imageUrl?: string }
}

type EbayProductSummaryResponse = { productSummaries?: EbayProductSummary[] }

let accessToken: { value: string; expiresAt: number } | null = null

function getConfig(): EbayConfig | null {
  const clientId = process.env.EBAY_CLIENT_ID?.trim()
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null
  const sandbox = process.env.EBAY_ENVIRONMENT?.toLowerCase() === 'sandbox'
  return {
    clientId,
    clientSecret,
    apiRoot: sandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com',
    marketplaceId: process.env.EBAY_MARKETPLACE_ID?.trim() || 'EBAY_AU',
  }
}

async function getApplicationToken(config: EbayConfig): Promise<string> {
  if (accessToken && accessToken.expiresAt > Date.now() + 60_000) return accessToken.value
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const response = await fetch(`${config.apiRoot}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fcommerce.catalog.readonly',
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`eBay OAuth failed with HTTP ${response.status}`)
  const data = await response.json() as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('eBay OAuth response did not contain an access token')
  accessToken = { value: data.access_token, expiresAt: Date.now() + Math.max(60, data.expires_in ?? 7200) * 1000 }
  return data.access_token
}

export class EbayCatalogueProvider implements ProductCatalogueProvider {
  readonly id = 'ebay-catalog'

  status() {
    return { id: this.id, available: Boolean(getConfig()), reason: getConfig() ? undefined : 'EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are not configured.' }
  }

  async search(query: string, options: { limit?: number } = {}) {
    return this.fetchSummaries({ q: query, limit: options.limit })
  }

  async lookupByGtin(gtin: string) {
    return this.fetchSummaries({ gtin, limit: 5 })
  }

  async lookupByExternalId(id: string) {
    const config = getConfig()
    if (!config || !/^\d{1,30}$/.test(id)) return null
    const token = await getApplicationToken(config)
    const response = await fetch(`${config.apiRoot}/commerce/catalog/v1_beta/product/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'X-EBAY-C-MARKETPLACE-ID': config.marketplaceId },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`eBay catalog lookup failed with HTTP ${response.status}`)
    }
    return this.normalize(await response.json())
  }

  normalize(result: unknown): NormalizedCatalogueProduct | null {
    const raw = result as EbayProductSummary
    if (!raw || typeof raw !== 'object' || typeof raw.title !== 'string' || !raw.title.trim()) return null
    const identifiers = {
      ...(Array.isArray(raw.gtin) ? { gtin: raw.gtin } : {}),
      ...(Array.isArray(raw.mpn) ? { mpn: raw.mpn } : {}),
      ...(raw.epid ? { epid: [raw.epid] } : {}),
    }
    const brand = typeof raw.brand === 'string' ? raw.brand : undefined
    const modelNumber = Array.isArray(raw.mpn) && typeof raw.mpn[0] === 'string' ? raw.mpn[0] : undefined
    return normalizeCatalogueProduct({
      canonicalKey: raw.epid ? `ebay:${raw.epid}` : undefined,
      provider: this.id,
      providerProductId: raw.epid,
      displayName: raw.title,
      brand,
      modelNumber,
      category: 'Audio / ANC headphones',
      imageUrl: raw.image?.imageUrl,
      sourceUrl: raw.productWebUrl,
      aliases: [raw.title],
      identifiers,
      metadata: { source: 'ebay-catalog', provider_product_id: raw.epid },
    })
  }

  private async fetchSummaries(params: { q?: string; gtin?: string; limit?: number }) {
    const config = getConfig()
    if (!config) return []
    const limit = Math.max(1, Math.min(params.limit ?? 5, 10))
    const query = new URLSearchParams({ limit: String(limit) })
    if (params.q) query.set('q', params.q.slice(0, 80))
    if (params.gtin) query.set('gtin', params.gtin.slice(0, 32))
    const token = await getApplicationToken(config)
    const response = await fetch(`${config.apiRoot}/commerce/catalog/v1_beta/product_summary/search?${query}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'X-EBAY-C-MARKETPLACE-ID': config.marketplaceId },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error(`eBay catalog search failed with HTTP ${response.status}`)
    const data = await response.json() as EbayProductSummaryResponse
    return (data.productSummaries ?? []).map(item => this.normalize(item)).filter((item): item is NormalizedCatalogueProduct => Boolean(item))
  }
}

export function getCatalogueProviders(): ProductCatalogueProvider[] {
  return [new EbayCatalogueProvider()]
}
