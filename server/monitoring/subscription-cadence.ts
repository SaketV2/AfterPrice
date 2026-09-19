export function isSubscriptionObservationDue(lastObservedAt: string | null | undefined, now = new Date(), intervalMinutes = 1_440): boolean {
  if (!lastObservedAt) return true
  const timestamp = Date.parse(lastObservedAt)
  return Number.isNaN(timestamp) || now.getTime() - timestamp >= intervalMinutes * 60_000
}
