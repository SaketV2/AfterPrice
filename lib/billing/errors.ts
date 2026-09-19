export class BillingConfigurationError extends Error {
  readonly code = 'BILLING_CONFIGURATION_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'BillingConfigurationError'
  }
}

export class BillingPersistenceError extends Error {
  readonly code: string = 'BILLING_PERSISTENCE_ERROR'

  constructor(message: string) {
    super(message)
    this.name = 'BillingPersistenceError'
  }
}
