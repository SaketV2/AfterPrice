import Link from 'next/link'
import { PageIntro } from '@/components/dashboard/product-ui'
import { PurchaseList } from '@/components/purchases/purchase-list'

export default function PurchasesPage() {
  return <><PageIntro eyebrow="PriceClaim" title="Purchases" description="Keep an eye on the prices that matter after you have already paid." action={<Link href="/app/add?type=purchase" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]">Add purchase <span className="ml-2">+</span></Link>} /><PurchaseList /></>
}

