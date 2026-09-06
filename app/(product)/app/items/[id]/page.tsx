import { ItemDetail } from '@/components/dashboard/item-detail'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ItemDetail itemId={id} />
}

