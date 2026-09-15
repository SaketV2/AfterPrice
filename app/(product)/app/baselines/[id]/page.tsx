import { notFound } from 'next/navigation'
import { deleteBaseline } from '@/features/baselines/actions'
import { getBaseline } from '@/features/afterprice/queries'
import { TrackedItemDetail } from '@/components/dashboard/tracked-item-detail'
import { PageIntro } from '@/components/dashboard/product-ui'

export default async function BaselineDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const record = await getBaseline((await params).id)
  if (!record) notFound()
  const saved = (await searchParams).saved === '1'
  return <>
    <PageIntro title="Tracked item" description="Identity, baseline, evidence, timing and the next useful action in one record." action={<form action={deleteBaseline}><input type="hidden" name="id" value={record.id} /><button className="min-h-11 rounded-input px-4 text-sm font-bold text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger-soft))]">Delete baseline</button></form>} />
    {saved && <p role="status" className="mb-5 rounded-input bg-[hsl(var(--success-soft))] px-4 py-3 text-sm font-semibold text-[hsl(var(--success))]">Baseline saved in Supabase.</p>}
    <TrackedItemDetail record={record} />
  </>
}
