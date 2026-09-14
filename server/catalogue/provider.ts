import type { ProductCatalogueProvider } from './types'

export class UnavailableCatalogueProvider implements ProductCatalogueProvider {
  constructor(
    public readonly id: string,
    private readonly unavailableReason: string,
  ) {}

  status() {
    return { id: this.id, available: false, reason: this.unavailableReason }
  }

  async search() { return [] }
  async lookupByGtin() { return [] }
  async lookupByExternalId() { return null }
  normalize() { return null }
}
