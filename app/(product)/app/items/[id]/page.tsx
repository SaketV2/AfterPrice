import { redirect } from 'next/navigation'
export default async function LegacyItemPage({ params }: { params: Promise<{ id: string }> }) { redirect(`/app/baselines/${(await params).id}`) }
