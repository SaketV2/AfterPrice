import { notFound } from 'next/navigation'
import { deleteBaseline } from '@/features/baselines/actions'
import { ComparisonCard } from '@/features/baselines/comparison-card'
import { getBaseline } from '@/features/afterprice/queries'
import { PageIntro } from '@/components/dashboard/product-ui'
export default async function BaselineDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) { const record = await getBaseline((await params).id); if (!record) notFound(); const saved = (await searchParams).saved === '1'; return <><PageIntro title={record.display_name} description="Baseline, current observation, evidence and next action in one record." action={<form action={deleteBaseline}><input type="hidden" name="id" value={record.id} /><button className="min-h-11 rounded-xl px-4 text-sm font-bold text-[var(--danger)] hover:bg-[var(--danger-soft)]">Delete baseline</button></form>} />{saved && <p role="status" className="mb-5 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">Baseline saved in Supabase.</p>}<ComparisonCard record={record} /></> }
