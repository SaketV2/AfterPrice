import 'server-only'
import type { RetailerProvider } from './provider'

export async function collectAuthorisedProducts(provider: RetailerProvider) {
  const status = await provider.status()
  if (!status.authorised || status.capability !== 'authorised_feed') throw new Error(`${provider.name} live ingestion blocked: ${status.reason}`)
  return provider.retrieveProducts()
}
