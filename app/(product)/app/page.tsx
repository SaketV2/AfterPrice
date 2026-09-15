import { OverviewDashboard } from '@/components/dashboard/overview-dashboard'
import { getBaselines } from '@/features/afterprice/queries'

export const metadata = { title: 'Inbox' }

export default async function AppOverviewPage() {
  return <OverviewDashboard records={await getBaselines()} />
}
