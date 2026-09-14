import { PageIntro } from '@/components/dashboard/product-ui'
import { AlertList } from '@/components/alerts/alert-list'
import { getBaselines } from '@/features/afterprice/queries'
import { getAlerts } from '@/features/afterprice/queries'

export const metadata = { title: 'Alerts' }

export default async function AlertsPage() {
  const [records, alerts] = await Promise.all([getBaselines(), getAlerts()])
  return <><PageIntro title="Alerts" description="Review persisted changes and time-sensitive reminders while the information is still useful." /><AlertList alerts={alerts} records={records} /></>
}
