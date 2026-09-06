export type ItemType = 'purchase' | 'subscription'

export type AlertType = 'price_drop' | 'price_increase' | 'plan_change' | 'renewal_warning'

export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ItemStatus =
  | 'watching'
  | 'action_available'
  | 'stable'
  | 'expired'
  | 'resolved'
  | 'price_increase'
  | 'plan_changed'
  | 'renewing_soon'
  | 'cancelled'

export type PurchaseStatus = 'watching' | 'claim_available' | 'claimed' | 'expired'

export type SubscriptionStatus = 'stable' | 'price_increase' | 'plan_changed' | 'renewing_soon' | 'cancelled'

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'annual'

export type ActivityType = 'added' | 'price_drop' | 'price_increase' | 'plan_change' | 'renewal_warning' | 'alert_resolved' | 'alert_dismissed' | 'claimed'

export interface User {
  id: string
  name: string
  email: string
  initials: string
  avatarUrl?: string
}

export interface PriceSnapshot {
  id: string
  itemId: string
  price: number
  capturedAt: string
  source?: string
  note?: string
}

export interface PlanBenefits {
  [key: string]: string | undefined
  storage?: string
  users?: string
  exports?: string
  aiCredits?: string
  projects?: string
  other?: string
}

export interface PlanSnapshot {
  id: string
  itemId: string
  price: number
  capturedAt: string
  benefits: PlanBenefits
  label?: string
}

export interface Renewal {
  id: string
  itemId: string
  date: string
  previousPrice: number
  upcomingPrice: number
  billingCycle: BillingCycle
  reviewed: boolean
}

export interface Purchase {
  id: string
  itemId: string
  product: string
  retailer: string
  purchaseDate: string
  paidPrice: number
  currentPrice: number
  claimAmount: number
  claimDeadline?: string
  claimDaysRemaining?: number
  status: PurchaseStatus
  url?: string
  orderNumber?: string
  category: string
}

export interface Subscription {
  id: string
  itemId: string
  service: string
  plan: string
  provider: string
  currentPrice: number
  originalPrice: number
  billingCycle: BillingCycle
  nextRenewal: string
  annualImpact: number
  status: SubscriptionStatus
  planUrl?: string
  category: string
}

export interface TrackedItem {
  id: string
  type: ItemType
  title: string
  subtitle: string
  status: ItemStatus
  createdAt: string
  updatedAt: string
  purchase?: Purchase
  subscription?: Subscription
}

export interface Alert {
  id: string
  itemId: string
  type: AlertType
  priority: AlertPriority
  title: string
  description: string
  impact?: number
  deadline?: string
  createdAt: string
  resolved: boolean
  dismissed: boolean
}

export interface Document {
  id: string
  itemId?: string
  name: string
  type: 'receipt' | 'plan_terms' | 'screenshot' | 'other'
  size?: string
  uploadedAt: string
  status: 'uploaded' | 'processing' | 'ready'
}

export interface Activity {
  id: string
  type: ActivityType
  itemId?: string
  title: string
  description: string
  createdAt: string
}

export interface PotentialSaving {
  id: string
  itemId: string
  label: string
  amount: number
  period?: 'one_off' | 'monthly' | 'annual'
  status: 'open' | 'claimed' | 'dismissed'
}

export interface DemoSettings {
  priceAlerts: boolean
  planChangeAlerts: boolean
  renewalWarnings: boolean
  weeklySummary: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface SpendGuardData {
  user: User
  items: TrackedItem[]
  priceSnapshots: PriceSnapshot[]
  planSnapshots: PlanSnapshot[]
  renewals: Renewal[]
  alerts: Alert[]
  documents: Document[]
  activities: Activity[]
  potentialSavings: PotentialSaving[]
  settings: DemoSettings
}
