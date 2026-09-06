'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cloneSeedData } from '@/lib/data/seed'
import type { Alert, BillingCycle, DemoSettings, Document, SpendGuardData, SubscriptionStatus, TrackedItem } from '@/lib/types'

const STORAGE_KEY = 'spendguard-demo-v1'

interface SpendGuardStore {
  data: SpendGuardData
  hydrated: boolean
  addPurchase: (input: { product: string; retailer: string; amount: number; purchaseDate: string; url?: string; orderNumber?: string }) => string
  addSubscription: (input: { service: string; plan: string; price: number; billingCycle: BillingCycle; renewalDate: string; planUrl?: string }) => string
  addDocument: (document: Document) => void
  updateAlert: (alertId: string, update: Partial<Pick<Alert, 'resolved' | 'dismissed'>>) => void
  updateSubscriptionStatus: (itemId: string, status: SubscriptionStatus) => void
  updateSettings: (settings: Partial<DemoSettings>) => void
  resetDemo: () => void
}

const StoreContext = createContext<SpendGuardStore | null>(null)

const persist = (next: SpendGuardData) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function SpendGuardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SpendGuardData>(() => cloneSeedData())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved) setData(JSON.parse(saved) as SpendGuardData)
      } catch {
        // Corrupt demo data should never prevent the app loading.
        window.localStorage.removeItem(STORAGE_KEY)
      } finally {
        setHydrated(true)
      }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (hydrated) persist(data)
  }, [data, hydrated])

  const update = useCallback((change: (current: SpendGuardData) => SpendGuardData) => {
    setData((current) => change(current))
  }, [])

  const addPurchase = useCallback((input: { product: string; retailer: string; amount: number; purchaseDate: string; url?: string; orderNumber?: string }) => {
    const id = `purchase-${Date.now()}`
    const item: TrackedItem = {
      id,
      type: 'purchase',
      title: input.product,
      subtitle: input.retailer,
      status: 'watching',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      purchase: {
        id: `p-${id}`,
        itemId: id,
        product: input.product,
        retailer: input.retailer,
        purchaseDate: input.purchaseDate,
        paidPrice: input.amount,
        currentPrice: input.amount,
        claimAmount: 0,
        status: 'watching',
        url: input.url,
        orderNumber: input.orderNumber,
        category: 'Other',
      },
    }
    update((current) => ({
      ...current,
      items: [item, ...current.items],
      activities: [{ id: `activity-${Date.now()}`, type: 'added', itemId: id, title: 'Purchase added', description: `${input.product} is now being watched.`, createdAt: new Date().toISOString() }, ...current.activities],
    }))
    return id
  }, [update])

  const addSubscription = useCallback((input: { service: string; plan: string; price: number; billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'annual'; renewalDate: string; planUrl?: string }) => {
    const id = `subscription-${Date.now()}`
    const item: TrackedItem = {
      id,
      type: 'subscription',
      title: input.service,
      subtitle: `${input.plan} · Added just now`,
      status: 'stable',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        id: `s-${id}`,
        itemId: id,
        service: input.service,
        plan: input.plan,
        provider: input.service,
        currentPrice: input.price,
        originalPrice: input.price,
        billingCycle: input.billingCycle,
        nextRenewal: input.renewalDate,
        annualImpact: 0,
        status: 'stable',
        planUrl: input.planUrl,
        category: 'Other',
      },
    }
    update((current) => ({
      ...current,
      items: [item, ...current.items],
      renewals: [{ id: `renewal-${id}`, itemId: id, date: input.renewalDate, previousPrice: input.price, upcomingPrice: input.price, billingCycle: input.billingCycle, reviewed: false }, ...current.renewals],
      planSnapshots: [{ id: `${id}-plan-original`, itemId: id, price: input.price, capturedAt: new Date().toISOString(), label: 'Original plan', benefits: {} }, ...current.planSnapshots],
      activities: [{ id: `activity-${Date.now()}`, type: 'added', itemId: id, title: 'Subscription added', description: `${input.service} is now being watched.`, createdAt: new Date().toISOString() }, ...current.activities],
    }))
    return id
  }, [update])

  const addDocument = useCallback((document: Document) => update((current) => ({ ...current, documents: [document, ...current.documents] })), [update])
  const updateAlert = useCallback((alertId: string, change: Partial<Pick<Alert, 'resolved' | 'dismissed'>>) => update((current) => ({
    ...current,
    alerts: current.alerts.map((alert) => alert.id === alertId ? { ...alert, ...change } : alert),
    activities: change.resolved || change.dismissed ? [{ id: `activity-${Date.now()}`, type: change.resolved ? 'alert_resolved' : 'alert_dismissed', itemId: current.alerts.find((alert) => alert.id === alertId)?.itemId, title: change.resolved ? 'Alert resolved' : 'Alert dismissed', description: 'The alert was updated in your monitor.', createdAt: new Date().toISOString() }, ...current.activities] : current.activities,
  })), [update])
  const updateSubscriptionStatus = useCallback((itemId: string, status: SubscriptionStatus) => update((current) => ({
    ...current,
    items: current.items.map((item) => item.id === itemId && item.subscription ? { ...item, status: status === 'cancelled' ? 'resolved' : item.status, subscription: { ...item.subscription, status } } : item),
  })), [update])
  const updateSettings = useCallback((settings: Partial<DemoSettings>) => update((current) => ({ ...current, settings: { ...current.settings, ...settings } })), [update])
  const resetDemo = useCallback(() => setData(cloneSeedData()), [])

  const value = useMemo(() => ({ data, hydrated, addPurchase, addSubscription, addDocument, updateAlert, updateSubscriptionStatus, updateSettings, resetDemo }), [data, hydrated, addPurchase, addSubscription, addDocument, updateAlert, updateSubscriptionStatus, updateSettings, resetDemo])
  return (
    <StoreContext.Provider value={value}>
      {hydrated ? children : (
        <div className="grid min-h-screen place-items-center bg-[#F6F6F3] px-5 text-[#0C0F14]">
          <div aria-live="polite" className="rounded-[20px] border border-[#E1E5EA] bg-white px-6 py-5 text-sm font-semibold shadow-[0_12px_36px_rgba(12,15,20,0.05)]">
            Opening your SpendGuard monitor…
          </div>
        </div>
      )}
    </StoreContext.Provider>
  )
}

export function useSpendGuardStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useSpendGuardStore must be used within SpendGuardProvider')
  return context
}
