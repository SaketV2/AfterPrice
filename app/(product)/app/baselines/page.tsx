import Link from 'next/link'
import { PageIntro } from '@/components/dashboard/product-ui'
import { getBaselines } from '@/features/afterprice/queries'
import { BaselineList } from '@/features/baselines/baseline-list'
export default async function BaselinesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) { const type = (await searchParams).type; const records = (await getBaselines()).filter(record => type === 'purchase' || type === 'subscription' ? record.baseline_type === type : true); return <><PageIntro title="Saved baselines" description="Original purchase and subscription records, compared only with compatible stored observations." action={<Link href="/app/baselines/new" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-sm font-bold text-[hsl(var(--accent-foreground))]">Add baseline</Link>} /><BaselineList records={records} /></> }
