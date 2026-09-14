import Link from 'next/link'
import type { BaselineRecord } from '@/features/afterprice/types'
import { ComparisonCard } from './comparison-card'
import { EmptyState } from '@/components/dashboard/product-ui'
export function BaselineList({ records }: { records: BaselineRecord[] }) { if (!records.length) return <EmptyState title="No baselines yet" description="Save a purchase or subscription to create your first comparison record." action={<Link href="/app/baselines/new" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white">Add baseline</Link>} />; return <div className="space-y-4">{records.map(record => <ComparisonCard key={record.id} record={record} compact />)}</div> }
