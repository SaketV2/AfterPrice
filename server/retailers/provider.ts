import 'server-only'

export type RetailProduct = { externalId: string; name: string; brand: string; variant: string; sizeLabel: string; category: 'Biscuits' | 'Chips'; amountCents: number; currency: 'AUD'; sourceUrl: string; observedAt: string }
export type ProviderStatus = { capability: 'authorised_feed' | 'unavailable'; authorised: boolean; reason: string }
export interface RetailerProvider { id: 'coles' | 'woolworths'; name: string; status(): Promise<ProviderStatus>; retrieveProducts(): Promise<RetailProduct[]> }

export class UnavailableRetailerProvider implements RetailerProvider {
  constructor(public id: 'coles' | 'woolworths', public name: string, private reason: string) {}
  async status(): Promise<ProviderStatus> { return { capability: 'unavailable', authorised: false, reason: this.reason } }
  async retrieveProducts(): Promise<RetailProduct[]> { throw new Error(`${this.name} ingestion is disabled: ${this.reason}`) }
}
