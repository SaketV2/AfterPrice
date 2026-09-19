export function checkoutIdempotencyKey(attemptId: string): string {
  return `afterprice_checkout_${attemptId}`
}
