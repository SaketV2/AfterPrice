import { OverviewDashboard } from '@/components/dashboard/overview-dashboard'
import { CheckoutClaim } from '@/components/billing/checkout-claim'
import { getBaselines } from '@/features/afterprice/queries'

export const metadata = { title: 'Inbox' }

export default async function AppOverviewPage() {
  return <><CheckoutClaim /><OverviewDashboard records={await getBaselines()} /></>
}
