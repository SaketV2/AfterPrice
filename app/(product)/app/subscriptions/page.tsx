import Link from 'next/link'
import { CirclePlus } from 'lucide-react'
import { PageIntro } from '@/components/dashboard/product-ui'
import { SubscriptionList } from '@/components/subscriptions/subscription-list'
import { getBaselines } from '@/features/afterprice/queries'

export const metadata = { title: 'Subscriptions' }

export default async function SubscriptionsPage() {
  const records = (await getBaselines()).filter(record => record.baseline_type === 'subscription')
  return <><PageIntro title="Subscriptions" description="Track renewal dates, public plan changes and the cost you have actually agreed to pay." action={<Link href="/app/add?type=subscription" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add subscription</Link>} /><SubscriptionList records={records} /></>
}
