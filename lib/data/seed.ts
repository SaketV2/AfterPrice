import type {
  Activity,
  Alert,
  PlanSnapshot,
  PotentialSaving,
  PriceSnapshot,
  Renewal,
  SpendGuardData,
  TrackedItem,
} from '@/lib/types'

const iso = (date: string) => new Date(date).toISOString()

const purchaseRows = [
  ['sony-wh1000xm6', 'Sony WH-1000XM6', 'Amazon', '2026-08-20', 349, 299, 50, 'Electronics'],
  ['dell-monitor', 'Dell 27-inch Monitor', 'Dell', '2026-07-12', 479, 449, 30, 'Electronics'],
  ['keychron-k8', 'Keychron K8 Mechanical Keyboard', 'Keychron', '2026-06-04', 139, 139, 0, 'Desk setup'],
  ['nike-pegasus', 'Nike Pegasus 41', 'Nike', '2026-08-29', 180, 159, 21, 'Fitness'],
  ['ergonomic-chair', 'Ergonomic Office Chair', 'Officeworks', '2026-05-19', 699, 649, 50, 'Desk setup'],
  ['sandisk-ssd', 'SanDisk Extreme Portable SSD', 'JB Hi-Fi', '2026-08-03', 189, 169, 20, 'Electronics'],
  ['logitech-webcam', 'Logitech Brio Webcam', 'Amazon', '2026-04-15', 249, 249, 0, 'Electronics'],
  ['rain-design-stand', 'Rain Design Laptop Stand', 'Apple', '2026-03-22', 89, 79, 10, 'Desk setup'],
  ['logitech-mx-master', 'Logitech MX Master 3S', 'Amazon', '2026-07-28', 169, 149, 20, 'Desk setup'],
  ['bellroy-backpack', 'Bellroy Transit Backpack', 'Bellroy', '2026-02-10', 279, 279, 0, 'Travel'],
] as const

const subscriptionRows = [
  ['chatgpt-plus', 'ChatGPT Plus', 'Plus', 'OpenAI', 30, 30, 'monthly', '2026-09-18', 0, 'AI tools'],
  ['notion-plus', 'Notion', 'Plus', 'Notion', 18, 14, 'monthly', '2026-09-21', 48, 'Productivity'],
  ['canva-pro', 'Canva', 'Pro', 'Canva', 22.99, 17.99, 'monthly', '2026-09-28', 60, 'Creative'],
  ['adobe-cc', 'Adobe Creative Cloud', 'All Apps', 'Adobe', 79.99, 69.99, 'monthly', '2026-10-04', 120, 'Creative'],
  ['spotify-premium', 'Spotify', 'Premium Individual', 'Spotify', 13.99, 13.99, 'monthly', '2026-09-14', 0, 'Entertainment'],
  ['google-one', 'Google One', '2 TB', 'Google', 16.99, 15.99, 'monthly', '2026-09-30', 12, 'Storage'],
  ['figma-pro', 'Figma', 'Professional', 'Figma', 20, 15, 'monthly', '2026-09-24', 60, 'Design'],
  ['nordvpn', 'NordVPN', 'Complete', 'Nord Security', 15.99, 12.99, 'monthly', '2026-09-26', 36, 'Security'],
  ['dropbox-plus', 'Dropbox', 'Plus', 'Dropbox', 19.99, 11.99, 'monthly', '2026-09-29', 96, 'Storage'],
  ['vercel-pro', 'Vercel', 'Pro', 'Vercel', 30, 20, 'monthly', '2026-09-12', 120, 'Development'],
] as const

const items: TrackedItem[] = [
  ...purchaseRows.map(([id, product, retailer, purchaseDate, paidPrice, currentPrice, claimAmount, category], index) => ({
    id,
    type: 'purchase' as const,
    title: product,
    subtitle: retailer,
    status: claimAmount > 0 ? 'action_available' as const : 'watching' as const,
    createdAt: iso(purchaseDate),
    updatedAt: iso(`2026-09-${String(6 - (index % 5)).padStart(2, '0')}`),
    purchase: {
      id: `p-${id}`,
      itemId: id,
      product,
      retailer,
      purchaseDate,
      paidPrice,
      currentPrice,
      claimAmount,
      claimDeadline: claimAmount > 0 ? '2026-09-10' : undefined,
      claimDaysRemaining: claimAmount > 0 ? 4 : undefined,
      status: claimAmount > 0 ? 'claim_available' as const : 'watching' as const,
      url: `https://example.com/products/${id}`,
      orderNumber: `SG-${String(81240 + index).padStart(6, '0')}`,
      category,
    },
  })),
  ...subscriptionRows.map(([id, service, plan, provider, currentPrice, originalPrice, billingCycle, nextRenewal, annualImpact, category], index) => ({
    id,
    type: 'subscription' as const,
    title: service,
    subtitle: `${plan} · ${provider}`,
    status: annualImpact > 0 ? (index % 2 === 0 ? 'price_increase' as const : 'plan_changed' as const) : (index === 0 ? 'renewing_soon' as const : 'stable' as const),
    createdAt: iso(`2026-01-${String(5 + index).padStart(2, '0')}`),
    updatedAt: iso(`2026-09-${String(2 + (index % 6)).padStart(2, '0')}`),
    subscription: {
      id: `s-${id}`,
      itemId: id,
      service,
      plan,
      provider,
      currentPrice,
      originalPrice,
      billingCycle,
      nextRenewal,
      annualImpact,
      status: annualImpact > 0 ? (index % 2 === 0 ? 'price_increase' as const : 'plan_changed' as const) : (index === 0 ? 'renewing_soon' as const : 'stable' as const),
      planUrl: `https://example.com/plans/${id}`,
      category,
    },
  })),
]

const snapshots: PriceSnapshot[] = []
purchaseRows.forEach(([id, , , purchaseDate, paidPrice, currentPrice]) => {
  const date = new Date(purchaseDate)
  ;[0, 1, 2, 3].forEach((offset) => {
    const capturedAt = new Date(date.getTime() + (offset * 12 + 1) * 86400000)
    const progress = offset / 3
    const price = offset === 3 ? currentPrice : Number((paidPrice - (paidPrice - currentPrice) * progress * 0.75).toFixed(2))
    snapshots.push({ id: `${id}-price-${offset}`, itemId: id, price, capturedAt: capturedAt.toISOString(), source: offset === 3 ? 'Current check' : 'Price history' })
  })
})

const benefitsById: Record<string, { original: PlanSnapshot['benefits']; current: PlanSnapshot['benefits'] }> = {
  'notion-plus': { original: { storage: '100 GB', projects: 'Unlimited', other: 'Unlimited guests' }, current: { storage: '50 GB', projects: 'Unlimited', other: '10 guests' } },
  'canva-pro': { original: { storage: '1 TB', exports: 'Unlimited', other: 'Brand kit' }, current: { storage: '1 TB', exports: 'Unlimited', other: 'Brand kit' } },
  'adobe-cc': { original: { storage: '100 GB', aiCredits: '500 / month', other: 'All apps' }, current: { storage: '100 GB', aiCredits: '250 / month', other: 'All apps' } },
  'figma-pro': { original: { projects: 'Unlimited', other: 'Team libraries' }, current: { projects: 'Unlimited', other: 'Team libraries' } },
  'dropbox-plus': { original: { storage: '2 TB', users: '1', other: '30-day recovery' }, current: { storage: '2 TB', users: '1', other: '30-day recovery' } },
}

const planSnapshots: PlanSnapshot[] = []
subscriptionRows.forEach(([id, , plan, , currentPrice, originalPrice]) => {
  const benefits = benefitsById[id] ?? { original: { storage: 'Standard', other: `${plan} benefits` }, current: { storage: 'Standard', other: `${plan} benefits` } }
  planSnapshots.push({ id: `${id}-plan-original`, itemId: id, price: originalPrice, capturedAt: iso('2026-01-10'), label: 'Original plan', benefits: benefits.original })
  planSnapshots.push({ id: `${id}-plan-current`, itemId: id, price: currentPrice, capturedAt: iso('2026-09-01'), label: 'Current plan', benefits: benefits.current })
})

const renewals: Renewal[] = subscriptionRows.map(([id, , , , currentPrice, originalPrice, billingCycle, nextRenewal], index) => ({
  id: `renewal-${id}`,
  itemId: id,
  date: nextRenewal,
  previousPrice: originalPrice,
  upcomingPrice: currentPrice,
  billingCycle,
  reviewed: index > 5,
}))

const alertDefinitions: Array<Omit<Alert, 'createdAt'> & { daysAgo: number }> = [
  { id: 'alert-sony-drop', itemId: 'sony-wh1000xm6', type: 'price_drop', priority: 'urgent', title: 'Price dropped by $50', description: 'Sony WH-1000XM6 is now listed below what you paid.', impact: 50, deadline: '4 days left', resolved: false, dismissed: false, daysAgo: 0 },
  { id: 'alert-dell-drop', itemId: 'dell-monitor', type: 'price_drop', priority: 'medium', title: 'Price dropped by $30', description: 'Your Dell monitor is now cheaper at the same retailer.', impact: 30, deadline: '12 days left', resolved: false, dismissed: false, daysAgo: 2 },
  { id: 'alert-notion-price', itemId: 'notion-plus', type: 'price_increase', priority: 'high', title: 'Notion price increased', description: 'Your monthly price moved from $14 to $18.', impact: 48, resolved: false, dismissed: false, daysAgo: 1 },
  { id: 'alert-notion-plan', itemId: 'notion-plus', type: 'plan_change', priority: 'high', title: 'Notion benefits changed', description: 'Storage reduced from 100 GB to 50 GB.', impact: 0, resolved: false, dismissed: false, daysAgo: 1 },
  { id: 'alert-adobe-plan', itemId: 'adobe-cc', type: 'plan_change', priority: 'medium', title: 'Adobe AI credits reduced', description: 'Your plan now includes 250 AI credits per month.', impact: 0, resolved: false, dismissed: false, daysAgo: 3 },
  { id: 'alert-adobe-price', itemId: 'adobe-cc', type: 'price_increase', priority: 'high', title: 'Adobe renewal will cost more', description: 'Upcoming renewal is $10 more per month.', impact: 120, deadline: '28 days left', resolved: false, dismissed: false, daysAgo: 3 },
  { id: 'alert-figma-price', itemId: 'figma-pro', type: 'price_increase', priority: 'medium', title: 'Figma price increased', description: 'Your monthly price moved from $15 to $20.', impact: 60, resolved: false, dismissed: false, daysAgo: 4 },
  { id: 'alert-vercel-renewal', itemId: 'vercel-pro', type: 'renewal_warning', priority: 'urgent', title: 'Vercel renews in 6 days', description: 'Review the upcoming $30 renewal before it processes.', impact: 120, deadline: '6 days left', resolved: false, dismissed: false, daysAgo: 0 },
  { id: 'alert-spotify-renewal', itemId: 'spotify-premium', type: 'renewal_warning', priority: 'low', title: 'Spotify renews soon', description: 'Your next renewal is on 14 September.', impact: 0, deadline: '8 days left', resolved: false, dismissed: false, daysAgo: 2 },
  { id: 'alert-google-renewal', itemId: 'google-one', type: 'renewal_warning', priority: 'low', title: 'Google One renews soon', description: 'Your next renewal is on 30 September.', impact: 12, deadline: '24 days left', resolved: false, dismissed: false, daysAgo: 4 },
  { id: 'alert-ssd-drop', itemId: 'sandisk-ssd', type: 'price_drop', priority: 'medium', title: 'Price dropped by $20', description: 'The SSD is now listed at $169.', impact: 20, deadline: '10 days left', resolved: false, dismissed: false, daysAgo: 5 },
  { id: 'alert-dropbox-plan', itemId: 'dropbox-plus', type: 'plan_change', priority: 'low', title: 'Dropbox plan reviewed', description: 'No material changes were detected in the latest snapshot.', impact: 0, resolved: true, dismissed: false, daysAgo: 7 },
]

const alerts: Alert[] = alertDefinitions.map(({ daysAgo, ...alert }) => ({ ...alert, createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString() }))

const activities: Activity[] = [
  { id: 'activity-1', type: 'price_drop', itemId: 'sony-wh1000xm6', title: 'Price drop found', description: 'Sony WH-1000XM6 is $50 below your purchase price.', createdAt: iso('2026-09-06T08:30:00Z') },
  { id: 'activity-2', type: 'price_increase', itemId: 'notion-plus', title: 'Price change detected', description: 'Notion Plus increased by $4 per month.', createdAt: iso('2026-09-05T11:00:00Z') },
  { id: 'activity-3', type: 'added', itemId: 'sandisk-ssd', title: 'Purchase added', description: 'SanDisk Extreme Portable SSD is now being watched.', createdAt: iso('2026-09-03T09:20:00Z') },
  { id: 'activity-4', type: 'plan_change', itemId: 'adobe-cc', title: 'Plan change detected', description: 'Adobe AI credits changed from 500 to 250 per month.', createdAt: iso('2026-09-03T06:40:00Z') },
  { id: 'activity-5', type: 'renewal_warning', itemId: 'vercel-pro', title: 'Renewal approaching', description: 'Vercel Pro renews in 6 days.', createdAt: iso('2026-09-02T15:10:00Z') },
]

const potentialSavings: PotentialSaving[] = [
  { id: 'saving-sony', itemId: 'sony-wh1000xm6', label: 'Claim opportunity', amount: 50, period: 'one_off', status: 'open' },
  { id: 'saving-dell', itemId: 'dell-monitor', label: 'Claim opportunity', amount: 30, period: 'one_off', status: 'open' },
  { id: 'saving-notion', itemId: 'notion-plus', label: 'Annual price impact', amount: 48, period: 'annual', status: 'open' },
  { id: 'saving-adobe', itemId: 'adobe-cc', label: 'Annual renewal impact', amount: 120, period: 'annual', status: 'open' },
  { id: 'saving-figma', itemId: 'figma-pro', label: 'Annual price impact', amount: 60, period: 'annual', status: 'open' },
  { id: 'saving-vercel', itemId: 'vercel-pro', label: 'Annual renewal impact', amount: 120, period: 'annual', status: 'open' },
]

export const SEED_DATA: SpendGuardData = {
  user: { id: 'demo-user', name: 'Alex Morgan', email: 'Not connected', initials: 'AM' },
  items,
  priceSnapshots: snapshots,
  planSnapshots,
  renewals,
  alerts,
  documents: [],
  activities,
  potentialSavings,
  settings: { priceAlerts: true, planChangeAlerts: true, renewalWarnings: true, weeklySummary: true, theme: 'light' },
}

export function cloneSeedData(): SpendGuardData {
  return JSON.parse(JSON.stringify(SEED_DATA)) as SpendGuardData
}
