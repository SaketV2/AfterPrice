import Link from 'next/link'
import { CirclePlus } from 'lucide-react'
import { PageIntro } from '@/components/dashboard/product-ui'
import { PurchaseList } from '@/components/purchases/purchase-list'
import { getBaselines } from '@/features/afterprice/queries'

export const metadata = { title: 'Purchases' }

export default async function PurchasesPage() {
  const records = (await getBaselines()).filter(record => record.baseline_type === 'purchase')
  return <><PageIntro title="Purchases" description="Keep an eye on the prices that matter after you have already paid." action={<Link href="/app/add?type=purchase" className="inline-flex min-h-11 items-center gap-2 rounded-input bg-accent px-4 text-sm font-bold text-white hover:bg-[hsl(var(--accent-hover))]"><CirclePlus className="h-4 w-4" />Add purchase</Link>} /><PurchaseList records={records} /></>
}
