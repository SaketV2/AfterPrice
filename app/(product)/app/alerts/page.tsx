import { AlertList } from '@/components/alerts/alert-list'
import { PageIntro } from '@/components/dashboard/product-ui'

export default function AlertsPage() {
  return <><PageIntro eyebrow="Unified monitoring" title="Alerts" description="One queue for price drops, plan changes and renewal decisions. Resolve the ones you have handled." /><AlertList /></>
}

