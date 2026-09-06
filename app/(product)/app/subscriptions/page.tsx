import Link from 'next/link'
import { PageIntro } from '@/components/dashboard/product-ui'
import { SubscriptionList } from '@/components/subscriptions/subscription-list'

export default function SubscriptionsPage() {
  return <><PageIntro eyebrow="PlanGuard + RenewalAudit" title="Subscriptions" description="Track the price, terms and next renewal of the services you rely on." action={<Link href="/app/add?type=subscription" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]">Add subscription <span className="ml-2">+</span></Link>} /><SubscriptionList /></>
}

